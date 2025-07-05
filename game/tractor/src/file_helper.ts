import { IDBHelper } from './idb_helper.js';
import { ReplayEntity } from './replay_entity.js';

declare let JSZip: any;
declare let saveAs: any;

export class FileHelper {
    constructor() {
    }

    public static ImportJsonFile(fileBlob: any, callbackUpstream: any) {
        var fr: any = new FileReader();
        fr.onload = function () {
            IDBHelper.SaveReplayEntity(JSON.parse(fr.result), callbackUpstream);
        }
        fr.readAsText(fileBlob);
    }

    public static ImportZipFile(fileBlob: any, callback: any) {
        JSZip.loadAsync(fileBlob).then((zip: any) => {
            FileHelper.ReadZipFile(zip, callback);
        });
    }

    public static ReadZipFile(zip: any, callbackUpstream: any) {
        if (!zip || !zip.files) {
            alert("无效录像文件，请确认录像文件为zip格式");
            return;
        }
        let totalToRead = zip.files.length;
        let callbackDownstream = () => {
            totalToRead--;
        };

        zip.forEach(function (relativePath: any, file: any) {
            if (file.dir) return;
            file.async("string").then(function (data: any) {
                IDBHelper.SaveReplayEntity(JSON.parse(data), callbackDownstream);
            });
        });
        let intervalID = setInterval(() => {
            if (totalToRead > 0) return;

            clearInterval(intervalID)
            callbackUpstream.apply();
        }, 1000)
    }

    public static ExportZipFile() {
        IDBHelper.ReadReplayEntityAll((dtList: string[]) => {
            var zip = new JSZip();

            let dates: string[] = [];
            for (let i = 0; i < dtList.length; i++) {
                let dt: string = dtList[i];
                let datetimes: string[] = dt.split(IDBHelper.replaySeparator)
                let dateString = datetimes[0];
                if (!dates.includes(dateString)) {
                    dates.push(dateString)
                }
            }

            let totalToRead = dates.length;
            if (totalToRead === 0) {
                alert("未找到录像文件");
                return;
            }
            for (let i = 0; i < dates.length; i++) {
                IDBHelper.ReadReplayEntityByDate(dates[i], (reList: ReplayEntity[]) => {
                    for (let i = 0; i < reList.length; i++) {
                        let re: ReplayEntity = reList[i];
                        let datetimes: string[] = re.ReplayId.split(IDBHelper.replaySeparator);
                        let dateString = datetimes[0];
                        let timeString = datetimes[1];
                        zip.folder(dateString).file(`${timeString}.json`, JSON.stringify(re));
                    }
                    totalToRead--;
                });
            }

            let intervalID = setInterval(() => {
                if (totalToRead > 0) return;

                clearInterval(intervalID)
                zip.generateAsync({ type: 'blob' }).then(function (content: any) {
                    saveAs(content, 'replays.zip');
                });
            }, 1000)
        });
    }
}
