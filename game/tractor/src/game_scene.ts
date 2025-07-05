import { RoomSetting } from "./room_setting.js";
import { GameState } from "./game_state.js";
import { CurrentHandState } from "./current_hand_state.js";
import { CurrentTrickState } from "./current_trick_state.js";
import { MainForm } from "./main_form.js";
import { Coordinates } from "./coordinates.js";
import { CommonMethods } from "./common_methods.js";
import { ShowingCardsValidationResult } from "./showing_cards_validation_result.js";
import { ReplayEntity } from "./replay_entity.js";
import { IDBHelper } from "./idb_helper.js";
import { EnterHallInfo } from './enter_hall_info.js';

const dummyValue = "dummyValue"
const IPPort = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(6553[0-5]|655[0-2][0-9]|65[0-4][0-9][0-9]|6[0-4][0-9][0-9][0-9][0-9]|[1-5](\d){4}|[1-9](\d){0,3})$/;
declare let CryptoJS: any;
declare let decadeUI: any;

export class GameScene {
    public isReplayMode: boolean
    // public appVersion: string
    public hostName!: string;
    public hostNameOriginal
    public playerName!: string;
    public websocket: any
    // // public prepareBtn: Phaser.GameObjects.Image
    // // public prepareOkImg: Phaser.GameObjects.Image[]
    // // public pokerTableChairImg: { tableImg: any, chairImgs: Phaser.GameObjects.Image[] }[]
    // // public pokerTableChairNames: { tableName: any, chairNames: { myOwnName: any, observerNames: Phaser.GameObjects.Text[] }[] }[]
    public mainForm!: MainForm;
    public cardImages!: any[]
    public cardServerNumToImage!: any;
    public cardImageSequence!: any[]
    public toolbarImage!: any
    public toolbarSuiteImages!: any[]
    public sidebarImages!: any[]
    public scoreCardsImages!: any[]
    public scoreTotalText!: any
    public scoreCardsIntsDrawn!: number[]
    public last8CardsImages!: any[]
    public showedCardImages!: any[]
    public OverridingFlagImage: any
    public overridingLabelImages!: string[]
    public overridingLabelAnims: any
    // // public hallPlayerHeader: Phaser.GameObjects.Text
    // // public hallPlayerNames: Phaser.GameObjects.Text[]
    // // public btnJoinAudio: Phaser.GameObjects.Text
    // // public btnQiandao: Phaser.GameObjects.Text
    // public joinAudioUrl: string 
    public nickNameOverridePass: string = ""
    public playerEmail: string = ""
    public clientMessages!: any[]
    public danmuMessages!: any[]
    // // public roomUIControls: { images: any[], texts: Phaser.GameObjects.Text[], imagesChair: Phaser.GameObjects.Image[] }
    public soundPool: any

    public soundRecoverhp!: string[];
    public sounddraw!: string[];
    public sounddrawx!: string[];
    public soundPlayersShowCard!: any[]
    public soundtie!: string[];
    // public soundclickwa!: string;
    public soundwin!: string[];
    // public soundVolume!: number
    public noDongtu!: string
    public noChat: boolean = false;
    public useCardUIStyleClassic: boolean = false;
    public noDanmu!: string
    public hidePlayerID: boolean = false;
    public noTouchDevice!: string
    public noCutCards!: string
    public yesDragSelect!: string
    public onlyMeShowCardCancelLastTrickView!: string
    public yesFirstPersonView!: string
    public qiangliangMin!: string
    public skinInUse!: string
    public chatMessageCostNoted!: boolean
    // public decadeUICanvas: HTMLElement 
    public coordinates!: Coordinates
    public wsprotocal: string = "wss"
    public game: any
    public lib: any
    public ui: any
    public get: any
    public _status: any

