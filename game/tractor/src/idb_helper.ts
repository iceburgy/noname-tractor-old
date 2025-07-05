import { ReplayEntity } from './replay_entity.js';
export class IDBHelper {
    constructor() {
    }

    /*
    how to check usage:
    navigator.storage.estimate().then((data)=>console.log(data))
    roughly 20K per replay record
    */

    public static LocalIDB: any
    public static ReplayEntityStore = 'ReplayEntityStore'
    public static Key_datetime = 'datetime'
    public static replaySeparator = "===";
    public static maxReplays: number = 1000;
    public static AvatarResourcesStore = 'AvatarResourcesStore'
    public static AvatarResourcesIndex = 'AvatarResourcesIndex'
    public static AvatarResourcesDataUrl = 'AvatarResourcesDataUrl'

    public static InitIDB(callback: any): any {
        let dbReq = indexedDB.open('localDB', 2);
        dbReq.onupgradeneeded = function (event: any) {
            if (event && event.target) {
                IDBHelper.LocalIDB = event.target.result;
            }

            if (!IDBHelper.LocalIDB.objectStoreNames.contains(IDBHelper.ReplayEntityStore)) {
                let res = IDBHelper.LocalIDB.createObjectStore(IDBHelper.ReplayEntityStore, { keyPath: IDBHelper.Key_datetime });

                if (!res.indexNames.contains(IDBHelper.Key_datetime)) {
                    res.createIndex(IDBHelper.Key_datetime, IDBHelper.Key_datetime);
                }
            }

            if (!IDBHelper.LocalIDB.objectStoreNames.contains(IDBHelper.AvatarResourcesStore)) {
                let resAvatar = IDBHelper.LocalIDB.createObjectStore(IDBHelper.AvatarResourcesStore, { keyPath: IDBHelper.AvatarResourcesIndex });

                if (!resAvatar.indexNames.contains(IDBHelper.AvatarResourcesIndex)) {
                    resAvatar.createIndex(IDBHelper.AvatarResourcesIndex, IDBHelper.AvatarResourcesIndex);
                }
            }
        }
        dbReq.onsuccess = function (event: any) {
            if (event && event.target) {
                IDBHelper.LocalIDB = event.target.result;
                callback.apply();
            }
        }
        dbReq.onerror = function (event) {
            console.log('error opening database');
            console.log(event);
        }
    }

    public static CleanupReplayEntity(callbackFunc: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readwrite');
        let store = tx.objectStore(IDBHelper.ReplayEntityStore);
        tx.oncomplete = function () { }
        tx.onerror = function (event: any) {
            console.log('error CleanupReplayEntity');
            console.log(event);
        }

        let index = store.index(IDBHelper.Key_datetime);
        let getAllKeysRequest = index.getAllKeys(undefined);
        getAllKeysRequest.onsuccess = function () {
            let clearReq = store.clear();
            clearReq.onsuccess = function () {
                callbackFunc.apply();
            }
        }
        getAllKeysRequest.onerror = function (event: any) {
            console.log('error in CleanupReplayEntity getAllKeysRequest');
            console.log(event);
        }
    }

    public static SaveReplayEntity(replayState: ReplayEntity, callback: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readwrite');
        let store = tx.objectStore(IDBHelper.ReplayEntityStore);
        tx.oncomplete = function () { }
        tx.onerror = function (event: any) {
            console.log('error SaveReplayEntity');
            console.log(event);
        }

        var req = store.count();
        req.onsuccess = function () {
            let numToRemove: number = req.result - IDBHelper.maxReplays + 1;
            if (-2 <= numToRemove && numToRemove <= 0) {
                alert(`录像文件存储数即将饱和，已存储录像数：${req.result}，最多录像个数上限（可在设置界面中更改）：${IDBHelper.maxReplays}。临时处理方法：在设置界面中增加录像个数上限。建议处理方法：在设置界面中先导出所有录像至本地文件，然后清空所有录像。否则系统将自动覆盖最旧的录像`);
            }
            if (numToRemove > 0) {
                let index = store.index(IDBHelper.Key_datetime);
                let getAllKeysRequest = index.getAllKeys(undefined, numToRemove);
                getAllKeysRequest.onsuccess = function () {
                    let lowerRange = getAllKeysRequest.result[0];
                    let upperRange = getAllKeysRequest.result[getAllKeysRequest.result.length - 1];
                    let deleteRange = IDBKeyRange.bound(lowerRange, upperRange)
                    store.delete(deleteRange)
                    IDBHelper.SaveReplayEntityWorker(replayState, store, callback);
                }
                getAllKeysRequest.onerror = function (event: any) {
                    console.log('error in getAllKeysRequest');
                    console.log(event);
                }
            } else {
                IDBHelper.SaveReplayEntityWorker(replayState, store, callback);
            }
        }
        req.onerror = function (event: any) {
            console.log('error in count db store');
            console.log(event);
        }
    }

