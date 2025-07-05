var SET_PLAYER_NAME_REQUEST = "set_player_name";
var PLAYER_ENTER_HALL_REQUEST = "PlayerEnterHall";
var JOIN_ROOM_REQUEST = "join_room";
var PREPARE_REQUEST = "prepare";
var ROOM_LIST_RESPONSE = "room_list";
var EXISTS_PLAYERS_RESPONSE = "exists_players";
var DEAL_POKER_RESPONSE = "deal_poker";
var NotifyGameHall_RESPONSE = "NotifyGameHall";
var NotifyOnlinePlayerList_RESPONSE = "NotifyOnlinePlayerList";
var NotifyDaojuInfo_RESPONSE = "NotifyDaojuInfo";
var NotifyGameRoomPlayerList_RESPONSE = "NotifyGameRoomPlayerList";
var NotifyMessage_RESPONSE = "NotifyMessage";
var NotifyRoomSetting_RESPONSE = "NotifyRoomSetting";
var NotifyGameState_RESPONSE = "NotifyGameState";
var NotifyCurrentHandState_RESPONSE = "NotifyCurrentHandState";
var NotifyCurrentTrickState_RESPONSE = "NotifyCurrentTrickState";
var GetDistributedCard_RESPONSE = "GetDistributedCard";
var NotifyCardsReady_RESPONSE = "NotifyCardsReady";
var NotifyDumpingValidationResult_RESPONSE = "NotifyDumpingValidationResult"; // failure
var NotifyTryToDumpResult_RESPONSE = "NotifyTryToDumpResult"; // both
var NotifyStartTimer_RESPONSE = "NotifyStartTimer"; // both
var NotifyEmoji_RESPONSE = "NotifyEmoji";
var CutCardShoeCards_RESPONSE = "CutCardShoeCards";
var NotifyReplayState_RESPONSE = "NotifyReplayState";
var NotifyPing_RESPONSE = "NotifyPing";
var NotifySgcsPlayerUpdated_RESPONSE = "NotifySgcsPlayerUpdated";
var NotifyCreateCollectStar_RESPONSE = "NotifyCreateCollectStar";
var NotifyEndCollectStar_RESPONSE = "NotifyEndCollectStar";
var NotifyGrabStar_RESPONSE = "NotifyGrabStar";
var NotifyUpdateGobang_RESPONSE = "NotifyUpdateGobang";
var WebSocketWrapper = /** @class */ (function () {
    function WebSocketWrapper(ws, gs) {
        this.websocket = ws;
        this.gameScene = gs;
    }
    WebSocketWrapper.prototype.onerror = function (e) {
        document.body.innerHTML = "<div>!!! \u5C1D\u8BD5\u94FE\u63A5\u670D\u52A1\u5668\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u8F93\u5165\u4FE1\u606F\u65E0\u8BEF\uFF1A".concat(this.gameScene.hostNameOriginal, "</div>");
        console.error(JSON.stringify(e));
    };
    WebSocketWrapper.prototype.onopen = function () {
        // try {
        console.log("连接成功");
        // empty password means recover password or playerName
        if (!this.gameScene.nickNameOverridePass) {
            // this.nickNameOverridePass = CommonMethods.recoverLoginPassFlag;
            this.gameScene.nickNameOverridePass = "";
            if (!this.gameScene.playerName) {
                this.gameScene.playerName = "";
            }
        }
        this.sendMessageToServer(PLAYER_ENTER_HALL_REQUEST, this.gameScene.playerName, JSON.stringify([this.gameScene.nickNameOverridePass, this.gameScene.playerEmail]));
        // this.mainForm = new MainForm(this)
        // this.loadAudioFiles()
        // CommonMethods.BuildCardNumMap();
        // IDBHelper.InitIDB();
        // } catch (e) {
        //     // alert("error")
        //     document.body.innerHTML = `<div>!!! onopen Error: ${e}</div>`
        // }
    };
    WebSocketWrapper.prototype.onmessage = function (message) {
        // try {
        var data = JSON.parse(message.data);
        var messageType = data["messageType"];
        var playerID = data["playerID"];
        var content = data["content"];
        // console.log(messageType)
        // console.log(content)
        var objList = JSON.parse(content);
        if (objList == null || objList.length == 0)
            return;
        switch (messageType) {
            case NotifyGameHall_RESPONSE:
                this.gameScene.handleNotifyGameHall(objList);
                break;
            // case NotifyOnlinePlayerList_RESPONSE:
            //     this.handleNotifyOnlinePlayerList(playerID, objList);
            //     break;
            // case NotifyGameRoomPlayerList_RESPONSE:
            //     this.handleNotifyGameRoomPlayerList(playerID, objList);
            //     break;
            // case NotifyMessage_RESPONSE:
            //     this.handleNotifyMessage(objList);
            //     break;
            // case NotifyRoomSetting_RESPONSE:
            //     this.handleNotifyRoomSetting(objList);
            //     break;
            // case NotifyGameState_RESPONSE:
            //     this.handleNotifyGameState(objList);
            //     break;
            // case NotifyCurrentHandState_RESPONSE:
            //     this.handleNotifyCurrentHandState(objList);
            //     break;
            // case NotifyCurrentTrickState_RESPONSE:
            //     this.handleNotifyCurrentTrickState(objList);
            //     break;
            // case GetDistributedCard_RESPONSE:
            //     this.handleGetDistributedCard(objList);
            //     break;
            // case NotifyCardsReady_RESPONSE:
            //     this.handleNotifyCardsReady(objList);
            //     break;
            // case NotifyDumpingValidationResult_RESPONSE:
            //     this.handleNotifyDumpingValidationResult(objList);
            //     break;
            // case NotifyTryToDumpResult_RESPONSE:
            //     this.handleNotifyTryToDumpResult(objList);
            //     break;
            // case NotifyStartTimer_RESPONSE:
            //     this.handleNotifyStartTimer(objList);
            //     break;
            // case NotifyEmoji_RESPONSE:
            //     this.handleNotifyEmoji(objList);
            //     break;
            // case CutCardShoeCards_RESPONSE:
            //     this.handleCutCardShoeCards();
            //     break;
            // case NotifyReplayState_RESPONSE:
            //     this.handleNotifyReplayState(objList);
            //     break;
            // case NotifyPing_RESPONSE:
            //     this.handleNotifyPing_RESPONSE();
            //     break;
            // case NotifySgcsPlayerUpdated_RESPONSE:
            //     this.handleNotifySgcsPlayerUpdated_RESPONSE(objList);
            //     break;
            // case NotifyCreateCollectStar_RESPONSE:
            //     this.handleNotifyCreateCollectStar_RESPONSE(objList);
            //     break;
            // case NotifyEndCollectStar_RESPONSE:
            //     this.handleNotifyEndCollectStar(objList);
            //     break;
            // case NotifyGrabStar_RESPONSE:
            //     this.handleNotifyGrabStar_RESPONSE(objList);
            //     break;
            // case NotifyDaojuInfo_RESPONSE:
            //     this.handleNotifyDaojuInfo(objList);
            //     break;
            // case NotifyUpdateGobang_RESPONSE:
            //     this.handleNotifyUpdateGobang_RESPONSE(objList);
            //     break;
            default:
                break;
        }
        // } catch (e) {
        //     // alert("error")
        //     document.body.innerHTML = `<div>!!! onmessage Error: ${e}</div>`
        // }
    };
    WebSocketWrapper.prototype.sendMessageToServer = function (messageType, playerID, content) {
        this.websocket.send(JSON.stringify({
            "messageType": messageType, "playerID": playerID, "content": content
        }));
    };
    return WebSocketWrapper;
}());
export { WebSocketWrapper };
