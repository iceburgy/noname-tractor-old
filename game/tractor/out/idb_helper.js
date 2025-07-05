import { ReplayEntity } from './replay_entity.js';
export var IDBHelper = /** @class */ (function () {
    function IDBHelper() {
    }
    IDBHelper.InitIDB = function (callback) {
        var dbReq = indexedDB.open('localDB', 2);
        dbReq.onupgradeneeded = function (event) {
            if (event && event.target) {
                IDBHelper.LocalIDB = event.target.result;
            }
            if (!IDBHelper.LocalIDB.objectStoreNames.contains(IDBHelper.ReplayEntityStore)) {
                var res = IDBHelper.LocalIDB.createObjectStore(IDBHelper.ReplayEntityStore, { keyPath: IDBHelper.Key_datetime });
                if (!res.indexNames.contains(IDBHelper.Key_datetime)) {
                    res.createIndex(IDBHelper.Key_datetime, IDBHelper.Key_datetime);
                }
            }
            if (!IDBHelper.LocalIDB.objectStoreNames.contains(IDBHelper.AvatarResourcesStore)) {
                var resAvatar = IDBHelper.LocalIDB.createObjectStore(IDBHelper.AvatarResourcesStore, { keyPath: IDBHelper.AvatarResourcesIndex });
                if (!resAvatar.indexNames.contains(IDBHelper.AvatarResourcesIndex)) {
                    resAvatar.createIndex(IDBHelper.AvatarResourcesIndex, IDBHelper.AvatarResourcesIndex);
                }
            }
        };
        dbReq.onsuccess = function (event) {
            if (event && event.target) {
                IDBHelper.LocalIDB = event.target.result;
                callback.apply();
            }
        };
        dbReq.onerror = function (event) {
            console.log('error opening database');
            console.log(event);
        };
    };
    IDBHelper.CleanupReplayEntity = function (callbackFunc) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readwrite');
        var store = tx.objectStore(IDBHelper.ReplayEntityStore);
        tx.oncomplete = function () { };
        tx.onerror = function (event) {
            console.log('error CleanupReplayEntity');
            console.log(event);
        };
        var index = store.index(IDBHelper.Key_datetime);
        var getAllKeysRequest = index.getAllKeys(undefined);
        getAllKeysRequest.onsuccess = function () {
            var clearReq = store.clear();
            clearReq.onsuccess = function () {
                callbackFunc.apply();
            };
        };
        getAllKeysRequest.onerror = function (event) {
            console.log('error in CleanupReplayEntity getAllKeysRequest');
            console.log(event);
        };
    };
    IDBHelper.SaveReplayEntity = function (replayState, callback) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readwrite');
        var store = tx.objectStore(IDBHelper.ReplayEntityStore);
        tx.oncomplete = function () { };
        tx.onerror = function (event) {
            console.log('error SaveReplayEntity');
            console.log(event);
        };
        var req = store.count();
        req.onsuccess = function () {
            var numToRemove = req.result - IDBHelper.maxReplays + 1;
            if (-2 <= numToRemove && numToRemove <= 0) {
                alert("\u5F55\u50CF\u6587\u4EF6\u5B58\u50A8\u6570\u5373\u5C06\u9971\u548C\uFF0C\u5DF2\u5B58\u50A8\u5F55\u50CF\u6570\uFF1A".concat(req.result, "\uFF0C\u6700\u591A\u5F55\u50CF\u4E2A\u6570\u4E0A\u9650\uFF08\u53EF\u5728\u8BBE\u7F6E\u754C\u9762\u4E2D\u66F4\u6539\uFF09\uFF1A").concat(IDBHelper.maxReplays, "\u3002\u4E34\u65F6\u5904\u7406\u65B9\u6CD5\uFF1A\u5728\u8BBE\u7F6E\u754C\u9762\u4E2D\u589E\u52A0\u5F55\u50CF\u4E2A\u6570\u4E0A\u9650\u3002\u5EFA\u8BAE\u5904\u7406\u65B9\u6CD5\uFF1A\u5728\u8BBE\u7F6E\u754C\u9762\u4E2D\u5148\u5BFC\u51FA\u6240\u6709\u5F55\u50CF\u81F3\u672C\u5730\u6587\u4EF6\uFF0C\u7136\u540E\u6E05\u7A7A\u6240\u6709\u5F55\u50CF\u3002\u5426\u5219\u7CFB\u7EDF\u5C06\u81EA\u52A8\u8986\u76D6\u6700\u65E7\u7684\u5F55\u50CF"));
            }
            if (numToRemove > 0) {
                var index = store.index(IDBHelper.Key_datetime);
                var getAllKeysRequest_1 = index.getAllKeys(undefined, numToRemove);
                getAllKeysRequest_1.onsuccess = function () {
                    var lowerRange = getAllKeysRequest_1.result[0];
                    var upperRange = getAllKeysRequest_1.result[getAllKeysRequest_1.result.length - 1];
                    var deleteRange = IDBKeyRange.bound(lowerRange, upperRange);
                    store.delete(deleteRange);
                    IDBHelper.SaveReplayEntityWorker(replayState, store, callback);
                };
                getAllKeysRequest_1.onerror = function (event) {
                    console.log('error in getAllKeysRequest');
                    console.log(event);
                };
            }
            else {
                IDBHelper.SaveReplayEntityWorker(replayState, store, callback);
            }
        };
        req.onerror = function (event) {
            console.log('error in count db store');
            console.log(event);
        };
    };
    IDBHelper.GetReplayCount = function (divReplayCount) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readwrite');
        var store = tx.objectStore(IDBHelper.ReplayEntityStore);
        tx.oncomplete = function () { };
        tx.onerror = function (event) {
            console.log('error SaveReplayEntity');
            console.log(event);
        };
        var req = store.count();
        req.onsuccess = function () {
            divReplayCount.innerText = req.result;
        };
        req.onerror = function (event) {
            console.log('error in GetReplayCount');
            console.log(event);
        };
    };
    IDBHelper.SaveReplayEntityWorker = function (replayState, store, callback) {
        var re = { datetime: replayState.ReplayId, text: JSON.stringify(replayState) };
        var req = store.add(re);
        req.onerror = function (event) {
            console.log('error in adding entry to store');
            console.log(event);
        };
        req.onsuccess = function () {
            callback.apply();
        };
    };
    IDBHelper.ReadReplayEntityAll = function (callback) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readonly');
        var store = tx.objectStore(IDBHelper.ReplayEntityStore);
        var index = store.index(IDBHelper.Key_datetime);
        var req = index.openCursor();
        var dtList = [];
        req.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor != null) {
                dtList.push(cursor.key);
                cursor.continue();
            }
            else {
                callback(dtList);
            }
        };
        req.onerror = function (event) {
            console.log('error in ReadReplayEntityAll');
            console.log(event);
        };
    };
    IDBHelper.ReadReplayEntityByDate = function (dateString, callback) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.ReplayEntityStore], 'readonly');
        var store = tx.objectStore(IDBHelper.ReplayEntityStore);
        var index = store.index(IDBHelper.Key_datetime);
        var keyRange = IDBKeyRange.bound(dateString, dateString + '\uffff');
        var req = index.openCursor(keyRange);
        var reList = [];
        req.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor != null) {
                var re = JSON.parse(cursor.value.text);
                var temp = new ReplayEntity();
                temp.CloneFrom(re);
                reList.push(temp);
                cursor.continue();
            }
            else {
                callback(reList);
            }
        };
        req.onerror = function (event) {
            console.log('error in ReadReplayEntityByDate');
            console.log(event);
        };
    };
    IDBHelper.CleanupAvatarResources = function (callbackFunc) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.AvatarResourcesStore], 'readwrite');
        var store = tx.objectStore(IDBHelper.AvatarResourcesStore);
        tx.oncomplete = function () { };
        tx.onerror = function (event) {
            console.log('error CleanupAvatarResources');
            console.log(event);
        };
        var index = store.index(IDBHelper.AvatarResourcesIndex);
        var getAllKeysRequest = index.getAllKeys(undefined);
        getAllKeysRequest.onsuccess = function () {
            var clearReq = store.clear();
            clearReq.onsuccess = function () {
                callbackFunc.apply();
            };
        };
        getAllKeysRequest.onerror = function (event) {
            console.log('error in CleanupAvatarResources getAllKeysRequest');
            console.log(event);
        };
    };
    IDBHelper.SaveAvatarResources = function (avatarResources, callback) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.AvatarResourcesStore], 'readwrite');
        var store = tx.objectStore(IDBHelper.AvatarResourcesStore);
        tx.oncomplete = function () { };
        tx.onerror = function (event) {
            console.log('error SaveAvatarResources');
            console.log(event);
        };
        var re = { AvatarResourcesIndex: IDBHelper.AvatarResourcesDataUrl, text: JSON.stringify(avatarResources) };
        var req = store.add(re);
        req.onerror = function (event) {
            console.log('error in SaveAvatarResources');
            console.log(event);
        };
        req.onsuccess = function () {
            callback.apply();
        };
    };
    IDBHelper.ReadAvatarResources = function (callback) {
        var tx = IDBHelper.LocalIDB.transaction([IDBHelper.AvatarResourcesStore], 'readonly');
        var store = tx.objectStore(IDBHelper.AvatarResourcesStore);
        var index = store.index(IDBHelper.AvatarResourcesIndex);
        var keyRange = IDBKeyRange.bound(IDBHelper.AvatarResourcesDataUrl, IDBHelper.AvatarResourcesDataUrl + '\uffff');
        var req = index.openCursor(keyRange);
        var avatarResourcesObj;
        req.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor != null) {
                avatarResourcesObj = JSON.parse(cursor.value.text);
                cursor.continue();
            }
            else {
                callback(avatarResourcesObj);
            }
        };
        req.onerror = function (event) {
            console.log('error in ReadAvatarResources');
            console.log(event);
        };
    };
    IDBHelper.ReplayEntityStore = 'ReplayEntityStore';
    IDBHelper.Key_datetime = 'datetime';
    IDBHelper.replaySeparator = "===";
    IDBHelper.maxReplays = 1000;
    IDBHelper.AvatarResourcesStore = 'AvatarResourcesStore';
    IDBHelper.AvatarResourcesIndex = 'AvatarResourcesIndex';
    IDBHelper.AvatarResourcesDataUrl = 'AvatarResourcesDataUrl';
    return IDBHelper;
}());
