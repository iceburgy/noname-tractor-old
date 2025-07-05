import { IDBHelper } from './idb_helper.js';
var FileHelper = /** @class */ (function () {
    function FileHelper() {
    }
    FileHelper.ImportJsonFile = function (fileBlob, callbackUpstream) {
        var fr = new FileReader();
        fr.onload = function () {
            IDBHelper.SaveReplayEntity(JSON.parse(fr.result), callbackUpstream);
        };
        fr.readAsText(fileBlob);
    };
    FileHelper.ImportZipFile = function (fileBlob, callback) {
        JSZip.loadAsync(fileBlob).then(function (zip) {
            FileHelper.ReadZipFile(zip, callback);
        });
    };
    FileHelper.ReadZipFile = function (zip, callbackUpstream) {
        if (!zip || !zip.files) {
            alert("无效录像文件，请确认录像文件为zip格式");
            return;
        }
        var totalToRead = zip.files.length;
        var callbackDownstream = function () {
            totalToRead--;
        };
        zip.forEach(function (relativePath, file) {
            if (file.dir)
                return;
            file.async("string").then(function (data) {
                IDBHelper.SaveReplayEntity(JSON.parse(data), callbackDownstream);
            });
        });
        var intervalID = setInterval(function () {
            if (totalToRead > 0)
                return;
            clearInterval(intervalID);
            callbackUpstream.apply();
        }, 1000);
    };
    FileHelper.ExportZipFile = function () {
        IDBHelper.ReadReplayEntityAll(function (dtList) {
            var zip = new JSZip();
            var dates = [];
            for (var i = 0; i < dtList.length; i++) {
                var dt = dtList[i];
                var datetimes = dt.split(IDBHelper.replaySeparator);
                var dateString = datetimes[0];
                if (!dates.includes(dateString)) {
                    dates.push(dateString);
                }
            }
            var totalToRead = dates.length;
            if (totalToRead === 0) {
                alert("未找到录像文件");
                return;
            }
            for (var i = 0; i < dates.length; i++) {
                IDBHelper.ReadReplayEntityByDate(dates[i], function (reList) {
                    for (var i_1 = 0; i_1 < reList.length; i_1++) {
                        var re = reList[i_1];
                        var datetimes = re.ReplayId.split(IDBHelper.replaySeparator);
                        var dateString = datetimes[0];
                        var timeString = datetimes[1];
                        zip.folder(dateString).file("".concat(timeString, ".json"), JSON.stringify(re));
                    }
                    totalToRead--;
                });
            }
            var intervalID = setInterval(function () {
                if (totalToRead > 0)
                    return;
                clearInterval(intervalID);
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    saveAs(content, 'replays.zip');
                });
            }, 1000);
        });
    };
    return FileHelper;
}());
export { FileHelper };