    constructor(irm: boolean, hostName: string, playerName: string, nickNameOverridePass: string, playerEmail: string, gameIn: any, libIn: any, uiIn: any, getIn: any, _statusIn: any) {
        this.game = gameIn;
        this.lib = libIn;
        this.ui = uiIn;
        this.get = getIn;
        this._status = _statusIn;
        this.isReplayMode = irm;
        // // this.existPlayers = [1]
        // // this.websocket = null
        // // this.getPlayerMsgCnt = 0
        // // this.prepareOkImg = [null, null, null, null]
        // // this.pokerTableChairImg = []
        // // this.pokerTableChairNames = []
        this.cardImages = [];
        this.cardServerNumToImage = {};
        for (let i = 0; i < 54; i++) {
            this.cardServerNumToImage[i] = [];
        }
        this.cardImageSequence = [];
        this.toolbarSuiteImages = [];
        this.sidebarImages = [];
        this.scoreCardsImages = [];
        this.scoreCardsIntsDrawn = [];
        this.last8CardsImages = [];
        this.showedCardImages = [];
        this.overridingLabelImages = [
            "bagua",
            "zhugong",
            "sha",
            "huosha",
            "leisha",
        ]
        this.overridingLabelAnims = [
            ["", ""],
            ["", ""],
            ["effect_qinggangjian", undefined],
            ["effect_shoujidonghua", "play3"],
            ["effect_shoujidonghua", "play5"]
        ]
        // // this.hallPlayerNames = [];
        this.clientMessages = [];
        this.danmuMessages = [];
        this.noDongtu = "false";
        this.useCardUIStyleClassic = (this.lib && this.lib.config && this.lib.config.useCardUIStyleClassic) ? this.lib.config.useCardUIStyleClassic : false;
        this.hidePlayerID = (this.lib && this.lib.config && this.lib.config.hidePlayerID) ? this.lib.config.hidePlayerID : false;
        this.noDanmu = (this.lib && this.lib.config && this.lib.config.noDanmu) ? this.lib.config.noDanmu : "false";
        this.noTouchDevice = (this.lib && this.lib.config && this.lib.config.noTouchDevice) ? this.lib.config.noTouchDevice : "false";
        this.noCutCards = (this.lib && this.lib.config && this.lib.config.noCutCards) ? this.lib.config.noCutCards : "false";
        this.yesDragSelect = (this.lib && this.lib.config && this.lib.config.yesDragSelect) ? this.lib.config.yesDragSelect : "false";
        this.onlyMeShowCardCancelLastTrickView = (this.lib && this.lib.config && this.lib.config.onlyMeShowCardCancelLastTrickView) ? this.lib.config.onlyMeShowCardCancelLastTrickView : "false";
        this.chatMessageCostNoted = (this.lib && this.lib.config && this.lib.config.chatMessageCostNoted !== undefined) ? this.lib.config.chatMessageCostNoted : false;
        this.yesFirstPersonView = (this.lib && this.lib.config && this.lib.config.yesFirstPersonView) ? this.lib.config.yesFirstPersonView : "false";
        this.qiangliangMin = (this.lib && this.lib.config && this.lib.config.qiangliangMin) ? this.lib.config.qiangliangMin : "5";
        // // if (this.qiangliangMin === undefined) this.qiangliangMin = '5'

        IDBHelper.maxReplays = (this.lib && this.lib.config && this.lib.config.maxReplays) ? this.lib.config.maxReplays : IDBHelper.maxReplays;
        this.coordinates = new Coordinates(this);

        if (this.isReplayMode) {
            this.doReplay();
            return;
        }

        this.hostName = hostName.trim()
        this.hostNameOriginal = this.hostName
        this.playerName = playerName.trim()
        if (this.playerName && CommonMethods.IsNumber(this.playerName)) {
            document.body.innerHTML = `<div>!!! 昵称不能以数字开头结尾：${this.playerName}</div>`
            this.hostName = "";
            return;
        }
        let isIPPort = IPPort.test(this.hostName);
        if (isIPPort) {
            this.wsprotocal = "ws";
        } else {
            if (!(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)$)/gi.test(this.hostName)) && !this.processAuth()) {
                document.body.innerHTML = `<div>!!! 解析服务器地址失败，请确认输入信息无误：${this.hostNameOriginal}</div>`
                this.hostName = "";
                return;
            }
            this.resolveUrl()
        }
        this.nickNameOverridePass = nickNameOverridePass;
        this.playerEmail = playerEmail;


        this.soundPool = {};
        this.loadAudioFiles();

        this.connect();
    }

    // non-replay mode, online
    connect() {
        if (!this.hostName) return;
        try {
            if (this.websocket) {
                this.websocket.close();
                delete this.websocket;
            }
            this.websocket = new WebSocket(`${this.wsprotocal}://${this.hostName}`)
            this.websocket.gs = this;
            this.websocket.onopen = function () {
                // try {
                console.log("连接成功")
                if (this.gs.ui.emailtext) {
                    this.gs.game.clearConnect();
                }

                // empty password means recover password or playerName
                if (!this.gs.nickNameOverridePass) {
                    this.gs.nickNameOverridePass = CommonMethods.recoverLoginPassFlag;
                    if (!this.gs.playerName) {
                        this.gs.playerName = "";
                    }
                }
                let enterHallInfo: EnterHallInfo = new EnterHallInfo(this.gs.nickNameOverridePass, this.gs.playerEmail, CommonMethods.PLAYER_CLIENT_TYPE_TLJAPP);
                this.gs.sendMessageToServer(CommonMethods.PLAYER_ENTER_HALL_REQUEST, this.gs.playerName, JSON.stringify(enterHallInfo));

                this.gs.mainForm = new MainForm(this.gs)
                this.gs.mainForm.drawFrameMain();
                this.gs.mainForm.drawFrameChat();
                CommonMethods.BuildCardNumMap()

                IDBHelper.InitIDB(() => { void (0); });
                this.gs.mainForm.LoadUIUponConnect();

                // } catch (e) {
                //     // alert("error")
                //     document.body.innerHTML = `<div>!!! onopen Error: ${e}</div>`
                // }
            }
            this.websocket.onmessage = function (message: any) {
                // try {
                const data = JSON.parse(message.data)
                const messageType = data["messageType"]
                const playerID = data["playerID"]
                const content = data["content"]
                // console.log(messageType)
                // console.log(content)

                const objList = JSON.parse(content)
                if (objList == null || objList.length == 0) return

                switch (messageType) {
                    case CommonMethods.NotifyGameHall_RESPONSE:
                        this.gs.handleNotifyGameHall(objList);
                        break;
                    case CommonMethods.NotifyOnlinePlayerList_RESPONSE:
                        this.gs.handleNotifyOnlinePlayerList(playerID, objList);
                        break;
                    case CommonMethods.NotifyGameRoomPlayerList_RESPONSE:
                        this.gs.handleNotifyGameRoomPlayerList(playerID, objList);
                        break;
                    case CommonMethods.NotifyMessage_RESPONSE:
                        this.gs.handleNotifyMessage(objList);
                        break;
                    case CommonMethods.NotifyRoomSetting_RESPONSE:
                        this.gs.handleNotifyRoomSetting(objList);
                        break;
                    case CommonMethods.NotifyGameState_RESPONSE:
                        this.gs.handleNotifyGameState(objList);
                        break;
                    case CommonMethods.NotifyCurrentHandState_RESPONSE:
                        this.gs.handleNotifyCurrentHandState(objList);
                        break;
                    case CommonMethods.NotifyCurrentTrickState_RESPONSE:
                        this.gs.handleNotifyCurrentTrickState(objList);
                        break;
                    case CommonMethods.GetDistributedCard_RESPONSE:
                        this.gs.handleGetDistributedCard(objList);
                        break;
                    case CommonMethods.NotifyCardsReady_RESPONSE:
                        this.gs.handleNotifyCardsReady(objList);
                        break;
                    case CommonMethods.NotifyDumpingValidationResult_RESPONSE:
                        this.gs.handleNotifyDumpingValidationResult(objList);
                        break;
                    case CommonMethods.NotifyTryToDumpResult_RESPONSE:
                        this.gs.handleNotifyTryToDumpResult(objList);
                        break;
                    case CommonMethods.NotifyStartTimer_RESPONSE:
                        this.gs.handleNotifyStartTimer(objList);
                        break;
                    case CommonMethods.NotifyEmoji_RESPONSE:
                        this.gs.handleNotifyEmoji(objList);
                        break;
                    case CommonMethods.CutCardShoeCards_RESPONSE:
                        this.gs.handleCutCardShoeCards();
                        break;
                    case CommonMethods.NotifyReplayState_RESPONSE:
                        this.gs.handleNotifyReplayState(objList);
                        break;
                    case CommonMethods.NotifyPing_RESPONSE:
                        this.gs.handleNotifyPing_RESPONSE();
                        break;
                    // case CommonMethods.NotifySgcsPlayerUpdated_RESPONSE:
                    //     this.gs.handleNotifySgcsPlayerUpdated_RESPONSE(objList);
                    //     break;
                    // case CommonMethods.NotifyCreateCollectStar_RESPONSE:
                    //     this.gs.handleNotifyCreateCollectStar_RESPONSE(objList);
                    //     break;
                    // case CommonMethods.NotifyEndCollectStar_RESPONSE:
                    //     this.gs.handleNotifyEndCollectStar(objList);
                    //     break;
                    // case CommonMethods.NotifyGrabStar_RESPONSE:
                    //     this.gs.handleNotifyGrabStar_RESPONSE(objList);
                    //     break;
                    case CommonMethods.NotifyDaojuInfo_RESPONSE:
                        this.gs.handleNotifyDaojuInfo(objList);
                        break;
                    // case CommonMethods.NotifyUpdateGobang_RESPONSE:
                    //     this.gs.handleNotifyUpdateGobang_RESPONSE(objList);
                    //     break;
                    default:
                        break;
                }
                // } catch (e) {
                //     // alert("error")
                //     document.body.innerHTML = `<div>!!! onmessage Error: ${e}</div>`
                // }
            }
            this.websocket.onerror = function (e: any) {
                document.body.innerHTML = `<div>!!! 尝试与服务器建立连接失败，请确认输入信息无误：${this.gs.hostNameOriginal}</div>`
                console.error(JSON.stringify(e));
            }
        } catch (e: any) {
            document.body.innerHTML = `<div>!!! 尝试连接服务器出错，请确认输入信息无误：${this.hostNameOriginal}</div>`
            console.log(e);
        }
    }

    // replay mode, offline
    doReplay() {
        this.mainForm = new MainForm(this)
        this.mainForm.drawFrameMain();
        this.mainForm.drawGameRoom();
        this.mainForm.drawFrameChat();
        CommonMethods.BuildCardNumMap()
        this.mainForm.LoadUIUponConnect();

        IDBHelper.InitIDB(() => {
            this.mainForm.DoReplayMainForm();
        });
    }

    // public handleNotifyUpdateGobang_RESPONSE(objList) {
    //     var result: SGGBState = objList[0];
    //     this.mainForm.sgDrawingHelper.NotifyUpdateGobang(result);
    // }

    public handleNotifyDaojuInfo(objList: any) {
        var daojuInfo: any = objList[0];
        var updateQiandao: boolean = objList[1];
        var updateSkin: boolean = objList[2];
        this.mainForm.tractorPlayer.NotifyDaojuInfo(daojuInfo, updateQiandao, updateSkin);
    }

    // public handleNotifyGrabStar_RESPONSE(objList) {
    //     let playerIndex: number = objList[0];
    //     let starIndex: number = objList[1];
    //     this.mainForm.sgDrawingHelper.NotifyGrabStar(playerIndex, starIndex);
    // }

    // public handleNotifyCreateCollectStar_RESPONSE(objList) {
    //     var result: SGCSState = objList[0];
    //     this.mainForm.sgDrawingHelper.NotifyCreateCollectStar(result);
    // }

    // public handleNotifyEndCollectStar(objList) {
    //     var result: SGCSState = objList[0];
    //     this.mainForm.sgDrawingHelper.NotifyEndCollectStar(result);
    // }

    // public handleNotifySgcsPlayerUpdated_RESPONSE(objList) {
    //     var result: SGCSPlayer = JSON.parse(objList[0])
    //     this.mainForm.sgDrawingHelper.NotifySgcsPlayerUpdated(result);
    // }

    public handleNotifyPing_RESPONSE() {
        this.mainForm.tractorPlayer.NotifyPing()
    }

    public handleNotifyReplayState(objList: any) {
        var result: ReplayEntity = objList[0];
        IDBHelper.SaveReplayEntity(result, () => { void (0); })
    }

    public handleCutCardShoeCards() {
        this.mainForm.CutCardShoeCardsEventHandler()
    }

    public handleNotifyEmoji(objList: any) {
        this.mainForm.NotifyEmojiEventHandler.apply(this.mainForm, objList)
    }

    public handleNotifyStartTimer(objList: any) {
        var timerLength: number = objList[0];
        var playerID: string = objList[1];
        this.mainForm.NotifyStartTimerEventHandler(timerLength, playerID);
    }

    public handleNotifyDumpingValidationResult(objList: any) {
        var result: ShowingCardsValidationResult = objList[0];
        this.mainForm.NotifyDumpingValidationResultEventHandler(result)
    }

    public handleNotifyTryToDumpResult(objList: any) {
        var result: ShowingCardsValidationResult = objList[0];
        this.mainForm.NotifyTryToDumpResultEventHandler(result)
    }

    public handleNotifyCardsReady(objList: any) {
        var cardsReady: boolean[] = objList[0];
        this.mainForm.tractorPlayer.NotifyCardsReady(cardsReady)
    }

    public handleGetDistributedCard(objList: any) {
        var cardNumber: number = objList[0];
        this.mainForm.tractorPlayer.GetDistributedCard(cardNumber)
    }

    public handleNotifyGameHall(objList: any) {
        var roomStateList = objList[0];
        var playerList = objList[1];
        var yuezhanList = objList[2];
        this.mainForm.NotifyGameHallEventHandler(roomStateList, playerList, yuezhanList)
    }

    public handleNotifyOnlinePlayerList(playerID: string, objList: any) {
        var isJoining: boolean = objList[0];
        this.mainForm.NotifyOnlinePlayerListEventHandler(playerID, isJoining)
    }

    public handleNotifyGameRoomPlayerList(playerID: string, objList: any) {
        var isJoining: boolean = objList[0];
        var roomName: string = objList[1];
        this.mainForm.NotifyGameRoomPlayerListEventHandler(playerID, isJoining, roomName)
    }

    public handleNotifyMessage(objList: any) {
        var msgs = objList[0];
        this.mainForm.tractorPlayer.NotifyMessage(msgs)
    }

    public handleNotifyRoomSetting(objList: any) {
        var roomSetting: RoomSetting = objList[0];
        var showMessage: boolean = objList[1];
        this.mainForm.tractorPlayer.NotifyRoomSetting(roomSetting, showMessage)
    }

    public handleNotifyGameState(objList: any) {
        var gameState: GameState = objList[0];
        var notifyType: string = objList[1];
        this.mainForm.tractorPlayer.NotifyGameState(gameState, notifyType)
    }

    public handleNotifyCurrentHandState(objList: any) {
        var currentHandState: CurrentHandState = objList[0];
        var notifyType: string = objList[1];
        this.mainForm.tractorPlayer.NotifyCurrentHandState(currentHandState, notifyType)
    }

    public handleNotifyCurrentTrickState(objList: any) {
        var currentTrickState: CurrentTrickState = objList[0];
        var notifyType: string = objList[1];
        this.mainForm.tractorPlayer.NotifyCurrentTrickState(currentTrickState, notifyType)
    }

    private processAuth(): boolean {
        try {
            var bytes = CryptoJS.AES.decrypt(this.hostName, dummyValue);
            var originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (bytes && bytes.sigBytes > 0 && originalText) {
                this.hostName = originalText
                return true;
            }
        } catch (ex) {
            console.log("===")
            console.log(ex)
        }
        return false;
    }

    private resolveUrl(): boolean {
        try {
            let urlParts = this.hostName.split(":");
            let urlPart1 = "";
            for (let i = 0; i < urlParts[0].length; i++) {
                let ascii = urlParts[0].charCodeAt(i);
                let char = String.fromCharCode(ascii);
                urlPart1 += char;
            }
            this.hostName = `${urlPart1}:${urlParts[1]}`;
            return true;
        } catch (ex) {
            console.log("===")
            console.log(ex)
        }
        return false;
    }

    public loadAudioFiles() {
        this.soundPlayersShowCard = [
            { "m": this.ui.audioResources.equip1, "f": this.ui.audioResources.equip1 },
            { "m": this.ui.audioResources.equip2, "f": this.ui.audioResources.equip2 },
            { "m": this.ui.audioResources.zhu_junlve, "f": this.ui.audioResources.zhu_lijian2 },
            { "m": this.ui.audioResources.sha, "f": this.ui.audioResources.f_sha },
            { "m": this.ui.audioResources.sha_fire, "f": this.ui.audioResources.f_sha_fire },
            { "m": this.ui.audioResources.sha_thunder, "f": this.ui.audioResources.f_sha_thunder },
        ];

        this.soundPool[CommonMethods.audioLiangpai] = { "m": this.ui.audioResources.liangpai_m_shelie1, "f": this.ui.audioResources.liangpai_f_biyue1 };
        this.soundPool[CommonMethods.audioShuaicuo] = { "m": this.ui.audioResources.shuaicuo_m_fankui2, "f": this.ui.audioResources.shuaicuo_f_guose2 };

        this.soundPool[CommonMethods.audioRecoverhp] = this.ui.audioResources.recover;
        this.soundPool[CommonMethods.audioDraw] = this.ui.audioResources.draw;
        this.soundPool[CommonMethods.audioDrawx] = this.ui.audioResources.drawx;
        this.soundPool[CommonMethods.audioTie] = this.ui.audioResources.tie;
        this.soundPool[CommonMethods.audioWin] = this.ui.audioResources.win;
        this.soundPool[CommonMethods.audioGameStart] = this.ui.audioResources.game_start;
        this.soundPool[CommonMethods.audioEnterHall] = this.ui.audioResources.enter_hall_click;
        this.soundPool[CommonMethods.audioCountdown8Sec] = this.ui.audioResources.countdown_8_sec;
        this.soundPool[CommonMethods.audioEnterRoom] = [
            [],
            [],
            this.ui.audioResources.enter_room_kongcheng11,
            this.ui.audioResources.enter_room_kongcheng12,
            this.ui.audioResources.game_start
        ];
    }

    public saveSettings() { }

    // [flag, pass, email]
    public savePlayerLoginInfo(loginInfo: string[]) {
        this.nickNameOverridePass = loginInfo[1];
        this.game.saveConfig('NickNameOverridePass', loginInfo[1]);
        this.game.saveConfig('playerEmail', loginInfo[2]);
    }

    public sendMessageToServer(messageType: string, playerID: string, content: string) {
        this.websocket.send(JSON.stringify({
            "messageType": messageType, "playerID": playerID, "content": content
        }))
    }

    public isInGameHall() {
        return this.ui && this.ui.frameGameHall && this.ui.frameGameHall;
    }

    public isInGameRoom() {
        return this.ui && this.ui.roomOwnerText;
    }

    public playAudio(audioName: string | number, sex?: string | number) {
        let audioInfo: string[] = [];
        if (typeof audioName === "string") {
            if (sex) {
                audioInfo = this.soundPool[audioName][sex];
            } else {
                audioInfo = this.soundPool[audioName];
            }
        } else if (typeof audioName === "number" && sex) {
            // 杀牌音效
            audioInfo = this.soundPlayersShowCard[audioName][sex];
        }
        if (audioInfo && audioInfo.length >= 2 && this.ui.audioResourceObjects.hasOwnProperty(`${audioInfo[0]}${audioInfo[1]}`)) {
            this.ui.audioResourceObjects[`${audioInfo[0]}${audioInfo[1]}`].currentTime = 0;
            this.ui.audioResourceObjects[`${audioInfo[0]}${audioInfo[1]}`].play();
        }
    }

    public stopAudio(audioName: string | number, sex?: string | number) {
        let audioInfo: string[] = [];
        if (typeof audioName === "string") {
            if (sex) {
                audioInfo = this.soundPool[audioName][sex];
            } else {
                audioInfo = this.soundPool[audioName];
            }
        } else if (typeof audioName === "number" && sex) {
            // 杀牌音效
            audioInfo = this.soundPlayersShowCard[audioName][sex];
        }
        if (audioInfo && audioInfo.length >= 2 && this.ui.audioResourceObjects.hasOwnProperty(`${audioInfo[0]}${audioInfo[1]}`)) {
            this.ui.audioResourceObjects[`${audioInfo[0]}${audioInfo[1]}`].currentTime = 0;
            this.ui.audioResourceObjects[`${audioInfo[0]}${audioInfo[1]}`].pause();
        }
    }
}