    public static GetReplayCount(divReplayCount: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readwrite');
        let store = tx.objectStore(IDBHelper.ReplayEntityStore);
        tx.oncomplete = function () { }
        tx.onerror = function (event: any) {
            console.log('error SaveReplayEntity');
            console.log(event);
        }

        var req = store.count();
        req.onsuccess = function () {
            divReplayCount.innerText = req.result;
        }
        req.onerror = function (event: any) {
            console.log('error in GetReplayCount');
            console.log(event);
        }
    }

    public static SaveReplayEntityWorker(replayState: ReplayEntity, store: any, callback: any) {
        let re = { datetime: replayState.ReplayId, text: JSON.stringify(replayState) };
        var req = store.add(re);
        req.onerror = function (event: any) {
            console.log('error in adding entry to store');
            console.log(event);
        }
        req.onsuccess = function () {
            callback.apply();
        }
    }

    public static ReadReplayEntityAll(callback: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readonly');
        let store = tx.objectStore(IDBHelper.ReplayEntityStore);
        let index = store.index(IDBHelper.Key_datetime);
        let req = index.openCursor();

        let dtList: string[] = []
        req.onsuccess = function (event: any) {
            let cursor = event.target.result;
            if (cursor != null) {
                dtList.push(cursor.key)
                cursor.continue();
            } else {
                callback(dtList)
            }
        }
        req.onerror = function (event: any) {
            console.log('error in ReadReplayEntityAll');
            console.log(event);
        }
    }

    public static ReadReplayEntityByDate(dateString: string, callback: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readonly');
        let store = tx.objectStore(IDBHelper.ReplayEntityStore);
        let index = store.index(IDBHelper.Key_datetime);
        let keyRange = IDBKeyRange.bound(dateString, dateString + '\uffff')
        let req = index.openCursor(keyRange);

        let reList: ReplayEntity[] = []
        req.onsuccess = function (event: any) {
            let cursor = event.target.result;
            if (cursor != null) {
                const re = JSON.parse(cursor.value.text)
                let temp = new ReplayEntity();
                temp.CloneFrom(re)
                reList.push(temp)
                cursor.continue();
            } else {
                callback(reList)
            }
        }
        req.onerror = function (event: any) {
            console.log('error in ReadReplayEntityByDate');
            console.log(event);
        }
    }

    public static CleanupAvatarResources(callbackFunc: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.AvatarResourcesStore], 'readwrite');
        let store = tx.objectStore(IDBHelper.AvatarResourcesStore);
        tx.oncomplete = function () { }
        tx.onerror = function (event: any) {
            console.log('error CleanupAvatarResources');
            console.log(event);
        }

        let index = store.index(IDBHelper.AvatarResourcesIndex);
        let getAllKeysRequest = index.getAllKeys(undefined);
        getAllKeysRequest.onsuccess = function () {
            let clearReq = store.clear();
            clearReq.onsuccess = function () {
                callbackFunc.apply();
            }
        }
        getAllKeysRequest.onerror = function (event: any) {
            console.log('error in CleanupAvatarResources getAllKeysRequest');
            console.log(event);
        }
    }

    public static SaveAvatarResources(avatarResources: any, callback: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.AvatarResourcesStore], 'readwrite');
        let store = tx.objectStore(IDBHelper.AvatarResourcesStore);
        tx.oncomplete = function () { }
        tx.onerror = function (event: any) {
            console.log('error SaveAvatarResources');
            console.log(event);
        }
        let re = { AvatarResourcesIndex: IDBHelper.AvatarResourcesDataUrl, text: JSON.stringify(avatarResources) };
        var req = store.add(re);
        req.onerror = function (event: any) {
            console.log('error in SaveAvatarResources');
            console.log(event);
        }
        req.onsuccess = function () {
            callback.apply();
        }
    }

    public static ReadAvatarResources(callback: any) {
        let tx = IDBHelper.LocalIDB.transaction([IDBHelper.AvatarResourcesStore], 'readonly');
        let store = tx.objectStore(IDBHelper.AvatarResourcesStore);
        let index = store.index(IDBHelper.AvatarResourcesIndex);
        let keyRange = IDBKeyRange.bound(IDBHelper.AvatarResourcesDataUrl, IDBHelper.AvatarResourcesDataUrl + '\uffff')
        let req = index.openCursor(keyRange);

        let avatarResourcesObj: any;
        req.onsuccess = function (event: any) {
            let cursor = event.target.result;
            if (cursor != null) {
                avatarResourcesObj = JSON.parse(cursor.value.text)
                cursor.continue();
            } else {
                callback(avatarResourcesObj)
            }
        }
        req.onerror = function (event: any) {
            console.log('error in ReadAvatarResources');
            console.log(event);
        }
    }
}
