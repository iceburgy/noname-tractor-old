import { GameScene } from './game_scene.js';
import { RoomSetting } from './room_setting.js';
import { CurrentPoker } from './current_poker.js';
import { GameState } from './game_state.js';
import { CurrentHandState } from './current_hand_state.js';
import { CurrentTrickState } from './current_trick_state.js';
import { PlayerLocalCache } from './player_local_cache.js';
import { CommonMethods } from './common_methods.js';
import { PlayerEntity } from './player_entity.js';
import { TractorPlayer } from './tractor_player.js';
import { Coordinates } from './coordinates.js';
import { SuitEnums } from './suit_enums.js';
import { DrawingFormHelper } from './drawing_form_helper.js';
import { TractorRules } from './tractor_rules.js';
import { ShowingCardsValidationResult } from './showing_cards_validation_result.js';
import { Algorithm } from './algorithm.js';
import { PokerHelper } from './poker_helper.js';
import { RoomState } from './room_state.js';
import { IDBHelper } from './idb_helper.js';
import { ReplayEntity } from './replay_entity.js';
import { FileHelper } from './file_helper.js';
import { debug } from 'console';
import { OnePlayerAtATime } from './one_player_at_a_time.js';
import { YuezhanEntity } from './yuezhan_entity.js';

const ReadyToStart_REQUEST = "ReadyToStart"
const ToggleIsRobot_REQUEST = "ToggleIsRobot"
const ToggleIsQiangliang_REQUEST = "ToggleIsQiangliang"
const ObserveNext_REQUEST = "ObserveNext"
const ExitRoom_REQUEST = "ExitRoom"
const ExitRoom_REQUEST_TYPE_BootPlayer = "BootPlayer"
const StoreDiscardedCards_REQUEST = "StoreDiscardedCards"
const PlayerShowCards_REQUEST = "PlayerShowCards"
const ValidateDumpingCards_REQUEST = "ValidateDumpingCards"
const CardsReady_REQUEST = "CardsReady"
const ResumeGameFromFile_REQUEST = "ResumeGameFromFile"
const SaveRoomSetting_REQUEST = "SaveRoomSetting"
const RandomSeat_REQUEST = "RandomSeat"
const SwapSeat_REQUEST = "SwapSeat"
const PLAYER_ENTER_ROOM_REQUEST = "PlayerEnterRoom"
const PLAYER_EXIT_AND_ENTER_ROOM_REQUEST = "ExitAndEnterRoom"
const PLAYER_EXIT_AND_OBSERVE_REQUEST = "ExitAndObserve"
const BUY_USE_SKIN_REQUEST = "BuyUseSkin"
const UsedShengbiType_Qiangliangka = "UsedShengbiType_Qiangliangka"
const PLAYER_QIANDAO_REQUEST = "PlayerQiandao"
declare let jQuery: any;
declare let Gifffer: any;

export class MainForm {
    // public gameScene: GameScene | GameReplayScene
    public skinPreviewTimer: any
    public gameScene: GameScene
    public tractorPlayer!: TractorPlayer

    // gobang
    // public btnSmallGames: Phaser.GameObjects.Text
    // public groupSmallGames: Phaser.GameObjects.Group
    // public panelSmallGames: Phaser.GameObjects.Sprite
    // public btnGobang: Phaser.GameObjects.Text
    // public btnCollectStar: Phaser.GameObjects.Text

    public isSendEmojiEnabled: boolean

    public PlayerPosition: any
    public PositionPlayer: any
    public myCardIsReady: boolean[]
    public SelectedCards: number[]
    public cardsOrderNumber: number

    public drawingFormHelper: DrawingFormHelper
    // public sgDrawingHelper: SGDrawingHelper
    public IsDebug: boolean
    public IsQiangliang: boolean
    public timerIntervalID: any[]
    // public timerImage: Phaser.GameObjects.Text
    public modalForm: any
    public firstWinNormal = 1;
    public firstWinBySha = 3;
    public chatForm: any
    // public sgcsPlayer: SGCSPlayer;
    public rightSideButtonDepth = 1;
    public DaojuInfo: any;
    public MySkinInUse: any;
    public MySkinFrame: any;

    public selectPresetMsgsIsOpen: boolean = false;

    // replay stuff
    public currentReplayEntities!: any[]
    public selectDates: any
    public selectTimes: any
    public btnFirstPersonView: any
    public btnFirstTrick: any
    public btnPreviousTrick: any
    public btnNextTrick: any
    public btnLastTrick: any
    public onePlayerAtATime!: OnePlayerAtATime

    constructor(gs: GameScene) {
        this.gameScene = gs
        this.tractorPlayer = new TractorPlayer(this)
        this.drawingFormHelper = new DrawingFormHelper(this)
        // this.sgDrawingHelper = new SGDrawingHelper(this)
        // this.sgcsPlayer = new SGCSPlayer(this.tractorPlayer.MyOwnId)
        this.PlayerPosition = {}
        this.PositionPlayer = {}
        this.myCardIsReady = Array(33).fill(false);
        this.cardsOrderNumber = 0
        this.IsDebug = false
        this.IsQiangliang = false
        this.SelectedCards = []
        this.timerIntervalID = []
        this.isSendEmojiEnabled = true;
        this.DaojuInfo = {};
    }

    public HandleRightClickEmptyArea() {
        if (this.tractorPlayer.mainForm.gameScene.isReplayMode) return;
        if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing ||
            this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards) {
            this.tractorPlayer.ShowLastTrickCards = !this.tractorPlayer.ShowLastTrickCards;
            if (this.tractorPlayer.ShowLastTrickCards) {
                this.ShowLastTrickAndTumpMade();
            }
            else {
                this.PlayerCurrentTrickShowedCards();
            }
        }
        //一局结束时右键查看最后一轮各家所出的牌，缩小至一半，放在左下角
        else if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Ending) {
            this.tractorPlayer.ShowLastTrickCards = !this.tractorPlayer.ShowLastTrickCards;
            if (this.tractorPlayer.ShowLastTrickCards) {
                this.ShowLastTrickAndTumpMade();
            }
            else {
                this.drawingFormHelper.DrawFinishedSendedCards()
            }
        }
        this.gameScene.ui.btnShowLastTrick.innerHTML = (this.tractorPlayer.ShowLastTrickCards ? "还原" : "上轮");
    }

    public NewPlayerReadyToStart(readyToStart: boolean) {
        if (CommonMethods.GetReadyCount(this.tractorPlayer.CurrentGameState.Players) < 4) {
            if (!this.tractorPlayer.isObserver) {
                this.gameScene.ui.btnReady.show();
                this.gameScene.ui.btnReady.classList.remove('disabled');
                this.gameScene.ui.btnReady.classList.add('pointerdiv');
                this.gameScene.ui.btnExitAndObserve.show();
            }

            // small games
            // this.btnSmallGames.setInteractive({ useHandCursor: true })
            // this.btnSmallGames.setColor('white')
        } else {
            this.gameScene.ui.btnReady.classList.add('disabled');
            this.gameScene.ui.btnReady.classList.remove('pointerdiv');
            this.gameScene.ui.btnExitAndObserve.hide()

            // small games
            // this.btnSmallGames.disableInteractive()
            // this.btnSmallGames.setColor('gray')
            // this.groupSmallGames.setVisible(false);
        }
        this.gameScene.ui.btnReady.innerHTML = (readyToStart ? "取消" : "开始");
        this.setStartLabels()
    }

    public PlayerToggleIsRobot(isRobot: boolean) {
        this.gameScene.ui.btnRobot.innerHTML = (isRobot ? "取消" : "托管");
        this.setStartLabels()

        let shouldTrigger = isRobot && isRobot != this.IsDebug;
        this.IsDebug = isRobot;

        if (shouldTrigger) {
            // 等待玩家切牌
            let btnRandom: any = document.getElementById("btnRandom");
            if (btnRandom) {
                let cutPoint = 0;
                let cutInfo = `取消,${cutPoint}`;
                this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
                return;
            }

            // 其它情况：埋底，领出，跟出
            if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards &&
                this.tractorPlayer.CurrentHandState.Last8Holder == this.tractorPlayer.PlayerId) this.DiscardingLast8();
            else if (!this.tractorPlayer.CurrentTrickState.IsStarted()) this.RobotPlayStarting();
            else this.RobotPlayFollowing();
        }
    }

    public PlayerToggleIsQiangliang(isQiangliang: boolean) {
        this.gameScene.ui.btnQiangliang.innerHTML = (isQiangliang ? "取消" : "抢亮");
        this.setStartLabels()

        this.IsQiangliang = isQiangliang;
    }

    public PlayersTeamMade() {
        //set player position
        this.PlayerPosition = {}
        this.PositionPlayer = {}
        var nextPlayer: string = this.tractorPlayer.PlayerId;
        var postion = 1;
        this.PlayerPosition[nextPlayer] = postion;
        this.PositionPlayer[postion] = nextPlayer;
        nextPlayer = CommonMethods.GetNextPlayerAfterThePlayer(this.tractorPlayer.CurrentGameState.Players, nextPlayer).PlayerId;
        while (nextPlayer != this.tractorPlayer.PlayerId) {
            postion++;
            this.PlayerPosition[nextPlayer] = postion;
            this.PositionPlayer[postion] = nextPlayer;
            nextPlayer = CommonMethods.GetNextPlayerAfterThePlayer(this.tractorPlayer.CurrentGameState.Players, nextPlayer).PlayerId;
        }
    }

    public NewPlayerJoined(shouldReDrawChairOrPlayer: boolean) {
        if (this.gameScene.isInGameHall()) {
            this.destroyGameHall()
            this.init();
        }

        if (!this.gameScene.ui.frameGameRoom) {
            this.drawGameRoom();
        }

        // this.sgDrawingHelper.myPlayerIndex = CommonMethods.GetPlayerIndexByID(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.MyOwnId);
        // this.sgcsPlayer.PlayerIndex = this.sgDrawingHelper.myPlayerIndex;

        // this.roomNameText.setVisible(true)
        // this.roomOwnerText.setVisible(true)

        // this.btnExitRoom.setVisible(true)
        this.gameScene.ui.btnShowLastTrick.show();

        if (this.tractorPlayer.isObserver) {
            this.gameScene.ui.btnReady.hide();
            this.gameScene.ui.btnReady.classList.remove('pointerdiv');
            this.gameScene.ui.btnRobot.hide();
            this.gameScene.ui.btnQiangliang.hide();
        } else {
            this.gameScene.ui.btnReady.show();
            this.gameScene.ui.btnReady.classList.add('pointerdiv');
            this.gameScene.ui.btnRobot.show();
            this.gameScene.ui.btnQiangliang.show();
        }

        if (this.tractorPlayer.isObserver) {
            this.gameScene.ui.btnExitAndObserve.hide();
        } else {
            this.gameScene.ui.btnExitAndObserve.show();
        }

        // // small games
        // this.btnSmallGames.setVisible(!this.tractorPlayer.isObserver);
        // if (this.tractorPlayer.isObserver) {
        //     this.groupSmallGames.setVisible(false);
        // }

        if (shouldReDrawChairOrPlayer) this.destroyImagesChairOrPlayer();
        this.destroyPokerPlayerObGameRoom();
        var curIndex = CommonMethods.GetPlayerIndexByID(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.PlayerId)
        for (let i = 0; i < 4; i++) {
            let p = this.tractorPlayer.CurrentGameState.Players[curIndex];
            let isEmptySeat = !p;
            if (isEmptySeat) {
                if (shouldReDrawChairOrPlayer) {
                    var pokerChair = this.gameScene.ui.create.div('.pokerChair', this.gameScene.ui.frameGameRoom);
                    pokerChair.setBackgroundImage('image/tractor/btn/poker_chair.png')
                    if (i === 1) pokerChair.style.right = `calc(${this.gameScene.coordinates.playerChairPositions[i].x})`;
                    else pokerChair.style.left = `calc(${this.gameScene.coordinates.playerChairPositions[i].x})`;
                    if (i === 2) pokerChair.style.top = `calc(${this.gameScene.coordinates.playerChairPositions[i].y})`;
                    else pokerChair.style.bottom = `calc(${this.gameScene.coordinates.playerChairPositions[i].y})`;
                    pokerChair.style.width = '80px';
                    pokerChair.style.height = '80px';
                    pokerChair.style['background-size'] = '100% 100%';
                    pokerChair.style['background-repeat'] = 'no-repeat';
                    pokerChair.style.cursor = 'pointer';
                    pokerChair.setAttribute('data-position', i);

                    // click
                    pokerChair.addEventListener("click", (e: any) => {
                        let pos = i + 1;
                        let playerIndex = CommonMethods.GetPlayerIndexByPos(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.PlayerId, pos);
                        this.ExitRoomAndEnter(playerIndex);
                    });
                    // mouseover
                    pokerChair.addEventListener("mouseover", (e: any) => {
                        let pos = parseInt(e.target.getAttribute('data-position'));
                        if (pos === 2) e.target.style.top = `calc(${this.gameScene.coordinates.playerChairPositions[i].y} - 5px)`;
                        else e.target.style.bottom = `calc(${this.gameScene.coordinates.playerChairPositions[i].y} + 5px)`;
                    });
                    // mouseout
                    pokerChair.addEventListener("mouseout", (e: any) => {
                        let pos = parseInt(e.target.getAttribute('data-position'));
                        if (pos === 2) e.target.style.top = `calc(${this.gameScene.coordinates.playerChairPositions[i].y})`;
                        else e.target.style.bottom = `calc(${this.gameScene.coordinates.playerChairPositions[i].y})`;
                    });

                    this.gameScene.ui.gameRoomImagesChairOrPlayer[i] = pokerChair;
                }
            } else {
                if (shouldReDrawChairOrPlayer) {
                    //skin                
                    let skinInUse = this.DaojuInfo.daojuInfoByPlayer[p.PlayerId] ? this.DaojuInfo.daojuInfoByPlayer[p.PlayerId].skinInUse : CommonMethods.defaultSkinInUse;
                    if (i !== 0) {
                        let playerUI = this.CreatePlayer(i, p.PlayerId, this.gameScene.ui.frameGameRoom);
                        this.gameScene.ui.gameRoomImagesChairOrPlayer[i] = playerUI;
                        let skinType = this.GetSkinType(skinInUse);
                        let skinExtention = skinType === 0 ? "webp" : "gif";
                        let skinURL = `image/tractor/skin/${skinInUse}.${skinExtention}`;
                        this.SetAvatarImage(false, this.gameScene, i, skinType, skinURL, playerUI, this.gameScene.coordinates.cardHeight, this.SetObText, p);
                    }
                    else {
                        this.gameScene.ui.gameMe.node.nameol.innerHTML = this.gameScene.hidePlayerID ? "" : this.tractorPlayer.PlayerId;
                        let skinInUseMe = this.tractorPlayer.isObserver ? skinInUse : this.gameScene.skinInUse;
                        let skinTypeMe = this.GetSkinType(skinInUseMe);
                        let skinExtentionMe = skinTypeMe === 0 ? "webp" : "gif";
                        let skinURL = `image/tractor/skin/${skinInUseMe}.${skinExtentionMe}`;
                        this.SetAvatarImage(false, this.gameScene, i, skinTypeMe, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight, this.SetObText, p);
                    }

                    // 旁观玩家切换视角/房主将玩家请出房间
                    if ((this.tractorPlayer.isObserver || this.tractorPlayer.CurrentRoomSetting.RoomOwner === this.tractorPlayer.MyOwnId) && i !== 0) {
                        let curPlayerImage = this.gameScene.ui.gameRoomImagesChairOrPlayer[i];
                        curPlayerImage.style.cursor = 'pointer';
                        // click
                        curPlayerImage.addEventListener("click", (e: any) => {
                            let pos = i + 1;
                            if (this.tractorPlayer.isObserver) {
                                this.destroyImagesChairOrPlayer();
                                this.observeByPosition(pos);
                            }
                            else if (this.tractorPlayer.CurrentRoomSetting.RoomOwner === this.tractorPlayer.MyOwnId) {
                                var c = window.confirm("是否确定将此玩家请出房间？");
                                if (c == true) {
                                    this.bootPlayerByPosition(pos);
                                }
                            }
                        });
                        // mouseover
                        curPlayerImage.addEventListener("mouseover", (e: any) => {
                            let targetUI = jQuery(e.target).closest('.player')[0];
                            let pos = parseInt(targetUI.getAttribute('data-position'));
                            if (pos === 2) targetUI.style.top = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y} - 5px)`;
                            else targetUI.style.bottom = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y} + 5px)`;
                        });
                        // mouseout
                        curPlayerImage.addEventListener("mouseout", (e: any) => {
                            let targetUI = jQuery(e.target).closest('.player')[0];
                            let pos = parseInt(targetUI.getAttribute('data-position'));
                            if (pos === 2) targetUI.style.top = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y})`;
                            else targetUI.style.bottom = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y})`;
                        });
                    }
                }
                else {
                    let playerUI = i === 0 ? this.gameScene.ui.gameMe : this.gameScene.ui.gameRoomImagesChairOrPlayer[i];
                    this.SetObText(p, i, this.gameScene, playerUI.clientWidth);
                }
            }

            curIndex = (curIndex + 1) % 4
        }
    }

    private SetObText(p: PlayerEntity, i: number, gs: GameScene, skinWid: number) {
        if (gs.hidePlayerID) return;
        if (p.Observers && p.Observers.length > 0) {
            var obNameText = "";
            let tempWidOb = 0;
            for (let j = 0; j < p.Observers.length; j++) {
                let ob = p.Observers[j];
                if (i === 1) {
                    let tempLenOb = ob.length + 2;
                    let tempLenDeltaOb = (ob.match(gs.coordinates.regexNonEnglishChar) || []).length;
                    let newWid = gs.coordinates.player1TextWid * tempLenOb + gs.coordinates.player1TextWidBigDelta * tempLenDeltaOb;
                    tempWidOb = Math.max(tempWidOb, newWid);
                }
                var newLine = j === 0 || obNameText.length === 0 ? "" : "<br/>";
                obNameText += `${newLine}【${ob}】`
            }
            var pokerPlayerOb = gs.ui.create.div('.pokerPlayerObGameRoom', obNameText, gs.ui.frameGameRoom);
            pokerPlayerOb.style.fontFamily = 'serif';
            pokerPlayerOb.style.fontSize = '16px';
            pokerPlayerOb.style.textAlign = 'left';
            if (gs.ui.pokerPlayerObGameRoom[i]) gs.ui.pokerPlayerObGameRoom[i].remove();
            gs.ui.pokerPlayerObGameRoom[i] = pokerPlayerOb;

            var obX = gs.coordinates.observerTextPositions[i].x;
            var obY = gs.coordinates.observerTextPositions[i].y;
            switch (i) {
                case 0:
                    obX = `calc(${obX} + ${skinWid}px)`;
                    pokerPlayerOb.style.left = `calc(${obX})`;
                    pokerPlayerOb.style.bottom = `calc(${obY})`;
                    break;
                case 1:
                    pokerPlayerOb.style.right = `calc(${obX})`;
                    pokerPlayerOb.style.top = `calc(${obY})`;
                    pokerPlayerOb.style.width = tempWidOb;
                    pokerPlayerOb.style.textAlign = 'right';
                    break;
                case 2:
                    obX = `calc(${obX} + ${skinWid}px)`;
                    pokerPlayerOb.style.left = `calc(${obX})`;
                    pokerPlayerOb.style.top = `calc(${obY})`;
                    break;
                case 3:
                    pokerPlayerOb.style.left = `calc(${obX})`;
                    pokerPlayerOb.style.top = `calc(${obY})`;
                    break;
                default:
                    break;
            }
        }
    }

    public ExitRoomAndEnter(posID: number) {
        this.destroyGameRoom();
        this.gameScene.sendMessageToServer(PLAYER_EXIT_AND_ENTER_ROOM_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify({
            roomID: -1,
            posID: posID,
        }))
    }

    public ExitAndObserve() {
        if (!this.gameScene.ui.btnExitAndObserve || this.gameScene.ui.btnExitAndObserve.classList.contains('hidden') || this.gameScene.ui.btnExitAndObserve.classList.contains('disabled')) return;
        this.gameScene.ui.btnExitAndObserve.show();

        // small games
        // this.btnSmallGames.disableInteractive()
        // this.btnSmallGames.setColor('gray')
        // this.groupSmallGames.setVisible(false);

        this.destroyGameRoom();
        this.gameScene.sendMessageToServer(PLAYER_EXIT_AND_OBSERVE_REQUEST, this.tractorPlayer.MyOwnId, "");
    }

    //     public SmallGamesHandler() {
    //         this.groupSmallGames.toggleVisible();
    //     }

    public ReenterOrResumeOrObservePlayerByIDEvent(drawCards: boolean) {
        this.drawingFormHelper.DrawSidebarFull();
        if (!drawCards) return;
        this.tractorPlayer.playerLocalCache.ShowedCardsInCurrentTrick = CommonMethods.deepCopy<any>(this.tractorPlayer.CurrentTrickState.ShowedCards);
        if (this.tractorPlayer.CurrentTrickState.ShowedCards && Object.keys(this.tractorPlayer.CurrentTrickState.ShowedCards).length == 4) {
            this.tractorPlayer.playerLocalCache.WinnderID = TractorRules.GetWinner(this.tractorPlayer.CurrentTrickState);
            this.tractorPlayer.playerLocalCache.WinResult = this.IsWinningWithTrump(this.tractorPlayer.CurrentTrickState, this.tractorPlayer.playerLocalCache.WinnderID);
        }
        this.PlayerCurrentTrickShowedCards();
        this.drawingFormHelper.ResortMyHandCards(true);
        this.DrawDiscardedCardsCaller();
    }

    public TrumpChanged() {
        this.drawingFormHelper.DrawSidebarFull()
        if (SuitEnums.HandStep.DistributingCards <= this.tractorPlayer.CurrentHandState.CurrentHandStep &&
            this.tractorPlayer.CurrentHandState.CurrentHandStep < SuitEnums.HandStep.DistributingLast8Cards) {
            this.gameScene.playAudio(CommonMethods.audioLiangpai, this.GetPlayerSex(this.tractorPlayer.CurrentHandState.TrumpMaker));
            this.drawingFormHelper.TrumpMadeCardsShow()
        }
        this.drawingFormHelper.reDrawToolbar()
    }

    public TrumpChangedForObservePlayerById() {
        if (SuitEnums.HandStep.DistributingCards <= this.tractorPlayer.CurrentHandState.CurrentHandStep &&
            this.tractorPlayer.CurrentHandState.CurrentHandStep < SuitEnums.HandStep.DistributingLast8Cards) {
            this.drawingFormHelper.TrumpMadeCardsShow()
            this.drawingFormHelper.reDrawToolbar()
        }
    }

    public destroyGameRoom() {
        this.StartGame();
        this.drawingFormHelper.destroySidebar();

        if (this.gameScene.ui.handZone) {
            this.gameScene.ui.handZone.remove();
            delete this.gameScene.ui.handZone
        }
        if (this.gameScene.ui.gameMe) {
            this.gameScene.ui.gameMe.remove();
            delete this.gameScene.ui.gameMe
        }
        delete this.gameScene.ui.roomNameText
        delete this.gameScene.ui.roomOwnerText
        if (this.gameScene.ui.btnPig) {
            this.gameScene.ui.btnPig.remove();
            delete this.gameScene.ui.btnPig;
        }

        this.gameScene.ui.gameRoomImagesChairOrPlayer = [];
        this.gameScene.ui.pokerPlayerObGameRoom = [];
        this.gameScene.ui.pokerPlayerStartersLabel = [];

        if (this.gameScene.ui.btnRobot) {
            this.gameScene.ui.btnRobot.remove();
            delete this.gameScene.ui.btnRobot;
        }
        if (this.gameScene.ui.btnReady) {
            this.gameScene.ui.btnReady.remove();
            delete this.gameScene.ui.btnReady;
        }
        if (this.gameScene.ui.btnQiangliang) {
            this.gameScene.ui.btnQiangliang.remove();
            delete this.gameScene.ui.btnQiangliang;
        }
        if (this.gameScene.ui.btnShowLastTrick) {
            this.gameScene.ui.btnShowLastTrick.remove();
            delete this.gameScene.ui.btnShowLastTrick;
        }
        if (this.gameScene.ui.btnExitAndObserve) {
            this.gameScene.ui.btnExitAndObserve.remove();
            delete this.gameScene.ui.btnExitAndObserve;
        }

        if (this.gameScene.ui.frameGameRoom) {
            this.gameScene.ui.frameGameRoom.remove();
            delete this.gameScene.ui.frameGameRoom;
        }

        this.tractorPlayer.PlayerId = this.tractorPlayer.MyOwnId;
        this.tractorPlayer.isObserver = false;
        if (this.gameScene.ui.gameMe) {
            this.gameScene.ui.gameMe.node.nameol.innerHTML = this.gameScene.hidePlayerID ? "" : this.tractorPlayer.MyOwnId;
            let skinTypeMe = this.GetSkinType(this.gameScene.skinInUse);
            let skinExtentionMe = skinTypeMe === 0 ? "webp" : "gif";
            let skinURL = `image/tractor/skin/${this.gameScene.skinInUse}.${skinExtentionMe}`;
            this.SetAvatarImage(false, this.gameScene, 0, skinTypeMe, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight);
        }

        this.PlayerPosition = {};
        this.PositionPlayer = {};

        //重置状态
        this.tractorPlayer.CurrentGameState = new GameState();
        this.tractorPlayer.CurrentHandState = new CurrentHandState(this.tractorPlayer.CurrentGameState);
    }

    public destroyImagesChairOrPlayer() {
        if (this.gameScene.ui.gameRoomImagesChairOrPlayer) {
            this.gameScene.ui.gameRoomImagesChairOrPlayer.forEach((image: any) => {
                if (image) image.remove();
            })
            this.gameScene.ui.gameRoomImagesChairOrPlayer = [];
        }
    }

    public destroyPokerPlayerStartersLabel() {
        if (this.gameScene.ui.pokerPlayerStartersLabel) {
            this.gameScene.ui.pokerPlayerStartersLabel.forEach((image: any) => {
                if (image) image.remove();
            })
            this.gameScene.ui.pokerPlayerStartersLabel = [];
        }
    }

    public destroyPokerPlayerObGameRoom() {
        if (!this.gameScene.ui.pokerPlayerObGameRoom) {
            this.gameScene.ui.pokerPlayerObGameRoom = [];
        }
        this.gameScene.ui.pokerPlayerObGameRoom.forEach((image: any) => {
            if (image) image.remove();
        })
        this.gameScene.ui.pokerPlayerObGameRoom = [];
    }

    public PlayerOnGetCard(cardNumber: number) {

        //发牌播放提示音
        if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DistributingCards) {
            this.gameScene.playAudio(CommonMethods.audioDraw);
        }

        this.drawingFormHelper.IGetCard(cardNumber);

        //托管代打：亮牌
        let shengbi = 0
        if (this.DaojuInfo && this.DaojuInfo.daojuInfoByPlayer && this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId]) {
            shengbi = parseInt(this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].Shengbi);
        }
        let isUsingQiangliangka = shengbi >= CommonMethods.qiangliangkaCost || this.tractorPlayer.CurrentHandState.TrumpMaker && this.tractorPlayer.CurrentHandState.TrumpMaker === this.tractorPlayer.MyOwnId;
        if (this.IsQiangliang &&
            (this.tractorPlayer.CurrentRoomSetting.IsFullDebug ||
                this.tractorPlayer.CurrentRoomSetting.AllowRobotMakeTrump ||
                isUsingQiangliangka) &&
            !this.tractorPlayer.isObserver) {
            var availableTrump = this.tractorPlayer.AvailableTrumps();
            let qiangliangMin = parseInt(this.gameScene.qiangliangMin);
            let trumpToExpose: number = Algorithm.TryExposingTrump(availableTrump, qiangliangMin, this.tractorPlayer.CurrentHandState.IsFirstHand, this.tractorPlayer.CurrentPoker, this.tractorPlayer.CurrentRoomSetting.IsFullDebug);
            if (trumpToExpose == SuitEnums.Suit.None) return;

            var next = this.tractorPlayer.CurrentHandState.TrumpExposingPoker + 1;
            if (trumpToExpose == SuitEnums.Suit.Joker) {
                if (this.tractorPlayer.CurrentPoker.BlackJoker() == 2)
                    next = SuitEnums.TrumpExposingPoker.PairBlackJoker;
                else if (this.tractorPlayer.CurrentPoker.RedJoker() == 2)
                    next = SuitEnums.TrumpExposingPoker.PairRedJoker;
            }
            // 之前自己抢亮，后来再双亮加持不消耗抢亮卡
            let usedShengbi = 0;
            if (next === SuitEnums.TrumpExposingPoker.SingleRank || this.tractorPlayer.CurrentHandState.TrumpMaker !== this.tractorPlayer.MyOwnId) {
                usedShengbi = 1;
            }
            this.tractorPlayer.ExposeTrump(next, trumpToExpose, usedShengbi);
        }
    }

    public ShowingCardBegan() {
        this.drawingFormHelper.destroyToolbar();
        this.drawingFormHelper.destroyAllShowedCards();
        this.tractorPlayer.destroyAllClientMessages();

        this.drawingFormHelper.DrawScoreImageAndCards();

        //出牌开始前，去掉不需要的controls
        // this.btnSurrender.Visible = false;
        // this.btnRiot.Visible = false;

    }

    public DistributingLast8Cards() {
        this.tractorPlayer.destroyAllClientMessages()
        //先去掉反牌按钮，再放发底牌动画
        this.drawingFormHelper.destroyToolbar();
        //重画手牌，从而把被提升的自己亮的牌放回去
        this.drawingFormHelper.ResortMyHandCards();

        let position = this.PlayerPosition[this.tractorPlayer.CurrentHandState.Last8Holder];
        //自己摸底不用画
        if (position > 1) {
            this.drawingFormHelper.DrawDistributingLast8Cards(position);
        }
        else {
            //播放摸底音效
            this.gameScene.playAudio(CommonMethods.audioDrawx);
        }

        if (this.tractorPlayer.isObserver) {
            return;
        }

        //摸牌结束，如果允许投降，则显示投降按钮
        if (this.tractorPlayer.CurrentRoomSetting.AllowSurrender) {
            // this.btnSurrender.Visible = true;
        }

        //仅允许台下的玩家可以革命
        // if (!this.ThisPlayer.CurrentGameState.ArePlayersInSameTeam(this.ThisPlayer.CurrentHandState.Starter, this.ThisPlayer.PlayerId))
        // {
        //     //摸牌结束，如果允许分数革命，则判断是否该显示革命按钮
        //     int riotScoreCap = ThisPlayer.CurrentRoomSetting.AllowRiotWithTooFewScoreCards;
        //     if (ThisPlayer.CurrentPoker.GetTotalScore() <= riotScoreCap)
        //     {
        //         this.btnRiot.Visible = true;
        //     }

        //     //摸牌结束，如果允许主牌革命，则判断是否该显示革命按钮
        //     int riotTrumpCap = ThisPlayer.CurrentRoomSetting.AllowRiotWithTooFewTrumpCards;
        //     if (ThisPlayer.CurrentPoker.GetMasterCardsCount() <= riotTrumpCap && ThisPlayer.CurrentHandState.Trump != Suit.Joker)
        //     {
        //         this.btnRiot.Visible = true;
        //     }
        // }
    }

    public ResetBtnRobot() {
        //摸牌结束，如果处于托管、抢亮状态，则取消之
        if (this.tractorPlayer.isObserver) return;
        var me: PlayerEntity = CommonMethods.GetPlayerByID(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.MyOwnId);
        if (me.IsRobot && this.gameScene.ui.btnRobot && this.gameScene.ui.btnRobot.innerHTML === "取消" && !this.tractorPlayer.CurrentRoomSetting.IsFullDebug) {
            this.btnRobot_Click()
        }
        if (me.IsQiangliang && this.gameScene.ui.btnQiangliang && this.gameScene.ui.btnQiangliang.innerHTML === "取消" && !this.tractorPlayer.CurrentRoomSetting.IsFullDebug) {
            this.btnQiangliang_Click()
        }
    }

    public StartGame() {
        this.tractorPlayer.CurrentPoker = new CurrentPoker()
        this.tractorPlayer.CurrentPoker.Rank = this.tractorPlayer.CurrentHandState.Rank;

        //游戏开始前重置各种变量
        this.tractorPlayer.ShowLastTrickCards = false;
        this.tractorPlayer.playerLocalCache = new PlayerLocalCache();
        // this.btnSurrender.Visible = false;
        // this.btnRiot.Visible = false;
        this.tractorPlayer.CurrentTrickState.serverLocalCache.lastShowedCards = {}
        this.gameScene.game.timerCurrent = 0;
        if (this.gameScene.ui.btnPig) {
            this.gameScene.ui.btnPig.hide();
            this.gameScene.ui.btnPig.classList.add('disabled')
            this.gameScene.ui.btnPig.classList.remove('pointerdiv');
        }
        this.init();
    }

    public DiscardingLast8() {
        // Graphics g = Graphics.FromImage(bmp);

        // g.DrawImage(image, 200 + drawingFormHelper.offsetCenterHalf, 186 + drawingFormHelper.offsetCenterHalf, 85 * drawingFormHelper.scaleDividend, 96 * drawingFormHelper.scaleDividend);
        // Refresh();
        // g.Dispose();

        //托管代打：埋底
        if (this.IsDebug && !this.tractorPlayer.isObserver) {
            if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards &&
                this.tractorPlayer.CurrentHandState.Last8Holder == this.tractorPlayer.PlayerId) //如果等我扣牌
            {
                this.SelectedCards = []
                Algorithm.ShouldSelectedLast8Cards(this.SelectedCards, this.tractorPlayer.CurrentPoker);
                if (this.SelectedCards.length == 8) {
                    this.ToDiscard8Cards();
                }
                else {
                    alert(`failed to auto select last 8 cards: ${this.SelectedCards}, please manually select`)
                }
            }
        }
    }

    public Last8Discarded() {
        this.gameScene.playAudio(CommonMethods.audioTie);

        if (this.tractorPlayer.isObserver && this.tractorPlayer.CurrentHandState.Last8Holder == this.tractorPlayer.PlayerId) {
            let tempCP = this.tractorPlayer.CurrentHandState.PlayerHoldingCards[this.tractorPlayer.PlayerId]
            this.tractorPlayer.CurrentPoker.CloneFrom(tempCP);
            this.drawingFormHelper.removeCardImage(this.tractorPlayer.CurrentHandState.DiscardedCards);
            this.drawingFormHelper.ResortMyHandCards();
        }
        this.DrawDiscardedCardsCaller(true);
    }

    public DrawDiscardedCardsCaller(doAni?: boolean) {
        if (this.tractorPlayer.CurrentPoker != null && this.tractorPlayer.CurrentPoker.Count() > 0 &&
            this.tractorPlayer.CurrentHandState.DiscardedCards != null &&
            this.tractorPlayer.CurrentHandState.DiscardedCards.length == 8) {
            this.drawingFormHelper.DrawDiscardedCards(doAni);
        }
    }

    public HandEnding() {
        this.drawingFormHelper.DrawFinishedSendedCards()
    }

    public StarterChangedEvent() {
        this.setStartLabels()
    }

    public StarterFailedForTrump() {
        this.drawingFormHelper.DrawSidebarFull();

        this.drawingFormHelper.ResortMyHandCards();

        this.drawingFormHelper.reDrawToolbar();
    }

    //检查当前出牌者的牌是否为大牌：0 - 否；1 - 是；2 - 是且为吊主；3 - 是且为主毙牌
    private IsWinningWithTrump(trickState: CurrentTrickState, playerID: string): number {
        let isLeaderTrump = PokerHelper.IsTrump(trickState.LeadingCards()[0], this.tractorPlayer.CurrentHandState.Trump, this.tractorPlayer.CurrentHandState.Rank);
        if (playerID == trickState.Learder) {
            if (isLeaderTrump) return 2;
            else return 1;
        }
        let winnerID = TractorRules.GetWinner(trickState);
        if (playerID == winnerID) {
            let isWinnerTrump = PokerHelper.IsTrump(trickState.ShowedCards[winnerID][0], this.tractorPlayer.CurrentHandState.Trump, this.tractorPlayer.CurrentHandState.Rank);
            if (!isLeaderTrump && isWinnerTrump) return 3;
            return 1;
        }
        return 0;
    }

    public PlayerShowedCards() {
        if (!this.tractorPlayer.CurrentHandState.PlayerHoldingCards[this.tractorPlayer.CurrentTrickState.Learder]) return;

        //如果新的一轮开始，重置缓存信息
        if (this.tractorPlayer.CurrentTrickState.CountOfPlayerShowedCards() == 1) {
            this.tractorPlayer.playerLocalCache = new PlayerLocalCache();
        }

        let curPoker = new CurrentPoker()
        curPoker.CloneFrom(this.tractorPlayer.CurrentHandState.PlayerHoldingCards[this.tractorPlayer.CurrentTrickState.Learder])
        if (curPoker.Count() == 0) {
            this.tractorPlayer.playerLocalCache.isLastTrick = true;
        }

        let latestPlayer = this.tractorPlayer.CurrentTrickState.LatestPlayerShowedCard();
        this.tractorPlayer.playerLocalCache.ShowedCardsInCurrentTrick = CommonMethods.deepCopy<any>(this.tractorPlayer.CurrentTrickState.ShowedCards)

        let winResult = this.IsWinningWithTrump(this.tractorPlayer.CurrentTrickState, latestPlayer);
        let position = this.PlayerPosition[latestPlayer];
        let showedCards: number[] = this.tractorPlayer.CurrentTrickState.ShowedCards[latestPlayer]
        //如果大牌变更，更新缓存相关信息
        if (winResult >= this.firstWinNormal) {
            if (winResult < this.firstWinBySha || this.tractorPlayer.playerLocalCache.WinResult < this.firstWinBySha) {
                this.tractorPlayer.playerLocalCache.WinResult = winResult;
            }
            else {
                this.tractorPlayer.playerLocalCache.WinResult++;
            }
            this.tractorPlayer.playerLocalCache.WinnerPosition = position;
            this.tractorPlayer.playerLocalCache.WinnderID = latestPlayer;
        }

        //如果不在回看上轮出牌，才重画刚刚出的牌
        if (!this.tractorPlayer.ShowLastTrickCards) {
            //擦掉上一把
            if (this.tractorPlayer.CurrentTrickState.CountOfPlayerShowedCards() == 1) {
                this.tractorPlayer.destroyAllClientMessages()
                this.drawingFormHelper.destroyAllShowedCards()
                this.drawingFormHelper.DrawScoreImageAndCards();
            }

            //播放出牌音效
            if (this.tractorPlayer.CurrentRoomSetting.HideOverridingFlag) {
                this.gameScene.playAudio(0, this.GetPlayerSex(latestPlayer));
            } else if (!this.tractorPlayer.playerLocalCache.isLastTrick &&
                !this.IsDebug &&
                !this.tractorPlayer.CurrentTrickState.serverLocalCache.muteSound) {
                let soundInex = winResult;
                if (winResult > 0) soundInex = this.tractorPlayer.playerLocalCache.WinResult;
                this.gameScene.playAudio(soundInex, this.GetPlayerSex(latestPlayer));
            }

            this.drawingFormHelper.DrawShowedCardsByPosition(showedCards, position);
        }

        // 如果正在回看，且：
        // - 如果设置“仅自己出牌时才自动退出上轮回看模式”开启，自己刚刚出了牌
        // - 或者有人刚刚出了牌
        // 则重置回看，重新画牌
        if (this.tractorPlayer.ShowLastTrickCards && (this.gameScene.onlyMeShowCardCancelLastTrickView.toLowerCase() !== "true" || latestPlayer == this.tractorPlayer.PlayerId)) {
            this.HandleRightClickEmptyArea();
        }

        //即时更新旁观手牌
        if (this.tractorPlayer.isObserver && this.tractorPlayer.PlayerId == latestPlayer) {
            this.tractorPlayer.CurrentPoker.CloneFrom(this.tractorPlayer.CurrentHandState.PlayerHoldingCards[this.tractorPlayer.PlayerId])
            this.drawingFormHelper.removeCardImage(showedCards);
            this.drawingFormHelper.ResortMyHandCards();
        }

        if (winResult > 0) {
            this.drawingFormHelper.DrawOverridingFlag(showedCards.length, this.PlayerPosition[this.tractorPlayer.playerLocalCache.WinnderID], this.tractorPlayer.playerLocalCache.WinResult - 1, true);

            //拖拉机动画
            let showedPoker = new CurrentPoker()
            showedPoker.Trump = this.tractorPlayer.CurrentTrickState.Trump;
            showedPoker.Rank = this.tractorPlayer.CurrentTrickState.Rank;
            showedCards.forEach(card => {
                showedPoker.AddCard(card);
            })
            let showedTractors: number[];
            if (winResult < 3) {
                showedTractors = showedPoker.GetTractorBySuit(this.tractorPlayer.CurrentTrickState.LeadingSuit());
            } else {
                showedTractors = showedPoker.GetTractorBySuit(this.tractorPlayer.CurrentHandState.Trump);
            }
            if (showedTractors.length > 1) this.drawingFormHelper.DrawMovingTractorByPosition(showedCards.length, position);
        }

        this.RobotPlayFollowing();
    }

    //托管代打
    private RobotPlayFollowing() {
        if (this.tractorPlayer.isObserver) return
        //跟出
        if ((this.tractorPlayer.playerLocalCache.isLastTrick || this.IsDebug) && !this.tractorPlayer.isObserver &&
            this.tractorPlayer.CurrentTrickState.NextPlayer() == this.tractorPlayer.PlayerId &&
            this.tractorPlayer.CurrentTrickState.IsStarted()) {
            let tempSelectedCards: number[] = []
            Algorithm.MustSelectedCards(tempSelectedCards, this.tractorPlayer.CurrentTrickState, this.tractorPlayer.CurrentPoker);

            this.SelectedCards = []
            let myCardsNumber = this.gameScene.cardImages
            for (let i = 0; i < myCardsNumber.length; i++) {
                let serverCardNumber: number = parseInt(myCardsNumber[i].getAttribute("serverCardNumber"));
                if (tempSelectedCards.includes(serverCardNumber)) {
                    this.SelectedCards.push(serverCardNumber);
                    tempSelectedCards = CommonMethods.ArrayRemoveOneByValue(tempSelectedCards, serverCardNumber);
                }
            }

            let showingCardsValidationResult: ShowingCardsValidationResult =
                TractorRules.IsValid(this.tractorPlayer.CurrentTrickState, this.SelectedCards, this.tractorPlayer.CurrentPoker);
            if (showingCardsValidationResult.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid) {
                setTimeout(() => {
                    this.ToShowCards();
                }, 250);
            }
            else {

                alert(`failed to auto select cards: ${this.SelectedCards}, please manually select`)
            }
            return;
        }

        //跟选：如果玩家没有事先手动选牌，在有必选牌的情况下自动选择必选牌，方便玩家快捷出牌
        if (this.SelectedCards.length == 0 &&
            !this.tractorPlayer.isObserver &&
            this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing &&
            this.tractorPlayer.CurrentTrickState.NextPlayer() == this.tractorPlayer.PlayerId &&
            this.tractorPlayer.CurrentTrickState.IsStarted()) {
            //如果选了牌，则重画手牌，方便直接点确定出牌
            let tempSelectedCards: number[] = []
            Algorithm.MustSelectedCardsNoShow(tempSelectedCards, this.tractorPlayer.CurrentTrickState, this.tractorPlayer.CurrentPoker);
            if (tempSelectedCards.length > 0) {
                this.SelectedCards = []
                let myCardsNumber = this.gameScene.cardImages
                for (let i = 0; i < myCardsNumber.length; i++) {
                    let serverCardNumber: number = parseInt(myCardsNumber[i].getAttribute("serverCardNumber"));
                    if (tempSelectedCards.includes(serverCardNumber)) {
                        this.myCardIsReady[i] = true;
                        this.SelectedCards.push(serverCardNumber);
                        tempSelectedCards = CommonMethods.ArrayRemoveOneByValue(tempSelectedCards, serverCardNumber);
                        //将选定的牌向上提升 via gameScene.cardImages
                        let toAddImage = this.gameScene.cardImages[i] as any;
                        if (!toAddImage || !toAddImage.getAttribute("status") || toAddImage.getAttribute("status") === "down") {
                            toAddImage.setAttribute("status", "up");
                            toAddImage.style.transform = `translate(0px, -${CommonMethods.cardTiltHeight}px)`;
                        }
                    }
                }
                this.gameScene.sendMessageToServer(CardsReady_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.myCardIsReady));
            }
        }
        this.drawingFormHelper.validateSelectedCards()
    }

    //托管代打，先手
    private RobotPlayStarting() {
        if (this.IsDebug && !this.tractorPlayer.isObserver &&
            (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing || this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8CardsFinished)) {
            if (!this.tractorPlayer.CurrentTrickState.Learder) return;
            if (this.tractorPlayer.CurrentTrickState.NextPlayer() != this.tractorPlayer.PlayerId) return;
            if (this.tractorPlayer.CurrentTrickState.IsStarted()) return;

            this.SelectedCards = [];
            Algorithm.ShouldSelectedCards(this.SelectedCards, this.tractorPlayer.CurrentTrickState, this.tractorPlayer.CurrentPoker);
            let showingCardsValidationResult: ShowingCardsValidationResult =
                TractorRules.IsValid(this.tractorPlayer.CurrentTrickState, this.SelectedCards, this.tractorPlayer.CurrentPoker);
            if (showingCardsValidationResult.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid) {
                setTimeout(() => {
                    this.ToShowCards();
                }, 250);
            }
            else {
                alert(`failed to auto select cards: ${this.SelectedCards}, please manually select`)
            }
        }
    }

    public TrickFinished() {
        this.drawingFormHelper.DrawScoreImageAndCards();
    }

    public TrickStarted() {
        if (!this.IsDebug && this.tractorPlayer.CurrentTrickState.Learder == this.tractorPlayer.PlayerId) {
            this.drawingFormHelper.DrawMyPlayingCards();
        }
        this.RobotPlayStarting();
    }

    private init() {
        //每次初始化都重绘背景
        this.tractorPlayer.destroyAllClientMessages();
        this.drawingFormHelper.destroyAllCards();
        this.drawingFormHelper.destroyAllShowedCards();
        this.drawingFormHelper.destroyToolbar();
        this.drawingFormHelper.destroyScoreImageAndCards();
        this.drawingFormHelper.destroyLast8Cards();
        this.drawingFormHelper.DrawSidebarFull();
    }

    public setStartLabels() {
        let onesTurnPlayerID: string = "";
        let isShowCards: boolean = false;
        if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards) {
            onesTurnPlayerID = this.tractorPlayer.CurrentHandState.Last8Holder;
            isShowCards = false;
        } else if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing &&
            Object.keys(this.tractorPlayer.CurrentTrickState.ShowedCards).length > 0) {
            onesTurnPlayerID = this.tractorPlayer.CurrentTrickState.NextPlayer();
            isShowCards = true;
        }
        var curIndex = CommonMethods.GetPlayerIndexByID(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.PlayerId)
        if (curIndex < 0) return;
        for (let i = 0; i < 4; i++) {
            (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).style.color = "orange";

            var curPlayer = this.tractorPlayer.CurrentGameState.Players[curIndex];

            let isUsingQiangliangka = false;
            if (curPlayer && curPlayer.IsQiangliang && this.tractorPlayer.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.DistributingCards) {
                let shengbi = 0
                if (this.DaojuInfo && this.DaojuInfo.daojuInfoByPlayer && this.DaojuInfo.daojuInfoByPlayer[curPlayer.PlayerId]) {
                    shengbi = parseInt(this.DaojuInfo.daojuInfoByPlayer[curPlayer.PlayerId].Shengbi);
                }
                isUsingQiangliangka = shengbi >= CommonMethods.qiangliangkaCost;
            }

            if (curPlayer && curPlayer.IsOffline) {
                (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = "离线中";
            }
            else if (curPlayer && curPlayer.PlayingSG) {
                (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = curPlayer.PlayingSG;
            }
            else if (curPlayer && curPlayer.IsRobot) {
                (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = "托管中";
            }
            else if (isUsingQiangliangka) {
                (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = "抢亮卡";
            }
            else if (curPlayer && !curPlayer.IsReadyToStart) {
                (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = "思索中";
            }
            else {
                if (curPlayer && onesTurnPlayerID && curPlayer.PlayerId === onesTurnPlayerID) {
                    (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = isShowCards ? "出牌中" : "埋底中";
                    (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).style.color = "yellow";
                } else if (curPlayer && this.tractorPlayer.CurrentHandState.Starter && curPlayer.PlayerId == this.tractorPlayer.CurrentHandState.Starter) {
                    (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = "庄家";
                }
                else {
                    (this.gameScene.ui.pokerPlayerStartersLabel[i] as any).innerHTML = `${curIndex + 1}`;
                }
            }
            curIndex = (curIndex + 1) % 4
        }
    }

    private btnReady_Click() {
        if (!this.gameScene.ui.btnReady || this.gameScene.ui.btnReady.classList.contains('hidden') || this.gameScene.ui.btnReady.classList.contains('disabled')) return;
        //为防止以外连续点两下开始按钮，造成重复发牌，点完一下就立即disable开始按钮
        this.gameScene.ui.btnReady.classList.add('disabled');
        this.gameScene.ui.btnReady.classList.remove('pointerdiv');

        this.gameScene.sendMessageToServer(ReadyToStart_REQUEST, this.tractorPlayer.PlayerId, "")
    }

    private btnQiangliang_Click() {
        if (!this.gameScene.ui.btnQiangliang || this.gameScene.ui.btnQiangliang.classList.contains('hidden') || this.gameScene.ui.btnQiangliang.classList.contains('disabled')) return;
        this.gameScene.sendMessageToServer(ToggleIsQiangliang_REQUEST, this.tractorPlayer.PlayerId, "")
    }

    private btnRobot_Click() {
        if (!this.gameScene.ui.btnRobot || this.gameScene.ui.btnRobot.classList.contains('hidden') || this.gameScene.ui.btnRobot.classList.contains('disabled')) return;
        this.gameScene.sendMessageToServer(ToggleIsRobot_REQUEST, this.tractorPlayer.PlayerId, "")
    }

    private btnQiandao_Click() {
        if (!this.gameScene.ui.btnQiandao || this.gameScene.ui.btnQiandao.classList.contains('hidden') || this.gameScene.ui.btnQiandao.classList.contains('disabled')) return;
        this.gameScene.sendMessageToServer(PLAYER_QIANDAO_REQUEST, this.gameScene.playerName, "");
    }

    // pos is 1-based
    private observeByPosition(pos: number) {
        if (this.tractorPlayer.isObserver && this.PositionPlayer[pos]) {
            this.gameScene.sendMessageToServer(ObserveNext_REQUEST, this.tractorPlayer.MyOwnId, this.PositionPlayer[pos])
        }
    }

    // pos is 1-based
    private bootPlayerByPosition(pos: number) {
        if (this.PositionPlayer[pos]) {
            let playerID = this.PositionPlayer[pos];
            this.gameScene.sendMessageToServer(ExitRoom_REQUEST, playerID, `${ExitRoom_REQUEST_TYPE_BootPlayer}`);
        }
    }

    public LoadUIUponConnect() {
        if (!this.gameScene.isReplayMode) {
            this.gameScene.ui.btnQiandao = this.gameScene.ui.create.system('签到领福利', () => { this.btnQiandao_Click(); }, true);
            this.gameScene.ui.btnQiandao.hide();
        }
        this.EnableShortcutKeys();
        this.gameScene.ui.gameSettings = this.gameScene.ui.create.system('设置', () => this.btnGameSettings_Click(), true);
        this.gameScene.ui.exitTractor = this.gameScene.ui.create.system('退出', () => this.btnExitRoom_Click(), true);
    }

    private btnGameSettings_Click() {
        if (this.gameScene.ui.inputFormWrapper) return;

        var inputFormWrapper = this.gameScene.ui.create.div(this.gameScene.ui.frameMain);
        inputFormWrapper.id = "inputFormWrapper";
        inputFormWrapper.style.position = 'absolute';
        inputFormWrapper.style.top = 'calc(25%)';
        inputFormWrapper.style.left = 'calc(25%)';
        inputFormWrapper.style.width = 'calc(50%)';
        inputFormWrapper.style.height = 'calc(50%)';
        inputFormWrapper.style.color = 'black';
        inputFormWrapper.style.textShadow = 'none';
        inputFormWrapper.style.zIndex = CommonMethods.zIndexSettingsForm;

        this.gameScene.ui.inputFormWrapper = inputFormWrapper;

        jQuery(inputFormWrapper).load("game/tractor/src/text/settings_form.htm", (response: any, status: any, xhr: any) => { this.renderSettingsForm(response, status, xhr, this.gameScene) });
    }

    public renderSettingsForm(response: any, status: any, xhr: any, gs: GameScene) {
        if (status == "error") {
            var msg = "renderSettingsForm error: ";
            console.log(msg + xhr.status + " " + xhr.statusText);
            return;
        }
        if (!gs.ui.inputFormWrapper) return;

        let txtMaxReplays: any = document.getElementById("txtMaxReplays")
        txtMaxReplays.value = IDBHelper.maxReplays
        txtMaxReplays.oninput = () => {
            let maxString = txtMaxReplays.value;
            let maxInt = 0;
            if (CommonMethods.IsNumber(maxString)) {
                maxInt = Math.max(maxInt, parseInt(maxString));
            }
            IDBHelper.maxReplays = maxInt
            gs.game.saveConfig("maxReplays", maxInt);
        }

        let divReplayCount: any = document.getElementById("divReplayCount")
        IDBHelper.GetReplayCount(divReplayCount);

        let btnCleanupReplays: any = document.getElementById("btnCleanupReplays")
        btnCleanupReplays.onclick = () => {
            var c = window.confirm("你确定要清空所有录像文件吗？");
            if (c === false) {
                return
            }
            IDBHelper.CleanupReplayEntity(() => {
                this.ReinitReplayEntities(this);
                if (gs.isReplayMode) this.tractorPlayer.NotifyMessage(["已尝试清空全部录像文件"]);
            });
            this.resetGameRoomUI();
        }

        let btnCleanupLocalResources: any = document.getElementById("btnCleanupLocalResources")
        btnCleanupLocalResources.onclick = () => {
            var c = window.confirm("你确定要清空缓存资源并刷新吗？");
            if (c === false) {
                return
            }
            IDBHelper.CleanupAvatarResources(() => {
                localStorage.removeItem(CommonMethods.storageFileForCardsKey);
                window.location.reload()
            });
        }

        let btnExportZipFile: any = document.getElementById("btnExportZipFile")
        btnExportZipFile.onclick = () => {
            FileHelper.ExportZipFile();
            this.resetGameRoomUI();
        }

        let inputRecordingFile: any = document.getElementById("inputRecordingFile")
        inputRecordingFile.onchange = () => {
            let fileName = inputRecordingFile.value;
            let extension = fileName.split('.').pop();
            if (!["json", "zip"].includes(extension.toLowerCase())) {
                alert("unsupported file type!");
                return;
            }
            if (!inputRecordingFile || !inputRecordingFile.files || inputRecordingFile.files.length <= 0) {
                alert("No file has been selected!");
                return;
            }
            if (extension.toLowerCase() === "json") {
                FileHelper.ImportJsonFile(inputRecordingFile.files[0], () => {
                    this.ReinitReplayEntities(this);
                    if (gs.isReplayMode) this.tractorPlayer.NotifyMessage(["已尝试加载本地录像文件"]);
                });
            } else {
                FileHelper.ImportZipFile(inputRecordingFile.files[0], () => {
                    this.ReinitReplayEntities(this);
                    if (gs.isReplayMode) this.tractorPlayer.NotifyMessage(["已尝试加载本地录像文件"]);
                });
            }
            this.resetGameRoomUI();
        }

        let cbxUseCardUIStyleClassic: any = document.getElementById("cbxUseCardUIStyleClassic");
        cbxUseCardUIStyleClassic.checked = gs.useCardUIStyleClassic;
        cbxUseCardUIStyleClassic.onchange = () => {
            gs.useCardUIStyleClassic = cbxUseCardUIStyleClassic.checked;
            gs.game.saveConfig("useCardUIStyleClassic", gs.useCardUIStyleClassic);
        }

        let noDanmu: any = document.getElementById("cbxNoDanmu");
        noDanmu.checked = gs.noDanmu.toLowerCase() === "true";
        noDanmu.onchange = () => {
            gs.noDanmu = noDanmu.checked.toString();
            gs.game.saveConfig("noDanmu", gs.noDanmu);
        }

        let cbxHidePlayerID: any = document.getElementById("cbxHidePlayerID");
        cbxHidePlayerID.checked = gs.hidePlayerID;
        cbxHidePlayerID.onchange = () => {
            gs.hidePlayerID = cbxHidePlayerID.checked;
            gs.game.saveConfig("hidePlayerID", gs.hidePlayerID);
        }

        let cbxCutCards: any = document.getElementById("cbxCutCards")
        cbxCutCards.checked = gs.noCutCards.toLowerCase() === "true"
        cbxCutCards.onchange = () => {
            gs.noCutCards = cbxCutCards.checked.toString();
            gs.game.saveConfig("noCutCards", gs.noCutCards);
        }

        let cbxYesDragSelect: any = document.getElementById("cbxYesDragSelect")
        cbxYesDragSelect.checked = gs.yesDragSelect.toLowerCase() === "true"
        cbxYesDragSelect.onchange = () => {
            gs.yesDragSelect = cbxYesDragSelect.checked.toString();
            gs.game.saveConfig("yesDragSelect", gs.yesDragSelect);
        }

        let cbxOnlyMeShowCardCancelLastTrickView: any = document.getElementById("cbxOnlyMeShowCardCancelLastTrickView")
        cbxOnlyMeShowCardCancelLastTrickView.checked = gs.onlyMeShowCardCancelLastTrickView.toLowerCase() === "true"
        cbxOnlyMeShowCardCancelLastTrickView.onchange = () => {
            gs.onlyMeShowCardCancelLastTrickView = cbxOnlyMeShowCardCancelLastTrickView.checked.toString();
            gs.game.saveConfig("onlyMeShowCardCancelLastTrickView", gs.onlyMeShowCardCancelLastTrickView);
        }

        let noTouchDevice: any = document.getElementById("cbxNoTouchDevice");
        noTouchDevice.checked = gs.noTouchDevice.toLowerCase() === "true";
        noTouchDevice.onchange = () => {
            gs.noTouchDevice = noTouchDevice.checked.toString();
            gs.game.saveConfig("noTouchDevice", gs.noTouchDevice);
        }

        if (gs.isReplayMode) return;

        // 以下为需要连接服务器才能显示的设置

        let pNoDongtu: any = document.getElementById("pNoDongtu");
        pNoDongtu.style.display = "block";
        let noDongtuUntilExpDate: any = document.getElementById("lblNoDongtuUntilExpDate");
        if (!this.isNoDongtuUntilExpired(this.DaojuInfo)) {
            noDongtuUntilExpDate.style.display = "block";
            noDongtuUntilExpDate.innerHTML = `有效期至${this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].noDongtuUntil}`;
        }
        let noDongtu: any = document.getElementById("cbxNoDongtu");
        noDongtu.checked = gs.noDongtu.toLowerCase() === "true";
        noDongtu.onchange = () => {
            if (noDongtu.checked && this.isNoDongtuUntilExpired(this.DaojuInfo)) {
                noDongtu.checked = false;
                this.buyNoDongtuUntil();
            }
            else {
                gs.noDongtu = noDongtu.checked.toString();
                gs.game.saveConfig("noDongtu", gs.noDongtu);
                this.UpdateSkinStatus();
            }
        }

        // 游戏道具栏
        let divDaojuWrapper: any = document.getElementById("divDaojuWrapper");
        divDaojuWrapper.style.display = "block";

        // 升币
        let lblShengbi: any = document.getElementById("lblShengbi");
        let shengbiNum = 0;
        if (this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId]) {
            shengbiNum = this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].Shengbi;
        }
        lblShengbi.innerHTML = shengbiNum;

        let btnShengbiLeadingBoard: any = document.getElementById("btnShengbiLeadingBoard")
        btnShengbiLeadingBoard.onclick = () => {
            let divShengbiLeadingBoard: any = document.getElementById("divShengbiLeadingBoard")
            divShengbiLeadingBoard.style.width = "100%";
            divShengbiLeadingBoard.innerHTML = "";

            let shengbiLeadingBoard = this.DaojuInfo.shengbiLeadingBoard;
            if (!shengbiLeadingBoard) return;

            let sortable = [];
            for (const [key, value] of Object.entries(shengbiLeadingBoard)) {
                sortable.push([key, (value as number)]);
            }
            sortable.sort(function (a: any, b: any) {
                return a[1] !== b[1] ? -1 * (a[1] - b[1]) : (a[0] <= b[0] ? -1 : 1);
            });
            var ul = document.createElement("ul");
            for (let i = 0; i < sortable.length; i++) {
                var li = document.createElement("li");
                li.innerText = `【${sortable[i][0]}】${sortable[i][1]}`;
                ul.appendChild(li);
            }
            divShengbiLeadingBoard.appendChild(ul);
        }

        // 抢亮卡
        let selectQiangliangMin: any = document.getElementById("selectQiangliangMin")
        selectQiangliangMin.value = gs.qiangliangMin;
        selectQiangliangMin.onchange = () => {
            gs.qiangliangMin = selectQiangliangMin.value;
            gs.game.saveConfig("qiangliangMin", gs.qiangliangMin);
        }
        // 皮肤
        let selectFullSkinInfo: any = document.getElementById("selectFullSkinInfo")
        this.UpdateSkinInfoUI(false);
        selectFullSkinInfo.onchange = () => {
            this.UpdateSkinInfoUI(true);
        }

        let btnBuyOrUseSelectedSkin: any = document.getElementById("btnBuyOrUseSelectedSkin")
        btnBuyOrUseSelectedSkin.onclick = () => {
            let skinName = selectFullSkinInfo.value;
            let isSkinOwned = this.IsSkinOwned(skinName);
            if (isSkinOwned) {
                gs.sendMessageToServer(BUY_USE_SKIN_REQUEST, this.tractorPlayer.MyOwnId, skinName);
                this.resetGameRoomUI();
                return;
            }
            let isSkinAfordableWithConfMsg: any[] = this.IsSkinAfordableWithConfMsg(skinName);
            let isSkinAfordable = isSkinAfordableWithConfMsg[0] as boolean;
            if (!isSkinAfordable) {
                alert("升币余额不足，无法购买此皮肤")
            } else {
                let doTransaction = true;
                let msg = isSkinAfordableWithConfMsg[1] as string;
                if (msg && msg.length > 0) {
                    var c = window.confirm(msg);
                    if (!c) {
                        doTransaction = false;
                    }
                }
                if (doTransaction) {
                    gs.sendMessageToServer(BUY_USE_SKIN_REQUEST, this.tractorPlayer.MyOwnId, skinName);
                    this.resetGameRoomUI();
                }
            }
        }

        if (gs.isInGameRoom()) {
            let cbxNoOverridingFlag: any = document.getElementById("cbxNoOverridingFlag");
            cbxNoOverridingFlag.checked = this.tractorPlayer.CurrentRoomSetting.HideOverridingFlag;
            cbxNoOverridingFlag.onchange = () => {
                this.tractorPlayer.CurrentRoomSetting.HideOverridingFlag = cbxNoOverridingFlag.checked;
                gs.sendMessageToServer(SaveRoomSetting_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.tractorPlayer.CurrentRoomSetting));
            };

            let cbxNoSignalCard: any = document.getElementById("cbxNoSignalCard");
            cbxNoSignalCard.checked = !this.tractorPlayer.CurrentRoomSetting.DisplaySignalCardInfo;
            cbxNoSignalCard.onchange = () => {
                this.tractorPlayer.CurrentRoomSetting.DisplaySignalCardInfo = !cbxNoSignalCard.checked;
                gs.sendMessageToServer(SaveRoomSetting_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.tractorPlayer.CurrentRoomSetting));
            };

            let selectSecondsToShowCards: any = document.getElementById("selectSecondsToShowCards");
            selectSecondsToShowCards.value = this.tractorPlayer.CurrentRoomSetting.secondsToShowCards;
            selectSecondsToShowCards.onchange = () => {
                this.tractorPlayer.CurrentRoomSetting.secondsToShowCards = selectSecondsToShowCards.value;
                gs.sendMessageToServer(SaveRoomSetting_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.tractorPlayer.CurrentRoomSetting));
            };

            let selectSecondsToDiscardCards: any = document.getElementById("selectSecondsToDiscardCards");
            selectSecondsToDiscardCards.value = this.tractorPlayer.CurrentRoomSetting.secondsToDiscardCards;
            selectSecondsToDiscardCards.onchange = () => {
                this.tractorPlayer.CurrentRoomSetting.secondsToDiscardCards = selectSecondsToDiscardCards.value;
                gs.sendMessageToServer(SaveRoomSetting_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.tractorPlayer.CurrentRoomSetting));
            };

            let divRoomSettingsWrapper: any = document.getElementById("divRoomSettingsWrapper");
            divRoomSettingsWrapper.style.display = "block";
            if (this.tractorPlayer.CurrentRoomSetting.RoomOwner !== this.tractorPlayer.MyOwnId) {
                cbxNoOverridingFlag.disabled = true;
                cbxNoSignalCard.disabled = true;
                selectSecondsToShowCards.disabled = true;
                selectSecondsToDiscardCards.disabled = true;
            } else {
                let divRoomSettings: any = document.getElementById("divRoomSettings");
                divRoomSettings.style.display = "block";
                let btnResumeGame: any = document.getElementById("btnResumeGame")
                btnResumeGame.onclick = () => {
                    if (CommonMethods.AllOnline(this.tractorPlayer.CurrentGameState.Players) && !this.tractorPlayer.isObserver && SuitEnums.HandStep.DistributingCards <= this.tractorPlayer.CurrentHandState.CurrentHandStep && this.tractorPlayer.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.Playing) {
                        alert("游戏中途不允许继续牌局,请完成此盘游戏后重试")
                    } else {
                        gs.sendMessageToServer(ResumeGameFromFile_REQUEST, this.tractorPlayer.MyOwnId, "");
                    }
                    this.resetGameRoomUI();
                }

                let btnRandomSeat: any = document.getElementById("btnRandomSeat")
                btnRandomSeat.onclick = () => {
                    if (CommonMethods.AllOnline(this.tractorPlayer.CurrentGameState.Players) && !this.tractorPlayer.isObserver && SuitEnums.HandStep.DistributingCards <= this.tractorPlayer.CurrentHandState.CurrentHandStep && this.tractorPlayer.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.Playing) {
                        alert("游戏中途不允许随机组队,请完成此盘游戏后重试")
                    } else {
                        gs.sendMessageToServer(RandomSeat_REQUEST, this.tractorPlayer.MyOwnId, "");
                    }
                    this.resetGameRoomUI();
                }

                let btnSwapSeat: any = document.getElementById("btnSwapSeat")
                btnSwapSeat.onclick = () => {
                    if (CommonMethods.AllOnline(this.tractorPlayer.CurrentGameState.Players) && !this.tractorPlayer.isObserver && SuitEnums.HandStep.DistributingCards <= this.tractorPlayer.CurrentHandState.CurrentHandStep && this.tractorPlayer.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.Playing) {
                        alert("游戏中途不允许互换座位,请完成此盘游戏后重试")
                    } else {
                        let selectSwapSeat: any = document.getElementById("selectSwapSeat")
                        gs.sendMessageToServer(SwapSeat_REQUEST, this.tractorPlayer.MyOwnId, selectSwapSeat.value);
                    }
                    this.resetGameRoomUI();
                }
            }
        }
    }

    public isNoDongtuUntilExpired(daojuInfo: any): boolean {
        if (!daojuInfo || !daojuInfo.daojuInfoByPlayer || !daojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].noDongtuUntil) return true;
        let dExp = new Date(daojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].noDongtuUntil);
        let dNow = new Date();

        return dExp < dNow;
    }

    public isChatBanned(pid: string): boolean {
        if (Object.keys(this.DaojuInfo).length === 0) {
            console.log("this.DaojuInfo is empty");
        } else if (Object.keys(this.DaojuInfo.daojuInfoByPlayer).length === 0) {
            console.log("this.DaojuInfo.daojuInfoByPlayer is empty");
        } else if (!this.DaojuInfo.daojuInfoByPlayer.hasOwnProperty(pid)) {
            console.log(`this.DaojuInfo.daojuInfoByPlayer is missing playerID as key: ${pid}`);
        }
        if (this.DaojuInfo.daojuInfoByPlayer[pid].noChatUntil) {
            let dBanned = new Date(this.DaojuInfo.daojuInfoByPlayer[pid].noChatUntil);
            let dNow = new Date();
            return dNow < dBanned;
        }
        return false;
    }

    private btnExitRoom_Click() {
        if (this.gameScene.isReplayMode) {
            window.location.reload()
            return
        }
        if (CommonMethods.AllOnline(this.tractorPlayer.CurrentGameState.Players) && !this.tractorPlayer.isObserver && SuitEnums.HandStep.DiscardingLast8Cards <= this.tractorPlayer.CurrentHandState.CurrentHandStep && this.tractorPlayer.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.Playing) {
            var c = window.confirm("游戏进行中退出将会重启游戏，是否确定退出？");
            if (c == true) {
                window.location.reload()
            }
            return
        }
        if (this.gameScene.isInGameRoom()) {
            this.gameScene.sendMessageToServer(ExitRoom_REQUEST, this.tractorPlayer.MyOwnId, "")
            return
        }
        window.location.reload()
    }

    private handleSelectPresetMsgsClick(selectPresetMsgs: any) {
        if (this.selectPresetMsgsIsOpen) {
            this.selectPresetMsgsIsOpen = false;
            this.sendPresetMsgs(selectPresetMsgs);
        } else {
            this.selectPresetMsgsIsOpen = true;
        }
    }

    private sendPresetMsgs(selectPresetMsgs: any) {
        let selectedIndex = selectPresetMsgs.selectedIndex;
        let selectedValue = selectPresetMsgs.value;
        let args: (string | number)[] = [selectedIndex, CommonMethods.GetRandomInt(CommonMethods.winEmojiLength), selectedValue];
        this.sendEmojiWithCheck(args);
    }

    private emojiSubmitEventhandler() {
        let emojiType = -1;
        let emojiIndex = -1;
        let msgString = this.gameScene.ui.textAreaChatMsg.value;
        if (msgString) {
            msgString = msgString.trim().replace(/(\r\n|\n|\r)/gm, "");
        }
        this.gameScene.ui.textAreaChatMsg.value = "";
        if (!msgString) {
            msgString = this.gameScene.ui.selectPresetMsgs.value;
            emojiType = this.gameScene.ui.selectPresetMsgs.selectedIndex;
            emojiIndex = CommonMethods.GetRandomInt(CommonMethods.winEmojiLength);
        } else if (msgString.startsWith(CommonMethods.sendBroadcastPrefix)) {
            // SendBroadcast
            this.sendBroadcastMsgType(msgString);
            return;
        }
        let args: (string | number)[] = [emojiType, emojiIndex, msgString];
        this.sendEmojiWithCheck(args)
    }

    public sendBroadcastMsgType(msg: string) {
        if (this.isChatBanned(this.tractorPlayer.MyOwnId)) {
            alert(`禁言生效中，请在解禁后重试，解禁日期：${this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].noChatUntil}`)
            return;
        }

        let chatQuota = 0
        let shengbi = 0
        if (this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId]) {
            chatQuota = parseInt(this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].ChatQuota);
            shengbi = parseInt(this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].Shengbi);
        }
        if (chatQuota + shengbi < CommonMethods.sendBroadcastCost) {
            alert("聊天卡/升币余额不足，无法发送广播消息")
            return;
        }

        this.gameScene.sendMessageToServer(CommonMethods.SendBroadcast_REQUEST, this.tractorPlayer.MyOwnId, msg);
    }

    public buyNoDongtuUntil() {
        let shengbi = 0
        if (this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId]) {
            shengbi = parseInt(this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].Shengbi);
        }
        if (shengbi < CommonMethods.buyNoDongtuUntilCost) {
            alert("升币余额不足，无法关闭动图")
            return;
        }

        let msg = `此次购买将消耗升币【${CommonMethods.buyNoDongtuUntilCost}】，购买前余额：【${shengbi}】，购买后余额：【${shengbi - CommonMethods.buyNoDongtuUntilCost}】，是否确定？`;
        var c = window.confirm(msg);
        if (!c) return;
        this.gameScene.sendMessageToServer(CommonMethods.BuyNoDongtuUntil_REQUEST, this.tractorPlayer.MyOwnId, "");
        this.resetGameRoomUI();
    }

    public blurChat() {
        if (!this.gameScene.ui.textAreaChatMsg) return;
        // this.gameScene.ui.textAreaChatMsg.value = "";
        this.gameScene.ui.textAreaChatMsg.blur();
    }

    private sendEmojiWithCheck(args: (string | number)[]) {
        if (this.isChatBanned(this.tractorPlayer.MyOwnId)) {
            alert(`禁言生效中，请在解禁后重试，解禁日期：${this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].noChatUntil}`)
            return;
        }

        let emojiType: number = (args[0] as number);
        if (emojiType < 0) {
            let chatQuota = 0
            let shengbi = 0
            if (this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId]) {
                chatQuota = parseInt(this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].ChatQuota);
                shengbi = parseInt(this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId].Shengbi);
            }
            if (chatQuota + shengbi < CommonMethods.chatMessageCost) {
                alert("聊天卡/升币余额不足，无法发送消息")
                return;
            }
        }

        if (!this.isSendEmojiEnabled) {
            this.appendChatMsg(CommonMethods.emojiWarningMsg);
            return;
        }
        this.isSendEmojiEnabled = false;
        setTimeout(() => {
            this.isSendEmojiEnabled = true;
        }, 1000 * CommonMethods.emojiWarningIntervalInSec);
        this.gameScene.sendMessageToServer(CommonMethods.SendEmoji_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(args))
    }

    private IsSkinOwned(skinName: string): boolean {
        let daojuInfoByPlayer = this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId];
        if (daojuInfoByPlayer) {
            let ownedSkinInfoList = daojuInfoByPlayer.ownedSkinInfo;
            return ownedSkinInfoList && ownedSkinInfoList.includes(skinName);
        }
        return false;
    }

    private IsSkinAfordableWithConfMsg(skinName: string): any[] {
        let fullSkinInfo = this.DaojuInfo.fullSkinInfo;
        let daojuInfoByPlayer = this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId];
        if (fullSkinInfo && daojuInfoByPlayer.Shengbi >= fullSkinInfo[skinName].skinCost) {
            let msg = "";
            if (fullSkinInfo[skinName].skinCost > 0) {
                msg = `此次购买将消耗升币【${fullSkinInfo[skinName].skinCost}】，购买前余额：【${daojuInfoByPlayer.Shengbi}】，购买后余额：【${daojuInfoByPlayer.Shengbi - fullSkinInfo[skinName].skinCost}】，是否确定？`;
            }
            return [true, msg];
        }
        return [false, ""];
    }

    private GetSkinType(skinName: string): number {
        let fullSkinInfo = this.DaojuInfo.fullSkinInfo;
        if (fullSkinInfo) {
            let targetSkinInfo = fullSkinInfo[skinName];
            if (targetSkinInfo) {
                return targetSkinInfo.skinType;
            }
        }
        return 0;
    }

    public GetPlayerSex(playerID: string): string {
        let daojuInfoByPlayer = this.DaojuInfo.daojuInfoByPlayer[playerID];
        if (daojuInfoByPlayer) {
            let skinInUse = daojuInfoByPlayer.skinInUse
            let fullSkinInfo = this.DaojuInfo.fullSkinInfo;
            if (fullSkinInfo) {
                let targetSkinInfo = fullSkinInfo[skinInUse];
                if (targetSkinInfo) {
                    return targetSkinInfo.skinSex;
                }
            }
        }
        return "m";
    }

    private UpdateSkinInfoUI(preview: boolean) {
        let selectFullSkinInfo: any = document.getElementById("selectFullSkinInfo")
        let lblSkinType: any = document.getElementById("lblSkinType");
        let lblSkinCost: any = document.getElementById("lblSkinCost");
        let lblSkinOnwers: any = document.getElementById("lblSkinOnwers");
        let lblSkinIsOwned: any = document.getElementById("lblSkinIsOwned");
        let lblSkinSex: any = document.getElementById("lblSkinSex");
        let btnBuyOrUseSelectedSkin: any = document.getElementById("btnBuyOrUseSelectedSkin");
        let curSkinInfo: any;
        let fullSkinInfo = this.DaojuInfo.fullSkinInfo;
        let daojuInfoByPlayer = this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId];
        if (daojuInfoByPlayer) {
            if (fullSkinInfo) {
                if (selectFullSkinInfo.options.length === 0) {
                    for (const [key, value] of Object.entries(fullSkinInfo)) {
                        var option = document.createElement("option");
                        option.value = key;
                        option.text = (value as any).skinDesc;
                        selectFullSkinInfo.add(option);
                    }
                    selectFullSkinInfo.value = this.gameScene.skinInUse;
                }

                curSkinInfo = fullSkinInfo[selectFullSkinInfo.value];
                if (curSkinInfo) {
                    lblSkinSex.innerHTML = curSkinInfo.skinSex === "f" ? "女性" : "男性";
                    lblSkinType.innerHTML = curSkinInfo.skinType === 0 ? "静态" : "动态";
                    lblSkinCost.innerHTML = `【升币】x${curSkinInfo.skinCost}`;
                    let skinOwnersMsg = `此皮肤尚未被人解锁`;
                    if (curSkinInfo.skinOwners > 0) {
                        skinOwnersMsg = `已有【${curSkinInfo.skinOwners}】人拥有此皮肤`;
                    }
                    lblSkinOnwers.innerHTML = skinOwnersMsg;
                    lblSkinIsOwned.innerHTML = "尚未拥有";
                    btnBuyOrUseSelectedSkin.disabled = false;
                    btnBuyOrUseSelectedSkin.value = "购买选定的皮肤";
                }
            }
            let ownedSkinInfoList = daojuInfoByPlayer.ownedSkinInfo;
            if (ownedSkinInfoList && ownedSkinInfoList.includes(selectFullSkinInfo.value)) {
                lblSkinIsOwned.innerHTML = "已经拥有";
                btnBuyOrUseSelectedSkin.disabled = false;
                btnBuyOrUseSelectedSkin.value = "启用选定的皮肤";
                if (this.gameScene.skinInUse === selectFullSkinInfo.value) {
                    btnBuyOrUseSelectedSkin.disabled = true;
                    btnBuyOrUseSelectedSkin.value = "正在使用选定的皮肤";
                }
            }
        }

        if (preview && (!this.gameScene.isInGameRoom() || !this.tractorPlayer.isObserver)) {
            // 皮肤预览
            if (curSkinInfo) {
                let skinExtention = curSkinInfo.skinType === 0 ? "webp" : "gif";
                let skinURL = `image/tractor/skin/${curSkinInfo.skinName}.${skinExtention}`;
                this.SetAvatarImage(true, this.gameScene, 0, curSkinInfo.skinType, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight);

                if (this.skinPreviewTimer) clearTimeout(this.skinPreviewTimer);
                this.skinPreviewTimer = setTimeout(() => {
                    let skinTypeMe = this.GetSkinType(this.gameScene.skinInUse);
                    let skinExtentionMe = skinTypeMe === 0 ? "webp" : "gif";
                    let skinURL = `image/tractor/skin/${this.gameScene.skinInUse}.${skinExtentionMe}`;
                    this.SetAvatarImage(false, this.gameScene, 0, skinTypeMe, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight);
                    delete this.skinPreviewTimer;
                }, 3000);
            }
        }
    }

    private ReinitReplayEntities(that: any) {
        if (that.gameScene.isReplayMode) {
            that.InitReplayEntities();
        }
    }

    private btnPig_Click() {
        if (!this.gameScene.ui.btnPig || this.gameScene.ui.btnPig.classList.contains('hidden') || this.gameScene.ui.btnPig.classList.contains('disabled')) return;
        this.ToDiscard8Cards();
        this.ToShowCards();
    }
    private ToDiscard8Cards() {
        //判断是否处在扣牌阶段
        if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards &&
            this.tractorPlayer.CurrentHandState.Last8Holder == this.tractorPlayer.PlayerId) //如果等我扣牌
        {
            if (this.SelectedCards.length == 8) {
                //扣牌,所以擦去小猪
                this.gameScene.ui.btnPig.hide();
                this.gameScene.ui.btnPig.classList.add('disabled')
                this.gameScene.ui.btnPig.classList.remove('pointerdiv');

                this.SelectedCards.forEach(card => {
                    this.tractorPlayer.CurrentPoker.RemoveCard(card);
                })
                this.drawingFormHelper.removeCardImage(this.SelectedCards);
                this.gameScene.sendMessageToServer(StoreDiscardedCards_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.SelectedCards))
                this.drawingFormHelper.ResortMyHandCards();
            }
        }
    }
    private ToShowCards() {
        if ((this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing || this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8CardsFinished) &&
            this.tractorPlayer.CurrentTrickState.NextPlayer() == this.tractorPlayer.PlayerId) {
            var selectedCardsValidationResult = TractorRules.IsValid(this.tractorPlayer.CurrentTrickState, this.SelectedCards, this.tractorPlayer.CurrentPoker);
            //如果我准备出的牌合法
            if (selectedCardsValidationResult.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid) {
                //擦去小猪
                this.gameScene.ui.btnPig.hide();
                this.gameScene.ui.btnPig.classList.add('disabled')
                this.gameScene.ui.btnPig.classList.remove('pointerdiv');

                this.SelectedCards.forEach(card => {
                    this.tractorPlayer.CurrentPoker.RemoveCard(card);
                })
                this.drawingFormHelper.removeCardImage(this.SelectedCards);

                this.ShowCards();
                this.drawingFormHelper.ResortMyHandCards();
                this.SelectedCards = []
            }
            else if (selectedCardsValidationResult.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.TryToDump) {
                //擦去小猪
                this.gameScene.ui.btnPig.hide();
                this.gameScene.ui.btnPig.classList.add('disabled')
                this.gameScene.ui.btnPig.classList.remove('pointerdiv');
                this.gameScene.sendMessageToServer(ValidateDumpingCards_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.SelectedCards))
            }
        }
    }

    public ShowCards() {
        if (this.tractorPlayer.CurrentTrickState.NextPlayer() == this.tractorPlayer.PlayerId) {
            this.tractorPlayer.CurrentTrickState.ShowedCards[this.tractorPlayer.PlayerId] = CommonMethods.deepCopy<number[]>(this.SelectedCards);
            this.gameScene.sendMessageToServer(PlayerShowCards_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(this.tractorPlayer.CurrentTrickState));
        }
    }

    // handle failure
    public NotifyDumpingValidationResultEventHandler(result: ShowingCardsValidationResult) {

        //擦掉上一把
        if (this.tractorPlayer.CurrentTrickState.AllPlayedShowedCards() || this.tractorPlayer.CurrentTrickState.IsStarted() == false) {
            this.drawingFormHelper.destroyAllShowedCards();
            this.drawingFormHelper.DrawScoreImageAndCards();
        }

        let latestPlayer = result.PlayerId;
        let position = this.PlayerPosition[latestPlayer];
        this.drawingFormHelper.DrawShowedCardsByPosition(result.CardsToShow, position)
    }

    // handle both
    public NotifyTryToDumpResultEventHandler(result: ShowingCardsValidationResult) {
        if (result.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.DumpingSuccess) { //甩牌成功.
            this.SelectedCards.forEach(card => {
                this.tractorPlayer.CurrentPoker.RemoveCard(card);
            })
            this.drawingFormHelper.removeCardImage(this.SelectedCards);

            this.ShowCards();
            this.drawingFormHelper.ResortMyHandCards();
            this.SelectedCards = []
        }
        //甩牌失败
        else {
            let msgs: string[] = [
                `甩牌${this.SelectedCards.length}张失败`,
                `"罚分：${this.SelectedCards.length * 10}`,
            ]
            this.tractorPlayer.NotifyMessage(msgs)

            //暂时关闭托管功能，以免甩牌失败后立即点托管，会出别的牌
            this.gameScene.ui.btnRobot.hide();

            setTimeout(() => {
                result.MustShowCardsForDumpingFail.forEach(card => {
                    this.tractorPlayer.CurrentPoker.RemoveCard(card);
                })
                this.drawingFormHelper.removeCardImage(result.MustShowCardsForDumpingFail);
                this.SelectedCards = CommonMethods.deepCopy<number[]>(result.MustShowCardsForDumpingFail)
                this.ShowCards();
                this.drawingFormHelper.ResortMyHandCards();
                this.SelectedCards = []
                this.gameScene.ui.btnRobot.show();
            }, 3000);
        }
    }

    public NotifyStartTimerEventHandler(timerLength: number, playerID: string) {
        if (timerLength <= 0) {
            if (playerID) {
                this.UnwaitForPlayer(playerID);
            } else {
                this.ClearTimer();
            }
            return;
        }
        if (playerID) {
            this.WaitForPlayer(timerLength, playerID);
        } else {
            this.ClearTimer();
            this.gameScene.ui.timer.show();
            this.gameScene.game.countDown(timerLength, () => {
                this.gameScene.ui.timer.hide();
            }, true);
        }
    }

    public ClearTimer() {
        if (this.gameScene._status && this.gameScene._status.countDown) {
            clearInterval(this.gameScene._status.countDown);
            delete this.gameScene._status.countDown;
            this.gameScene.ui.timer.hide();
            this.gameScene.game.timerCurrent = 0;
        }
    }

    //绘制当前轮各家所出的牌（仅用于切换视角，断线重连，恢复牌局，当前回合大牌变更时）
    private PlayerCurrentTrickShowedCards() {
        //擦掉出牌区
        this.drawingFormHelper.destroyAllShowedCards();
        this.drawingFormHelper.DrawScoreImageAndCards();
        this.tractorPlayer.destroyAllClientMessages()
        let cardsCount = 0
        if (this.tractorPlayer.playerLocalCache.ShowedCardsInCurrentTrick != null) {
            for (const [key, value] of Object.entries(this.tractorPlayer.playerLocalCache.ShowedCardsInCurrentTrick)) {
                let cards: number[] = value as number[]
                if (!cards || cards.length == 0) continue;
                let player: string = key;
                cardsCount = cards.length
                let position = this.PlayerPosition[player];
                this.drawingFormHelper.DrawShowedCardsByPosition(cards, position)
            }
        }
        //重画亮过的牌
        if (this.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards) {
            this.drawingFormHelper.TrumpMadeCardsShow();
        }

        //重画大牌标记
        if (this.tractorPlayer.playerLocalCache.WinnderID && cardsCount > 0) {
            this.drawingFormHelper.DrawOverridingFlag(
                cardsCount,
                this.PlayerPosition[this.tractorPlayer.playerLocalCache.WinnderID],
                this.tractorPlayer.playerLocalCache.WinResult - 1,
                false);
        }
    }

    private resetGameRoomUI() {
        this.blurChat();
        if (this.gameScene.ui.inputFormWrapper) {
            if (document.getElementById("btnBapi1")) {
                let cutPoint = 0;
                let cutInfo = `取消,${cutPoint}`;
                this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
                return;
            }
            this.gameScene.ui.inputFormWrapper.remove();
            delete this.gameScene.ui.inputFormWrapper;
        }
    }

    private ShowLastTrickAndTumpMade() {
        //擦掉上一把
        this.drawingFormHelper.destroyAllShowedCards()
        this.tractorPlayer.destroyAllClientMessages()

        //查看谁亮过什么牌
        //need to draw this first so that we have max count for trump made cards
        this.drawingFormHelper.TrumpMadeCardsShowFromLastTrick();

        //绘制上一轮各家所出的牌，缩小至一半，放在左下角，或者重画当前轮各家所出的牌
        this.PlayerLastTrickShowedCards();

        this.tractorPlayer.NotifyMessage(["回看上轮出牌及亮牌信息"]);
    }

    //绘制上一轮各家所出的牌，缩小一半
    private PlayerLastTrickShowedCards() {
        let lastLeader = this.tractorPlayer.CurrentTrickState.serverLocalCache.lastLeader;
        if (!lastLeader || !this.tractorPlayer.CurrentTrickState.serverLocalCache.lastShowedCards ||
            Object.keys(this.tractorPlayer.CurrentTrickState.serverLocalCache.lastShowedCards).length == 0) return;

        let trickState: CurrentTrickState = new CurrentTrickState();
        trickState.Learder = lastLeader;
        trickState.Trump = this.tractorPlayer.CurrentTrickState.Trump;
        trickState.Rank = this.tractorPlayer.CurrentTrickState.Rank;
        let cardsCount = 0
        for (const [key, value] of Object.entries(this.tractorPlayer.CurrentTrickState.serverLocalCache.lastShowedCards)) {
            trickState.ShowedCards[key] = CommonMethods.deepCopy<number[]>(value as number[])
        }

        for (const [key, value] of Object.entries(trickState.ShowedCards)) {
            let cards: number[] = value as number[]
            if (!cards || cards.length == 0) continue;
            let position = this.PlayerPosition[key];
            cardsCount = cards.length
            this.drawingFormHelper.DrawShowedCardsByPosition(cards, position)
        }
        let winnerID = TractorRules.GetWinner(trickState);
        let tempIsWinByTrump = this.IsWinningWithTrump(trickState, winnerID);
        this.drawingFormHelper.DrawOverridingFlag(cardsCount, this.PlayerPosition[winnerID], tempIsWinByTrump - 1, false);
    }

    public NotifyGameHallEventHandler(roomStateList: RoomState[], playerList: string[], yuezhanList: YuezhanEntity[]) {
        this.updateOnlineAndRoomPlayerList(roomStateList, playerList);
        if (playerList.includes(this.tractorPlayer.MyOwnId)) {
            this.tractorPlayer.destroyAllClientMessages();
            this.destroyGameRoom();
            this.destroyGameHall();
            this.drawGameHall(roomStateList, playerList, yuezhanList);
        }
    }

    public destroyGameHall() {
        if (this.gameScene.ui.frameGameHallTables) {
            this.gameScene.ui.frameGameHallTables.remove();
            delete this.gameScene.ui.frameGameHallTables;
        }
        if (this.gameScene.ui.frameGameHall) {
            this.gameScene.ui.frameGameHall.remove();
            delete this.gameScene.ui.frameGameHall;
        }

        if (this.gameScene.ui.yuezhanInterval) {
            var yziKeys = Object.getOwnPropertyNames(this.gameScene.ui.yuezhanInterval);
            for (let i = 0; i < yziKeys.length; i++) {
                clearInterval(this.gameScene.ui.yuezhanInterval[yziKeys[i]]);
            }
            delete this.gameScene.ui.yuezhanInterval;
        }
    }

    public drawFrameMain() {
        let frameMain = this.gameScene.ui.create.div('.frameMain', this.gameScene.ui.window);
        frameMain.style.position = 'absolute';
        frameMain.style.top = 'calc(50px)';
        frameMain.style.left = '0px';
        frameMain.style.bottom = '0px';
        frameMain.style.right = '0px';
        this.gameScene.ui.frameMain = frameMain;

        this.gameScene.ui.arena.setAttribute('data-number', 4);

        this.gameScene.ui.frameMain.appendChild(this.gameScene.ui.arena);
    }

    public drawFrameChat() {
        this.gameScene.ui.frameMain.style.right = '250px';

        let frameChat = this.gameScene.ui.create.div('.framechat', this.gameScene.ui.window);
        frameChat.style.width = '250px';
        frameChat.style.position = 'absolute';
        frameChat.style.top = 'calc(50px)';
        frameChat.style.bottom = 'calc(2%)';
        frameChat.style.right = '0px';
        frameChat.style['z-index'] = CommonMethods.zIndexFrameChat;
        this.gameScene.ui.frameChat = frameChat;

        if (this.gameScene.isReplayMode) return;

        let divOnlinePlayerList = this.gameScene.ui.create.div('.chatcomp.chatcompwithpadding.chattextdiv', frameChat);
        divOnlinePlayerList.style.top = 'calc(0%)';
        divOnlinePlayerList.style.height = 'calc(20% - 20px)';
        this.gameScene.ui.divOnlinePlayerList = divOnlinePlayerList;

        let divChatHistory = this.gameScene.ui.create.div('.chatcomp.chatcompwithpadding.chattextdiv', frameChat);
        divChatHistory.style.top = 'calc(20%)';
        divChatHistory.style.bottom = 'calc(100px + 3em)';
        this.gameScene.ui.divChatHistory = divChatHistory;

        var selectChatPresetMsgs = document.createElement("select");
        selectChatPresetMsgs.style.bottom = 'calc(50px + 3em + 20px)';
        selectChatPresetMsgs.style.height = 'calc(30px)';
        selectChatPresetMsgs.style.width = 'calc(100% - 55px)';
        selectChatPresetMsgs.classList.add('chatcomp', 'chatcompwithoutpadding', 'chatinput');
        frameChat.appendChild(selectChatPresetMsgs);
        this.gameScene.ui.selectPresetMsgs = selectChatPresetMsgs;
        for (var i = 0; i < CommonMethods.emojiMsgs.length; i++) {
            var option = document.createElement("option");
            option.value = CommonMethods.emojiMsgs[i];
            let shortCutKeyChar = String.fromCharCode(CommonMethods.emojiIndexToKeyCodes[i]);
            option.text = `${shortCutKeyChar}-${CommonMethods.emojiMsgs[i]}`;
            selectChatPresetMsgs.appendChild(option);
        }
        selectChatPresetMsgs.addEventListener('change', () => {
            this.selectPresetMsgsIsOpen = true;
            this.handleSelectPresetMsgsClick(selectChatPresetMsgs);
        });

        let btnSendChat = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv', '发送', () => this.sendPresetMsgs(selectChatPresetMsgs));
        btnSendChat.style.bottom = 'calc(50px + 3em + 20px - 8px)';
        btnSendChat.style.height = 'calc(18px)';
        btnSendChat.style.width = 'calc(40px)';
        btnSendChat.style.right = 'calc(0px)';
        btnSendChat.style.paddingTop = '6px';
        btnSendChat.style.paddingBottom = '6px';
        btnSendChat.classList.add('chatcomp', 'chatcompwithoutpadding', 'chatinput');

        frameChat.appendChild(btnSendChat);
        this.gameScene.ui.btnSendChat = btnSendChat;

        var textAreaChatMsg = document.createElement("textarea");
        textAreaChatMsg.maxLength = CommonMethods.chatMaxLength;
        textAreaChatMsg.placeholder = `每条消息消耗【聊天卡】（优先触发）或者【升币】x${CommonMethods.chatMessageCost}，消息长度不超过${CommonMethods.chatMaxLength}，按“回车键”发送，消息为空时按“回车键”发送当前选中的快捷消息，快捷消息的快捷键为对应的数字/字母键`;
        textAreaChatMsg.style.resize = 'none';
        textAreaChatMsg.style.height = '3em';
        textAreaChatMsg.style.bottom = 'calc(50px)';
        textAreaChatMsg.classList.add('chatcomp', 'chatcompwithpadding', 'chatinput');
        frameChat.appendChild(textAreaChatMsg);
        this.gameScene.ui.textAreaChatMsg = textAreaChatMsg;
        textAreaChatMsg.addEventListener('focus', () => {
            if (!this.gameScene.chatMessageCostNoted) {
                alert(`每次发言消耗【升币】x${CommonMethods.chatMessageCost}，余额不足时无法发言，快捷语除外`);
                this.gameScene.chatMessageCostNoted = true;
                this.gameScene.game.saveConfig("chatMessageCostNoted", true);
            }
        });
    }

    public drawGameRoom() {
        let frameGameRoom = this.gameScene.ui.create.div('.frameGameRoom', this.gameScene.ui.arena);
        frameGameRoom.style.position = 'absolute';
        frameGameRoom.style.top = '0px';
        frameGameRoom.style.left = '0px';
        frameGameRoom.style.bottom = '0px';
        frameGameRoom.style.right = '0px';
        this.gameScene.ui.frameGameRoom = frameGameRoom;

        if (this.gameScene.isReplayMode) return;

        if (!this.gameScene.ui.gameMe) {
            this.drawGameMe();
        }

        if (!this.gameScene.ui.handZone) {
            this.drawHandZone();
        }

        if (!this.gameScene.ui.gameRoomImagesChairOrPlayer) {
            this.gameScene.ui.gameRoomImagesChairOrPlayer = [];
        }

        // draw lblstarters
        this.gameScene.ui.pokerPlayerStartersLabel = [];
        for (let i = 0; i < 4; i++) {
            var lblStarter = this.gameScene.ui.create.div('.lblStarter', '', this.gameScene.ui.frameGameRoom);
            lblStarter.style.fontFamily = 'serif';
            lblStarter.style.fontSize = '20px';
            lblStarter.style.color = 'orange';
            lblStarter.style['font-weight'] = 'bold';
            lblStarter.style.textAlign = 'left';
            this.gameScene.ui.pokerPlayerStartersLabel.push(lblStarter);

            var obX = this.gameScene.coordinates.playerStarterPositions[i].x;
            var obY = this.gameScene.coordinates.playerStarterPositions[i].y;
            switch (i) {
                case 0:
                    lblStarter.style.left = `calc(${obX})`;
                    lblStarter.style.bottom = `calc(${obY})`;
                    break;
                case 1:
                    lblStarter.style.right = `calc(${obX})`;
                    lblStarter.style.bottom = `calc(${obY})`;
                    lblStarter.style.textAlign = 'right';
                    break;
                case 2:
                    lblStarter.style.right = `calc(${obX})`;
                    lblStarter.style.top = `calc(${obY})`;
                    break;
                case 3:
                    lblStarter.style.left = `calc(${obX})`;
                    lblStarter.style.bottom = `calc(${obY})`;
                    break;
                default:
                    break;
            }
        }

        // room name
        let roomNameString = `房间：${this.tractorPlayer.CurrentRoomSetting.RoomName}`;
        var roomNameText = this.gameScene.ui.create.div('.roomNameText', roomNameString, this.gameScene.ui.frameGameRoom);
        roomNameText.style.fontFamily = 'serif';
        roomNameText.style.fontSize = '20px';
        roomNameText.style.color = 'orange';
        roomNameText.style.textAlign = 'left';
        roomNameText.style.left = `calc(0px)`;
        roomNameText.style.top = `calc(0px)`;
        this.gameScene.ui.roomNameText = roomNameText;

        // room owner
        let roomOwnerString = `房主：${this.gameScene.hidePlayerID ? "" : this.tractorPlayer.CurrentRoomSetting.RoomOwner}`;
        var roomOwnerText = this.gameScene.ui.create.div('.roomOwnerText', roomOwnerString, this.gameScene.ui.frameGameRoom);
        roomOwnerText.style.fontFamily = 'serif';
        roomOwnerText.style.fontSize = '20px';
        roomOwnerText.style.color = 'orange';
        roomOwnerText.style.textAlign = 'left';
        roomOwnerText.style.left = `calc(0px)`;
        roomOwnerText.style.top = `calc(30px)`;
        this.gameScene.ui.roomOwnerText = roomOwnerText;

        // btnPig
        var btnPig = this.gameScene.ui.create.div('.menubutton.highlight.large', '确定', () => this.btnPig_Click());
        btnPig.style.width = 'calc(60px)';
        btnPig.style.height = 'calc(30px)';
        btnPig.style.position = 'absolute';
        btnPig.style.right = `calc(${this.gameScene.coordinates.cardWidth}px)`;
        btnPig.style.bottom = `calc(${this.gameScene.coordinates.showedCardsPositions[0].y})`;
        btnPig.style.fontFamily = 'serif';
        btnPig.style.fontSize = '20px';
        btnPig.classList.add('disabled');
        btnPig.classList.remove('pointerdiv');
        btnPig.hide();
        this.gameScene.ui.frameGameRoom.appendChild(btnPig);

        this.gameScene.ui.btnPig = btnPig;

        let btnWid = "18%";
        // btnReady
        if (!this.gameScene.ui.btnReady) {
            let btnReady = this.gameScene.ui.create.div('.menubutton.highlight.large', '开始', () => this.btnReady_Click());
            this.gameScene.ui.btnReady = btnReady
            this.gameScene.ui.frameChat.appendChild(btnReady);
            btnReady.style.position = 'absolute';

            btnReady.style.width = `calc(${btnWid})`;
            btnReady.style.left = `calc(26%)`;
            btnReady.style.transition = `0s`;

            btnReady.style.bottom = `0px`;
            btnReady.style.fontFamily = 'serif';
            btnReady.style.fontSize = '20px';
        }
        // btnQiangliang
        if (!this.gameScene.ui.btnQiangliang) {
            let btnQiangliang = this.gameScene.ui.create.div('.menubutton.highlight.large.pointerdiv', '抢亮', () => this.btnQiangliang_Click());
            this.gameScene.ui.btnQiangliang = btnQiangliang
            this.gameScene.ui.frameChat.appendChild(btnQiangliang);
            btnQiangliang.style.position = 'absolute';

            btnQiangliang.style.width = `calc(${btnWid})`;
            btnQiangliang.style.right = `calc(26%)`;
            btnQiangliang.style.transition = `0s`;

            btnQiangliang.style.bottom = `0px`;
            btnQiangliang.style.fontFamily = 'serif';
            btnQiangliang.style.fontSize = '20px';
        }
        // btnRobot
        if (!this.gameScene.ui.btnRobot) {
            let btnRobot = this.gameScene.ui.create.div('.menubutton.highlight.large.pointerdiv', '托管', () => this.btnRobot_Click());
            this.gameScene.ui.btnRobot = btnRobot;
            this.gameScene.ui.frameChat.appendChild(btnRobot);
            btnRobot.style.position = 'absolute';

            btnRobot.style.width = `calc(${btnWid})`;
            btnRobot.style.left = '0px';
            btnRobot.style.transition = `0s`;

            btnRobot.style.bottom = `0px`;
            btnRobot.style.fontFamily = 'serif';
            btnRobot.style.fontSize = '20px';
        }
        // btnShowLastTrick
        if (!this.gameScene.ui.btnShowLastTrick) {
            let btnShowLastTrick = this.gameScene.ui.create.div('.menubutton.highlight.large.pointerdiv', '上轮', () => this.HandleRightClickEmptyArea());
            this.gameScene.ui.btnShowLastTrick = btnShowLastTrick;
            this.gameScene.ui.frameChat.appendChild(btnShowLastTrick);
            btnShowLastTrick.style.position = 'absolute';

            btnShowLastTrick.style.width = `calc(${btnWid})`;
            btnShowLastTrick.style.right = '0px';
            btnShowLastTrick.style.transition = `0s`;

            btnShowLastTrick.style.bottom = `0px`;
            btnShowLastTrick.style.fontFamily = 'serif';
            btnShowLastTrick.style.fontSize = '20px';
        }
        this.gameScene.ui.btnRobot.hide();
        this.gameScene.ui.btnReady.hide();
        this.gameScene.ui.btnQiangliang.hide();
        this.gameScene.ui.btnShowLastTrick.hide();
        // btnExitAndObserve
        if (!this.gameScene.ui.btnExitAndObserve) {
            this.gameScene.ui.btnExitAndObserve = this.gameScene.ui.create.system('上树', () => this.ExitAndObserve(), true, true);
            this.gameScene.ui.btnExitAndObserve.hide();
        }
    }

    public drawGameHall(roomStateList: RoomState[], playerList: string[], yuezhanList: YuezhanEntity[]) {
        if (!this.gameScene.ui.gameMe) {
            this.drawGameMe();
        }

        this.UpdateQiandaoStatus();

        let frameGameHall = this.gameScene.ui.create.div('.frameGameHall', this.gameScene.ui.frameMain);
        frameGameHall.style.position = 'absolute';
        frameGameHall.style.top = '0px';
        frameGameHall.style.left = '0px';
        frameGameHall.style.bottom = '0px';
        frameGameHall.style.right = '0px';
        this.gameScene.ui.frameGameHall = frameGameHall;

        let frameGameHallOnlinersHeader = this.gameScene.ui.create.div('.frameGameHallOnliners', this.gameScene.ui.frameGameHall);
        frameGameHallOnlinersHeader.style.position = 'absolute';
        frameGameHallOnlinersHeader.style.paddingTop = '20px';
        frameGameHallOnlinersHeader.style.top = '0px';
        frameGameHallOnlinersHeader.style.left = '0px';
        frameGameHallOnlinersHeader.style.width = '15%';
        frameGameHallOnlinersHeader.style.paddingLeft = '10px';
        frameGameHallOnlinersHeader.style.overflow = 'visible';
        frameGameHallOnlinersHeader.style.zIndex = CommonMethods.zIndexFrameGameHallOnliners;
        this.gameScene.ui.frameGameHallOnlinersHeader = frameGameHallOnlinersHeader;

        let frameGameHallOnliners = this.gameScene.ui.create.div('.frameGameHallOnliners', this.gameScene.ui.frameGameHall);
        frameGameHallOnliners.style.position = 'absolute';
        frameGameHallOnliners.style.top = '220px';
        frameGameHallOnliners.style.left = '0px';
        frameGameHallOnliners.style.bottom = '0px';
        frameGameHallOnliners.style.width = '15%';
        frameGameHallOnliners.style.paddingLeft = '10px';
        frameGameHallOnliners.style.overflow = 'auto';
        this.gameScene.ui.frameGameHallOnliners = frameGameHallOnliners;

        let pYuezhanHeader = document.createElement("p");
        pYuezhanHeader.innerText = `约战(${yuezhanList.length})`;
        pYuezhanHeader.style.marginTop = '0px';
        pYuezhanHeader.style.fontFamily = 'xinwei';
        pYuezhanHeader.style.fontSize = '30px';
        pYuezhanHeader.style.textAlign = 'left';
        pYuezhanHeader.style.whiteSpace = 'nowrap';
        this.gameScene.ui.frameGameHallOnlinersHeader.appendChild(pYuezhanHeader);

        let playerListAll: string[] = CommonMethods.deepCopy<string[]>(playerList);

        let frameGameHallTables = this.gameScene.ui.create.div('.frameGameHallTables', this.gameScene.ui.frameGameHall);
        frameGameHallTables.style.position = 'absolute';
        frameGameHallTables.style.top = '0px';
        frameGameHallTables.style.left = '15%';
        frameGameHallTables.style.bottom = '0px';
        frameGameHallTables.style.right = '0px';
        this.gameScene.ui.frameGameHallTables = frameGameHallTables;

        for (let i = 0; i < roomStateList.length; i++) {
            let leftOffset = 28 + 44 * (i % 2);
            let topOffset = 30 + 40 * Math.floor(i / 2);

            var pokerTable = this.gameScene.ui.create.div('.pokerTable', this.gameScene.ui.frameGameHallTables);
            pokerTable.setBackgroundImage('image/tractor/btn/poker_table.png')
            pokerTable.setAttribute('data-position', i);
            pokerTable.style.left = `calc(${leftOffset}% - 80px)`;
            pokerTable.style.top = `calc(${topOffset}% - 80px)`;
            pokerTable.style.width = '160px';
            pokerTable.style.height = '160px';
            pokerTable.style['background-size'] = '100% 100%';
            pokerTable.style['background-repeat'] = 'no-repeat';

            let noSignalStr = roomStateList[i].roomSetting.DisplaySignalCardInfo ? "" : "<br/>（不打信号牌）";
            let pokerTableName = this.gameScene.ui.create.div('', `${i + 1}号房间${noSignalStr}`, this.gameScene.ui.frameGameHallTables);
            pokerTableName.style.fontFamily = 'serif';
            pokerTableName.style.fontSize = '18px';
            pokerTableName.style.width = '160px';
            pokerTableName.style.height = '160px';
            pokerTableName.style.left = `calc(${leftOffset}% - 80px)`;
            pokerTableName.style.top = `calc(${topOffset}% - 80px)`;
            pokerTableName.style.textAlign = 'center';
            if (roomStateList[i].roomSetting.DisplaySignalCardInfo) pokerTableName.style['line-height'] = '55px';
            pokerTableName.style.cursor = 'pointer';

            // click
            pokerTableName.addEventListener("click", (e: any) => {
                this.destroyGameHall();
                this.gameScene.sendMessageToServer(PLAYER_ENTER_ROOM_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify({
                    roomID: i,
                    posID: -1,
                }))
            });
            // mouseover
            pokerTableName.addEventListener("mouseover", (e: any) => {
                e.target.style.top = `calc(${topOffset}% - 85px)`;
                e.target.previousSibling.style.top = `calc(${topOffset}% - 85px)`;
            });
            // mouseout
            pokerTableName.addEventListener("mouseout", (e: any) => {
                e.target.style.top = `calc(${topOffset}% - 80px)`;
                e.target.previousSibling.style.top = `calc(${topOffset}% - 80px)`;
            });

            for (let j = 0; j < 4; j++) {
                let leftOffsetChair = `calc(${leftOffset}% - 40px)`;
                let topOffsetChair = `calc(${topOffset}% - 40px)`;
                let topOffsetChairLifted = `calc(${topOffset}% - 45px)`;
                switch (j) {
                    case 0:
                        topOffsetChair = `calc(${topOffset}% - 160px)`;
                        topOffsetChairLifted = `calc(${topOffset}% - 165px)`;
                        break;
                    case 1:
                        leftOffsetChair = `calc(${leftOffset}% - 170px)`;
                        break;
                    case 2:
                        topOffsetChair = `calc(${topOffset}% + 40px)`;
                        topOffsetChairLifted = `calc(${topOffset}% + 35px)`;
                        break;
                    case 3:
                        leftOffsetChair = `calc(${leftOffset}% + 90px)`;
                        break;
                    default:
                        break;
                }
                if (roomStateList[i].CurrentGameState.Players[j] != null) {
                    var obCount = roomStateList[i].CurrentGameState.Players[j].Observers.length;
                    var obTopOffset = 20;
                    let leftOffsetPlayer = `calc(${leftOffset}% - 80px)`;
                    let topOffsetPlayer = topOffsetChair;
                    switch (j) {
                        case 0:
                            topOffsetPlayer = `calc(${topOffset}% - 120px)`;
                            if (obCount > 0) {
                                topOffsetPlayer = `calc(${topOffset}% - 120px - ${obCount * obTopOffset}px)`;
                            }
                            break;
                        case 1:
                            leftOffsetPlayer = `calc(${leftOffset}% - 250px)`;
                            break;
                        case 3:
                            leftOffsetPlayer = `calc(${leftOffset}% + 90px)`;
                            break;
                        default:
                            break;
                    }

                    let pid: string = roomStateList[i].CurrentGameState.Players[j].PlayerId;
                    playerListAll.push(pid)
                    var pokerPlayer = this.gameScene.ui.create.div('.pokerPlayer', pid, this.gameScene.ui.frameGameHallTables);
                    pokerPlayer.style.fontFamily = 'serif';
                    pokerPlayer.style.fontSize = '20px';
                    pokerPlayer.style.left = leftOffsetPlayer;
                    pokerPlayer.style.top = topOffsetPlayer;
                    if (j !== 3) pokerPlayer.style.width = '160px';
                    pokerPlayer.style.textAlign = 'center';
                    if (j === 1) {
                        pokerPlayer.style.textAlign = 'right';
                    }
                    else if (j === 3) {
                        pokerPlayer.style.textAlign = 'left';
                    }

                    if (obCount > 0) {
                        for (let k = 0; k < roomStateList[i].CurrentGameState.Players[j].Observers.length; k++) {
                            var obY = `calc(${topOffset}% - 40px + ${(k + 1) * obTopOffset}px)`;
                            switch (j) {
                                case 0:
                                    obY = `calc(${topOffset}% - 120px - ${(obCount - (k + 1)) * obTopOffset}px)`;
                                    break;
                                case 2:
                                    obY = `calc(${topOffset}% + 40px + ${(k + 1) * obTopOffset}px)`;
                                    break;
                                default:
                                    break;
                            }

                            let oid: string = roomStateList[i].CurrentGameState.Players[j].Observers[k];
                            playerListAll.push(oid);
                            var pokerPlayerOb = this.gameScene.ui.create.div('.pokerPlayerObGameHall', `【${oid}】`, this.gameScene.ui.frameGameHallTables);
                            pokerPlayerOb.style.fontFamily = 'serif';
                            pokerPlayerOb.style.fontSize = '20px';
                            pokerPlayerOb.style.left = leftOffsetPlayer;
                            pokerPlayerOb.style.top = obY;
                            if (j !== 3) pokerPlayerOb.style.width = '160px';
                            pokerPlayerOb.style.textAlign = 'center';
                            if (j === 1) {
                                pokerPlayerOb.style.textAlign = 'right';
                            }
                            else if (j === 3) {
                                pokerPlayerOb.style.textAlign = 'left';
                            }
                        }
                    }
                } else {
                    var pokerChair = this.gameScene.ui.create.div('.pokerChair', this.gameScene.ui.frameGameHallTables);
                    pokerChair.setBackgroundImage('image/tractor/btn/poker_chair.png')
                    pokerChair.setAttribute('data-position', i * 4 + j);
                    pokerChair.style.left = leftOffsetChair;
                    pokerChair.style.top = topOffsetChair;
                    pokerChair.style.width = '80px';
                    pokerChair.style.height = '80px';
                    pokerChair.style['background-size'] = '100% 100%';
                    pokerChair.style['background-repeat'] = 'no-repeat';

                    let pokerChairName = this.gameScene.ui.create.div('.pokerChairName', `${j + 1}`, this.gameScene.ui.frameGameHallTables);
                    pokerChairName.style.fontFamily = 'cursive';
                    pokerChairName.style.fontSize = '20px';
                    pokerChairName.style.color = 'yellow';
                    pokerChairName.style.width = '80px';
                    pokerChairName.style.height = '80px';
                    pokerChairName.style.left = leftOffsetChair;
                    pokerChairName.style.top = topOffsetChair;
                    pokerChairName.style.textAlign = 'center';
                    pokerChairName.style['line-height'] = '70px';
                    pokerChairName.style.cursor = 'pointer';

                    // click
                    pokerChairName.addEventListener("click", (e: any) => {
                        this.destroyGameHall();
                        this.gameScene.sendMessageToServer(PLAYER_ENTER_ROOM_REQUEST, this.gameScene.playerName, JSON.stringify({
                            roomID: i,
                            posID: j,
                        }))
                    });
                    // mouseover
                    pokerChairName.addEventListener("mouseover", (e: any) => {
                        e.target.style.top = topOffsetChairLifted;
                        e.target.previousSibling.style.top = topOffsetChairLifted;
                    });
                    // mouseout
                    pokerChairName.addEventListener("mouseout", (e: any) => {
                        e.target.style.top = topOffsetChair;
                        e.target.previousSibling.style.top = topOffsetChair;
                    });
                }
            }
        }

        let IOwnYuezhan = false;
        for (let i = 0; i < yuezhanList.length; i++) {
            let yuezhanInfo = yuezhanList[i];
            if (yuezhanInfo.owner === this.tractorPlayer.MyOwnId) {
                IOwnYuezhan = true;
            }
        }
        if (!IOwnYuezhan) {
            // pick a date time
            let inputDueDate = document.createElement("input");
            inputDueDate.style.position = 'static';
            inputDueDate.style.display = 'block';
            inputDueDate.setAttribute("type", "datetime-local");
            inputDueDate.setAttribute("id", "inputDueDatePicker");
            this.gameScene.ui.frameGameHallOnlinersHeader.appendChild(inputDueDate);

            let btnCreateYuezhan = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv', "我要约战", () => {
                let inputDueDate: any = document.getElementById("inputDueDatePicker")
                let dateTimeValue = inputDueDate.value;
                if (!dateTimeValue) {
                    alert("约战时间不能为空");
                    return;
                }

                let yzDueDate = new Date(dateTimeValue);
                if (yzDueDate < new Date()) {
                    alert("请选择未来作为约战时间");
                    return;
                }

                let yzDueDateISO = CommonMethods.DateToISO8601(yzDueDate);

                let yze = new YuezhanEntity();
                yze.owner = this.tractorPlayer.MyOwnId;
                yze.dueDate = yzDueDateISO;
                yze.participants.push(this.tractorPlayer.MyOwnId);
                this.joinOrQuitYuezhan(yze);
            });
            btnCreateYuezhan.style.marginTop = '10px';
            btnCreateYuezhan.style.position = 'static';
            btnCreateYuezhan.style.display = 'block';
            btnCreateYuezhan.style.width = '80px';
            this.gameScene.ui.frameGameHallOnlinersHeader.appendChild(btnCreateYuezhan);
        } else {
            this.gameScene.ui.frameGameHallOnliners.style.top = '50px';
        }

        for (let i = 0; i < yuezhanList.length; i++) {
            let yuezhanInfo = yuezhanList[i];

            let now = new Date();
            if (new Date(yuezhanInfo.dueDate) < now) {
                continue;
            }

            let divTitle = document.createElement("div");
            divTitle.style.marginTop = '20px';
            divTitle.style.position = 'static';
            divTitle.style.display = 'block';
            divTitle.style.fontSize = '20px';
            divTitle.innerText = `【${yuezhanInfo.owner}】的约战`;
            this.gameScene.ui.frameGameHallOnliners.appendChild(divTitle);

            let divDueDate = document.createElement("div");
            divDueDate.style.position = 'static';
            divDueDate.style.display = 'block';
            let yzDueDate = new Date(yuezhanInfo.dueDate)
            divDueDate.innerText = `${CommonMethods.DateToISO8601(yzDueDate)}`;
            this.gameScene.ui.frameGameHallOnliners.appendChild(divDueDate);

            let divCountdown = document.createElement("div");
            divCountdown.style.position = 'static';
            divCountdown.style.display = 'block';
            divCountdown.innerText = CommonMethods.zeroDuration;
            this.gameScene.ui.frameGameHallOnliners.appendChild(divCountdown);

            if (!this.gameScene.ui.yuezhanInterval) {
                this.gameScene.ui.yuezhanInterval = {};
            }
            this.gameScene.ui.yuezhanInterval[yuezhanInfo.owner] = setInterval(function (that, yzinfo, divcd) {
                // Get the current date and time
                // Calculate the remaining time
                let nowForYuezhan = new Date();
                var distance = new Date(yzinfo.dueDate).getTime() - nowForYuezhan.getTime();

                // Calculate days, hours, minutes, and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Display the countdown in the div
                divcd.innerText = `${days > 0 ? days + "天，" : ""}${hours > 0 ? CommonMethods.Pad(hours) : "00"}:${minutes > 0 ? CommonMethods.Pad(minutes) : "00"}:${seconds > 0 ? CommonMethods.Pad(seconds) : "00"}`;

                if (distance < 0) {
                    clearInterval(that.gameScene.ui.yuezhanInterval[yzinfo.owner]);
                    delete that.gameScene.ui.yuezhanInterval[yzinfo.owner];
                }
            }, 1000, this, yuezhanInfo, divCountdown);

            let divParticipantsHeader = document.createElement("div");
            divParticipantsHeader.style.position = 'static';
            divParticipantsHeader.style.display = 'block';
            divParticipantsHeader.innerText = "参战玩家：";
            this.gameScene.ui.frameGameHallOnliners.appendChild(divParticipantsHeader);

            let isMeParticipant = false;
            for (let i = 0; i < yuezhanInfo.participants.length; i++) {
                let parID = yuezhanInfo.participants[i];
                if (parID === this.tractorPlayer.MyOwnId) {
                    isMeParticipant = true;
                }
                let d = document.createElement("div");
                d.style.position = 'static';
                d.style.display = 'block';
                d.innerText = `【${parID}】`;
                this.gameScene.ui.frameGameHallOnliners.appendChild(d);
            }

            let yze = new YuezhanEntity();
            yze.owner = yuezhanInfo.owner;
            let btnJoinOrQuitYuezhan = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv', `${isMeParticipant ? "退战" : "参战"}`, () => this.joinOrQuitYuezhan(yze));
            btnJoinOrQuitYuezhan.style.marginTop = '10px';
            btnJoinOrQuitYuezhan.style.position = 'static';
            btnJoinOrQuitYuezhan.style.display = 'block';
            btnJoinOrQuitYuezhan.style.width = '40px';
            this.gameScene.ui.frameGameHallOnliners.appendChild(btnJoinOrQuitYuezhan);
        }
    }

    private joinOrQuitYuezhan(yuezhanEntity: YuezhanEntity) {
        this.gameScene.sendMessageToServer(CommonMethods.SendJoinOrQuitYuezhan_REQUEST, this.tractorPlayer.MyOwnId, JSON.stringify(yuezhanEntity));
    }

    private drawGameMe() {
        this.gameScene.ui.gameMe = this.CreatePlayer(0, this.tractorPlayer.PlayerId, this.gameScene.ui.arena); // creates ui.gameMe
        this.gameScene.ui.gameMe.style.zIndex = CommonMethods.zIndexGameMe;
        if (!this.tractorPlayer.isObserver) {
            let skinTypeMe = this.GetSkinType(this.gameScene.skinInUse);
            let skinExtentionMe = skinTypeMe === 0 ? "webp" : "gif";
            let skinURL = `image/tractor/skin/${this.gameScene.skinInUse}.${skinExtentionMe}`;
            this.SetAvatarImage(false, this.gameScene, 0, skinTypeMe, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight);
        }
    }

    private drawHandZone() {
        this.gameScene.ui.create.me(); // creates ui.me, which is hand zone
        this.gameScene.ui.handZone = this.gameScene.ui.me;
        this.gameScene.ui.handZone.innerHTML = '';
        this.gameScene.ui.handZone.style.position = "absolute";
        this.gameScene.ui.handZone.style.left = `calc(${this.gameScene.ui.gameMe.clientWidth}px)`;
        // this.gameScene.ui.handZone.style.left will be re-adjusted via callback of drawGameMe
        this.gameScene.ui.handZone.style.right = `calc(0px)`;
        this.gameScene.ui.handZone.style.width = "auto";
    }

    private CreatePlayer(pos: number, playerId: string, parentNode: any) {
        let playerDiv = this.gameScene.ui.create.player(parentNode);
        playerDiv.setAttribute('data-position', pos);
        playerDiv.node.avatar.style['background-size'] = '100% 100%';
        playerDiv.node.avatar.style['background-repeat'] = 'no-repeat';
        playerDiv.node.avatar.show();

        playerDiv.node.nameol.innerHTML = this.gameScene.hidePlayerID ? "" : playerId;
        return playerDiv;
    }

    private EnableShortcutKeys() {
        if (this.gameScene.isReplayMode) {
            window.addEventListener("keyup", (e: any) => {
                let keyCode = e.keyCode;
                switch (keyCode) {
                    case 38:
                        this.btnFirstTrick_Click();
                        return;
                    case 37:
                        this.btnPreviousTrick_Click();
                        return;
                    case 39:
                        this.btnNextTrick_Click();
                        return;
                    case 40:
                        this.btnLastTrick_Click();
                        return;
                    case 96:
                        this.btnFirstPersonView_Click();
                        return;
                    default:
                        break;
                }
            });
        }
        window.addEventListener("mouseup", (e: any) => {
            // 右键点空白区
            if (this.gameScene.isInGameRoom()) {
                if (e.button === 2 && e.target.classList.contains('frameGameRoom')) {
                    this.HandleRightClickEmptyArea();
                    return;
                }
            }
            // 左键点空白区
            if (e.button === 0 &&
                (e.target.classList.contains('replayFormWrapper') ||
                    e.target.classList.contains('frameGameRoom') ||
                    e.target.classList.contains('frameGameHallOnliners') ||
                    e.target.classList.contains('frameGameHallTables') ||
                    e.target.classList.contains('inputFormWrapper') ||
                    e.target.classList.contains('chattextdiv') ||
                    e.target.classList.contains('hand-zone') ||
                    e.target.parentElement.classList.contains('chattextdiv'))) {
                this.resetGameRoomUI();
                return;
            }
        });
        window.addEventListener('keyup', (e: any) => {
            let keyCode = e.keyCode;

            if (keyCode === 27) {
                this.resetGameRoomUI();
                return;
            }
            if (this.gameScene.isReplayMode) return;

            if (e.target === this.gameScene.ui.textAreaChatMsg) {
                if (keyCode === 13) {
                    this.emojiSubmitEventhandler();
                }
                return;
            }

            if (this.gameScene.ui.inputFormWrapper) return;

            // 1 - 9: 49 - 57
            let keyCodeString = `${keyCode}`;
            if (CommonMethods.emojiKeyCodeToIndex.hasOwnProperty(keyCodeString)) {
                let prevSelection = this.gameScene.ui.selectPresetMsgs.selectedIndex;
                let emojiType = CommonMethods.emojiKeyCodeToIndex[keyCodeString];
                if (emojiType !== prevSelection) {
                    this.gameScene.ui.selectPresetMsgs.selectedIndex = emojiType;
                }
                let emojiIndex = CommonMethods.GetRandomInt(CommonMethods.winEmojiLength);
                let msgString = CommonMethods.emojiMsgs[emojiType]
                let args: (string | number)[] = [emojiType, emojiIndex, msgString];
                this.sendEmojiWithCheck(args)
            }

            if (this.gameScene.isInGameRoom()) {
                switch (keyCode) {
                    case 90:
                        if (this.tractorPlayer.isObserver) return;
                        this.btnReady_Click();
                        return;
                    case 83:
                        if (this.tractorPlayer.isObserver) return;
                        this.btnPig_Click();
                        return;
                    case 82:
                        if (this.tractorPlayer.isObserver) return;
                        this.btnRobot_Click();
                        return;
                    case 81:
                        if (this.tractorPlayer.isObserver) return;
                        this.btnQiangliang_Click();
                        return;
                    default:
                        break;
                }
            }
        });
    }
    public UpdateQiandaoStatus() {
        if (this.gameScene.ui.btnQiandao) {
            if (this.IsQiandaoRenewed()) {
                this.gameScene.ui.btnQiandao.innerHTML = "签到领福利";
                this.gameScene.ui.btnQiandao.show();
            } else {
                this.gameScene.ui.btnQiandao.innerHTML = "今日已签到";
                this.gameScene.ui.btnQiandao.hide();
            }
        }
    }

    public IsQiandaoRenewed(): boolean {
        let daojuInfoByPlayer: any = this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.MyOwnId];
        return daojuInfoByPlayer && daojuInfoByPlayer.isRenewed;
    }

    private SetAvatarImage(isPreview: boolean, gs: GameScene, pos: number, skinType: number, skinURL: string, playerObj: any, fixedHeight: number, callback?: any, p?: PlayerEntity) {
        var img = new Image();
        img.onload = (e: any) => {
            let wid = e.target.width;
            let hei = e.target.height;
            let skinWid = fixedHeight * wid / hei;
            playerObj.style.width = `calc(${skinWid}px)`;
            if (!isPreview && gs.noDongtu.toLowerCase() === "true" && skinType === 1) {
                // clean up animation elements first
                jQuery(playerObj.node.avatar).css("background-image", "");

                if (playerObj.node.avatarImg) {
                    playerObj.node.avatarImg.remove();
                    delete playerObj.node.avatarImg;
                }

                let canvas: any = document.createElement('canvas');
                canvas.width = skinWid;
                canvas.height = fixedHeight;
                canvas.getContext('2d').drawImage(img, 0, 0, skinWid, fixedHeight);
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style['border-radius'] = '8px';
                playerObj.appendChild(canvas);
                playerObj.node.avatarImg = canvas;
            }
            else {
                // clean up static elements first
                if (playerObj.node.avatarImg) {
                    playerObj.node.avatarImg.remove();
                    delete playerObj.node.avatarImg;
                }

                // build animation
                playerObj.node.avatar.setBackgroundImage(skinURL);
            }

            if (gs && gs.ui.handZone && playerObj === gs.ui.gameMe) {
                gs.ui.handZone.style.left = `calc(${gs.ui.gameMe.clientWidth}px)`;
            }

            if (callback) {
                callback(p, pos, gs, skinWid);
            }
        };
        let skinPath = "image/tractor/skin/";
        let skinKey = skinURL.substring(skinPath.length)
        if (gs.ui.avatarResources[skinKey]) {
            img.src = gs.ui.avatarResources[skinKey];
        } else {
            img.src = skinURL;
        }
    }

    public UpdateSkinStatus() {
        if (this.gameScene.isInGameHall()) {
            let daojuInfoByPlayer = this.DaojuInfo.daojuInfoByPlayer[this.tractorPlayer.PlayerId];
            let pMe = CommonMethods.GetPlayerByID(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.PlayerId);
            if (daojuInfoByPlayer) {
                let ownedSkinInfoList = daojuInfoByPlayer.ownedSkinInfo;
                if (ownedSkinInfoList && ownedSkinInfoList.includes(this.gameScene.skinInUse)) {
                    let skinType = this.GetSkinType(this.gameScene.skinInUse);
                    let skinExtention = skinType === 0 ? "webp" : "gif";
                    let skinURL = `image/tractor/skin/${this.gameScene.skinInUse}.${skinExtention}`;
                    if (this.gameScene.isInGameRoom()) {
                        this.SetAvatarImage(false, this.gameScene, 0, skinType, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight, this.SetObText, pMe);
                    }
                    else {
                        this.SetAvatarImage(false, this.gameScene, 0, skinType, skinURL, this.gameScene.ui.gameMe, this.gameScene.coordinates.cardHeight);
                    }
                }
            }
            return;
        }

        // 如果在房间里，则实时更新其它玩家的皮肤
        if (this.gameScene.isInGameRoom()) {
            this.destroyPokerPlayerObGameRoom();
            var curIndex = CommonMethods.GetPlayerIndexByID(this.tractorPlayer.CurrentGameState.Players, this.tractorPlayer.PlayerId)
            for (let i = 0; i < 4; i++) {
                let p = this.tractorPlayer.CurrentGameState.Players[curIndex];
                if (p) {
                    let playerImage = i === 0 ? this.gameScene.ui.gameMe : this.gameScene.ui.gameRoomImagesChairOrPlayer[i];
                    //skin
                    let skinInUse = this.DaojuInfo.daojuInfoByPlayer[p.PlayerId] ? this.DaojuInfo.daojuInfoByPlayer[p.PlayerId].skinInUse : CommonMethods.defaultSkinInUse;
                    let skinType = this.GetSkinType(skinInUse)
                    let skinExtention = skinType === 0 ? "webp" : "gif";
                    let skinURL = `image/tractor/skin/${skinInUse}.${skinExtention}`;
                    this.SetAvatarImage(false, this.gameScene, i, skinType, skinURL, playerImage, this.gameScene.coordinates.cardHeight, this.SetObText, p);
                }

                curIndex = (curIndex + 1) % 4
            }
        }
    }

    public NotifyEmojiEventHandler(playerID: string, emojiType: number, emojiIndex: number, isCenter: boolean, msgString: string, noSpeaker: boolean) {
        let isPlayerInGameHall = this.gameScene.isInGameHall();
        if (0 <= emojiType && emojiType < CommonMethods.animatedEmojiTypeLength && Object.keys(this.PlayerPosition).includes(playerID)) {
            msgString = CommonMethods.emojiMsgs[emojiType];
            if (!isPlayerInGameHall) {
                this.drawingFormHelper.DrawEmojiByPosition(this.PlayerPosition[playerID], emojiType, emojiIndex, isCenter);
            }
        }
        if (isCenter) return;
        let finalMsg = "";
        // if (!isPlayerInGameHall && this.sgDrawingHelper.hiddenEffects[msgString]) {
        //     if (this.isInHiddenGames()) {
        //         finalMsg = `【${playerID}】发动了隐藏技：【${msgString}】，因为游戏中已屏蔽`;
        //     } else {
        //         this.sgDrawingHelper.hiddenEffects[msgString].apply(this.sgDrawingHelper);
        //         finalMsg = `【${playerID}】发动了隐藏技：【${msgString}】`;
        //     }
        // } else if (!isPlayerInGameHall && this.sgDrawingHelper.hiddenGames[msgString]) {
        //     if (this.isInHiddenGames()) {
        //         finalMsg = `【${playerID}】发动了隐藏技：【${msgString}】，因为游戏中已屏蔽`;
        //     } else {
        //         finalMsg = `【${playerID}】发动了隐藏技：【${msgString}】`;
        //         if (this.tractorPlayer.MyOwnId === playerID) this.sgDrawingHelper.hiddenGames[msgString].apply(this.sgDrawingHelper, [true, playerID]);
        //     }
        // } else {
        let prefix = CommonMethods.systemMsgPrefix;
        if (playerID && !noSpeaker) {
            prefix = `【${playerID}】说：`;
        }
        finalMsg = `${prefix}${msgString}`;
        // }
        this.drawingFormHelper.DrawDanmu(finalMsg);
        this.appendChatMsg(finalMsg);
    }

    //     public isInHiddenGames(): boolean {
    //         return this.sgDrawingHelper.hiddenGamesImages &&
    //             this.sgDrawingHelper.hiddenGamesImages.length > 0 &&
    //             this.sgDrawingHelper.hiddenGamesImages[0].visible
    //     }

    public appendChatMsg(finalMsg: string) {
        let p = document.createElement("p");
        p.innerText = finalMsg
        this.gameScene.ui.divChatHistory.appendChild(p);
        this.gameScene.ui.divChatHistory.scrollTop = this.gameScene.ui.divChatHistory.scrollHeight;
    }

    public updateOnlineAndRoomPlayerList(roomStateList: RoomState[], playersInGameHall: string[]) {
        // gather players with status
        let playersInGameRoomPlaying: any = {};
        let playersInGameRoomObserving: any = {};
        let playerIsOffline: any = {};

        for (let i = 0; i < roomStateList.length; i++) {
            let rs: RoomState = roomStateList[i];
            let roomName = rs.roomSetting.RoomName;
            for (let j = 0; j < 4; j++) {
                if (rs.CurrentGameState.Players[j] != null) {
                    let player: PlayerEntity = rs.CurrentGameState.Players[j];
                    if (!playersInGameRoomPlaying[roomName]) {
                        playersInGameRoomPlaying[roomName] = [];
                    }
                    if (!playersInGameRoomObserving[roomName]) {
                        playersInGameRoomObserving[roomName] = [];
                    }
                    playersInGameRoomPlaying[roomName].push(player.PlayerId);
                    if (player.IsOffline) {
                        playerIsOffline[player.PlayerId] = true;
                    }
                    if (player.Observers && player.Observers.length > 0) {
                        playersInGameRoomObserving[roomName] = playersInGameRoomObserving[roomName].concat(player.Observers);
                    }
                }
            }
        }

        this.gameScene.ui.divOnlinePlayerList.innerHTML = '';

        // players in game hall
        if (playersInGameHall && playersInGameHall.length > 0) {
            let headerGameHall = document.createElement("p");
            headerGameHall.innerText = "大厅";
            headerGameHall.style.fontWeight = 'bold';
            this.gameScene.ui.divOnlinePlayerList.appendChild(headerGameHall);

            for (let i = 0; i < playersInGameHall.length; i++) {
                let d = document.createElement("div");
                d.style.position = 'static';
                d.style.display = 'block';
                let pid = playersInGameHall[i];
                let noChat = this.isChatBanned(pid) ? "-禁言中" : "";
                let clientVersion = this.DaojuInfo.daojuInfoByPlayer[pid].clientType === CommonMethods.PLAYER_CLIENT_TYPE_shengjiweb ? "-怀旧版" : "";
                let pidInfo = `${pid}${noChat}${clientVersion}`;
                d.innerText = `【${pidInfo}】升币：${this.DaojuInfo.daojuInfoByPlayer[pid].Shengbi}`;
                this.gameScene.ui.divOnlinePlayerList.appendChild(d);
            }
        }

        // players in game room playing or observing
        for (const [key, value] of Object.entries(playersInGameRoomPlaying)) {
            let players: string[] = value as string[];
            let obs: string[] = playersInGameRoomObserving[key]

            let headerGameRoomPlaying = document.createElement("p");
            headerGameRoomPlaying.innerText = `房间【${key}】桌上`;
            headerGameRoomPlaying.style.fontWeight = 'bold';
            this.gameScene.ui.divOnlinePlayerList.appendChild(headerGameRoomPlaying);
            for (let i = 0; i < players.length; i++) {
                let d = document.createElement("div");
                d.style.position = 'static';
                d.style.display = 'block';
                let pid = players[i];
                let noChat = this.isChatBanned(pid) ? "-禁言中" : "";
                let clientVersion = this.DaojuInfo.daojuInfoByPlayer[pid].clientType === CommonMethods.PLAYER_CLIENT_TYPE_shengjiweb ? "-怀旧版" : "";
                let isOfflineInfo = (pid in playerIsOffline) ? "-离线中" : "";
                let pidInfo = `${pid}${noChat}${clientVersion}${isOfflineInfo}`;
                d.innerText = `【${pidInfo}】升币：${this.DaojuInfo.daojuInfoByPlayer[pid].Shengbi}`;
                this.gameScene.ui.divOnlinePlayerList.appendChild(d);
            }

            if (obs && obs.length > 0) {
                let headerGameRoomObserving = document.createElement("p");
                headerGameRoomObserving.innerText = `房间【${key}】树上`;
                headerGameRoomObserving.style.fontWeight = 'bold';
                this.gameScene.ui.divOnlinePlayerList.appendChild(headerGameRoomObserving);
                for (let i = 0; i < obs.length; i++) {
                    let d = document.createElement("div");
                    d.style.position = 'static';
                    d.style.display = 'block';
                    let pid = obs[i];
                    let noChat = this.isChatBanned(pid) ? "-禁言中" : "";
                    let clientVersion = this.DaojuInfo.daojuInfoByPlayer[pid].clientType === CommonMethods.PLAYER_CLIENT_TYPE_shengjiweb ? "-怀旧版" : "";
                    let pidInfo = `${pid}${noChat}${clientVersion}`;
                    d.innerText = `【${pidInfo}】升币：${this.DaojuInfo.daojuInfoByPlayer[pid].Shengbi}`;
                    this.gameScene.ui.divOnlinePlayerList.appendChild(d);
                }
            }
        }
        this.gameScene.ui.divOnlinePlayerList.scrollTop = this.gameScene.ui.divOnlinePlayerList.scrollHeight;
    }

    public NotifyOnlinePlayerListEventHandler(playerID: string, isJoining: boolean) {
        let isJoingingStr = isJoining ? "加入" : "退出";
        let chatMsg = `【${playerID}】${isJoingingStr}了游戏`;
        this.appendChatMsg(chatMsg);
        if (isJoining && this.shouldSoundEnter(playerID, true)) this.gameScene.playAudio(CommonMethods.audioEnterHall);
    }

    public NotifyGameRoomPlayerListEventHandler(playerID: string, isJoining: boolean, roomName: string) {
        if (!roomName) return;
        let isJoingingStr = isJoining ? "加入" : "退出";
        let chatMsg = `【${playerID}】${isJoingingStr}了房间【${roomName}】`;
        this.appendChatMsg(chatMsg);
        if (isJoining && this.shouldSoundEnter(playerID, false)) this.gameScene.playAudio(CommonMethods.audioEnterRoom, CommonMethods.GetPlayerCount(this.tractorPlayer.CurrentGameState.Players));
    }

    private shouldSoundEnter(playerID: string, isJoiningGameHall: boolean) {
        // 如果我在大厅，别人加入大厅
        if (this.gameScene.isInGameHall() && isJoiningGameHall && playerID !== this.tractorPlayer.PlayerId) return true;

        // 如果我在房间里、游戏尚未开始
        let players = this.tractorPlayer.CurrentGameState.Players;
        if (this.gameScene.isInGameRoom() &&
            this.tractorPlayer.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.BeforeDistributingCards &&
            // 有人加入大厅 或者 有人加入我所在的房间
            (isJoiningGameHall || CommonMethods.GetPlayerByID(players, playerID))) {
            return true;
        }
        return false;
    }

    public CutCardShoeCardsEventHandler() {
        let cutInfo = ""
        let cutPoint = -1;
        if (this.IsDebug || this.gameScene.ui.inputFormWrapper || this.gameScene.noCutCards.toLowerCase() === "true") {
            cutPoint = 0;
            cutInfo = `取消,${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
            return;
        }

        var inputFormWrapper = this.gameScene.ui.create.div('.inputFormWrapper', this.gameScene.ui.frameMain);
        inputFormWrapper.id = "inputFormWrapper";
        inputFormWrapper.style.position = 'absolute';
        inputFormWrapper.style.width = 'calc(100%)';
        inputFormWrapper.style.height = 'calc(100%)';
        inputFormWrapper.style.color = 'black';
        inputFormWrapper.style.textShadow = 'none';
        inputFormWrapper.style.zIndex = CommonMethods.zIndexSettingsForm;

        this.gameScene.ui.inputFormWrapper = inputFormWrapper;

        jQuery(inputFormWrapper).load("game/tractor/src/text/cutcards_form.htm", (response: any, status: any, xhr: any) => { this.renderCutCardsForm(response, status, xhr, this.gameScene) });
    }

    public renderCutCardsForm(response: any, status: any, xhr: any, gs: GameScene) {
        let cutInfo = ""
        let cutPoint = -1;

        let btnRandom: any = document.getElementById("btnRandom")

        // fix bug: 其它操作导致切牌对话框被终止，则视为取消切牌
        if (!btnRandom) {
            let cutPoint = 0;
            let cutInfo = `取消,${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
            return;
        }

        btnRandom.onclick = () => {
            cutPoint = CommonMethods.GetRandomInt(107) + 1;
            cutInfo = `${btnRandom.value},${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
        }

        let btnCancel: any = document.getElementById("btnCancel")
        btnCancel.onclick = () => {
            cutPoint = 0;
            cutInfo = `${btnCancel.value},${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
        }

        let btnBapi1: any = document.getElementById("btnBapi1")
        btnBapi1.onclick = () => {
            cutPoint = 1;
            cutInfo = `${btnBapi1.value},${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
        }

        let btnBapi3: any = document.getElementById("btnBapi3")
        btnBapi3.onclick = () => {
            cutPoint = 3;
            cutInfo = `${btnBapi3.value},${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
        }

        let btnManual: any = document.getElementById("btnManual")
        btnManual.onclick = () => {
            let txtManual: any = document.getElementById("txtManual")
            let cutPointStr = txtManual.value;
            if (CommonMethods.IsNumber(cutPointStr)) {
                cutPoint = parseInt(cutPointStr);
            }
            cutInfo = `${btnManual.value},${cutPoint}`;
            this.CutCardShoeCardsCompleteEventHandler(cutPoint, cutInfo);
        }
    }
    public CutCardShoeCardsCompleteEventHandler(cutPoint: number, cutInfo: string) {
        if (cutPoint < 0 || cutPoint > 108) {
            alert("请输入0-108之间的数字");
        } else {
            this.gameScene.sendMessageToServer(CommonMethods.PlayerHasCutCards_REQUEST, this.tractorPlayer.MyOwnId, cutInfo);
            if (this.gameScene.ui.inputFormWrapper) {
                this.gameScene.ui.inputFormWrapper.remove();
                delete this.gameScene.ui.inputFormWrapper;
            }
        }
    }

    public DoReplayMainForm() {
        var replayFormWrapper = this.gameScene.ui.create.div('.replayFormWrapper', this.gameScene.ui.frameChat);
        replayFormWrapper.id = "replayFormWrapper";
        replayFormWrapper.style.position = 'relative';
        replayFormWrapper.style.display = 'block';
        replayFormWrapper.style.color = 'black';
        replayFormWrapper.style.textShadow = 'none';
        replayFormWrapper.style.textAlign = 'center';
        replayFormWrapper.style.height = '100%';
        this.gameScene.ui.replayFormWrapper = replayFormWrapper;

        jQuery(replayFormWrapper).load("game/tractor/src/text/replay_form.htm", (response: any, status: any, xhr: any) => { this.renderReplayMainForm(response, status, xhr, this.gameScene) });
    }

    public renderReplayMainForm(response: any, status: any, xhr: any, gs: GameScene) {
        this.selectDates = document.getElementById("selectDates")
        this.selectTimes = document.getElementById("selectTimes")
        let btnLoadReplay: any = document.getElementById("btnLoadReplay")

        this.selectDates.onchange = () => {
            this.onDatesSelectChange(true, 0)
        }

        if (!this.gameScene.ui.gameRoomImagesChairOrPlayer) {
            this.gameScene.ui.gameRoomImagesChairOrPlayer = [];
        }

        if (!this.gameScene.ui.pokerPlayerStartersLabel) {
            this.gameScene.ui.pokerPlayerStartersLabel = [];
            for (let i = 0; i < 4; i++) {
                var lblStarter = this.gameScene.ui.create.div('.lblStarter', "", this.gameScene.ui.frameGameRoom);
                lblStarter.style.fontFamily = 'serif';
                lblStarter.style.fontSize = '20px';
                lblStarter.style.color = 'orange';
                lblStarter.style['font-weight'] = 'bold';
                lblStarter.style.textAlign = 'left';
                this.gameScene.ui.pokerPlayerStartersLabel.push(lblStarter);

                var obX = this.gameScene.coordinates.playerStarterPositions[i].x;
                var obY = this.gameScene.coordinates.playerStarterPositions[i].y;
                switch (i) {
                    case 0:
                        lblStarter.style.left = `calc(${obX})`;
                        lblStarter.style.bottom = `calc(${obY})`;
                        break;
                    case 1:
                        lblStarter.style.right = `calc(${obX})`;
                        lblStarter.style.bottom = `calc(${obY})`;
                        lblStarter.style.textAlign = 'right';
                        break;
                    case 2:
                        lblStarter.style.right = `calc(${obX})`;
                        lblStarter.style.top = `calc(${obY})`;
                        break;
                    case 3:
                        lblStarter.style.left = `calc(${obX})`;
                        lblStarter.style.bottom = `calc(${obY})`;
                        break;
                    default:
                        break;
                }
            }
        }

        this.InitReplayEntities();
        btnLoadReplay.onclick = () => {
            if (this.selectTimes.selectedIndex < 0) return;
            this.loadReplayEntity(this.currentReplayEntities[1][this.selectTimes.selectedIndex], true);

            // btnFirstPersonView
            if (!this.btnFirstPersonView) this.btnFirstPersonView = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv.replayButtonsClass.replayButtonsClass5', '第一视角', this.gameScene.ui.replayFormWrapper, () => this.btnFirstPersonView_Click());

            // btnFirstTrick
            if (!this.btnFirstTrick) this.btnFirstTrick = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv.replayButtonsClass.replayButtonsClass4', '第一轮', this.gameScene.ui.replayFormWrapper, () => this.btnFirstTrick_Click());

            // btnPreviousTrick
            if (!this.btnPreviousTrick) this.btnPreviousTrick = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv.replayButtonsClass.replayButtonsClass3', '上一轮', this.gameScene.ui.replayFormWrapper, () => this.btnPreviousTrick_Click());

            // btnNextTrick
            if (!this.btnNextTrick) this.btnNextTrick = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv.replayButtonsClass.replayButtonsClass2', '下一轮', this.gameScene.ui.replayFormWrapper, () => this.btnNextTrick_Click());

            // btnLastTrick
            if (!this.btnLastTrick) this.btnLastTrick = this.gameScene.ui.create.div('.menubutton.highlight.pointerdiv.replayButtonsClass.replayButtonsClass1', '最末轮', this.gameScene.ui.replayFormWrapper, () => this.btnLastTrick_Click());
        }
    }

    public InitReplayEntities() {
        this.removeOptions(this.selectDates);
        IDBHelper.ReadReplayEntityAll((dtList: string[]) => {
            let dates: string[] = [];
            for (let i = 0; i < dtList.length; i++) {
                let dt: string = dtList[i];
                let datetimes: string[] = dt.split(IDBHelper.replaySeparator);
                let dateString = datetimes[0];
                if (!dates.includes(dateString)) {
                    dates.push(dateString);
                    var option = document.createElement("option");
                    option.text = dateString;
                    this.selectDates.add(option);
                }
            }
            this.selectDates.selectedIndex = this.selectDates.options.length - 1;
            this.onDatesSelectChange(true, 0);
        });
    }

    private loadReplayEntity(re: ReplayEntity, shouldDraw: boolean) {
        this.tractorPlayer.replayEntity.CloneFrom(re);
        let nullCTS = new CurrentTrickState();
        nullCTS.Rank = -1;
        this.tractorPlayer.replayEntity.CurrentTrickStates.push(nullCTS); // use null to indicate end of tricks, so that to show ending scores
        this.tractorPlayer.replayedTricks = [];
        this.tractorPlayer.replayEntity.Players = CommonMethods.RotateArray(this.tractorPlayer.replayEntity.Players, this.tractorPlayer.replayAngle);
        if (this.tractorPlayer.replayEntity.PlayerRanks != null) {
            this.tractorPlayer.replayEntity.PlayerRanks = CommonMethods.RotateArray(this.tractorPlayer.replayEntity.PlayerRanks, this.tractorPlayer.replayAngle);
        }

        this.StartReplay(shouldDraw);
    }

    private StartReplay(shouldDraw: boolean) {
        this.drawingFormHelper.resetReplay();
        this.drawingFormHelper.destroyLast8Cards()
        let players: string[] = this.tractorPlayer.replayEntity.Players;
        let playerRanks: number[] = new Array(4);
        if (this.tractorPlayer.replayEntity.PlayerRanks != null) {
            playerRanks = this.tractorPlayer.replayEntity.PlayerRanks;
        }
        else {
            let tempRank: number = this.tractorPlayer.replayEntity.CurrentHandState.Rank;
            playerRanks = [tempRank, tempRank, tempRank, tempRank];
        }

        this.destroyImagesChairOrPlayer();

        for (let i = 0; i < 4; i++) {
            let starterText = players[i] === this.tractorPlayer.replayEntity.CurrentHandState.Starter ? "庄家" : `${i + 1}`;
            this.gameScene.ui.pokerPlayerStartersLabel[i].innerHTML = starterText

            let playerUI = this.CreatePlayer(i, players[i], this.gameScene.ui.frameGameRoom);
            this.gameScene.ui.gameRoomImagesChairOrPlayer[i] = playerUI;
            if (i === 0) {
                this.gameScene.ui.gameMe = playerUI
                if (!this.gameScene.ui.handZone) {
                    this.drawHandZone();
                }
                continue;
            }

            // 切换视角
            playerUI.style.cursor = 'pointer';
            // click
            playerUI.addEventListener("click", (e: any) => {
                let pos = i + 1;
                this.replayAngleByPosition(pos);
            });
            // mouseover
            playerUI.addEventListener("mouseover", (e: any) => {
                let targetUI = jQuery(e.target).closest('.player')[0];
                let pos = parseInt(targetUI.getAttribute('data-position'));
                if (pos === 2) targetUI.style.top = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y} - 5px)`;
                else targetUI.style.bottom = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y} + 5px)`;
            });
            // mouseout
            playerUI.addEventListener("mouseout", (e: any) => {
                let targetUI = jQuery(e.target).closest('.player')[0];
                let pos = parseInt(targetUI.getAttribute('data-position'));
                if (pos === 2) targetUI.style.top = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y})`;
                else targetUI.style.bottom = `calc(${this.gameScene.coordinates.playerSkinPositions[i].y})`;
            });
        }

        this.tractorPlayer.PlayerId = players[0];

        this.tractorPlayer.CurrentGameState = new GameState();
        for (let i = 0; i < 4; i++) {
            let temp = new PlayerEntity();
            temp.PlayerId = players[i];
            temp.Rank = playerRanks[i];
            temp.Team = (i % 2) + 1;

            this.tractorPlayer.CurrentGameState.Players[i] = temp;
        }
        //set player position
        this.PlayerPosition = {};
        this.PositionPlayer = {};
        let nextPlayer: string = players[0];
        let postion = 1;
        this.PlayerPosition[nextPlayer] = postion;
        this.PositionPlayer[postion] = nextPlayer;
        nextPlayer = CommonMethods.GetNextPlayerAfterThePlayer(this.tractorPlayer.CurrentGameState.Players, nextPlayer).PlayerId;
        while (nextPlayer != players[0]) {
            postion++;
            this.PlayerPosition[nextPlayer] = postion;
            this.PositionPlayer[postion] = nextPlayer;
            nextPlayer = CommonMethods.GetNextPlayerAfterThePlayer(this.tractorPlayer.CurrentGameState.Players, nextPlayer).PlayerId;
        }

        this.tractorPlayer.CurrentHandState = new CurrentHandState();
        this.tractorPlayer.CurrentHandState.CloneFrom(this.tractorPlayer.replayEntity.CurrentHandState);
        for (const [key, value] of Object.entries(this.tractorPlayer.CurrentHandState.PlayerHoldingCards)) {
            let tempcp = new CurrentPoker();
            tempcp.CloneFrom(value as CurrentPoker)
            this.tractorPlayer.CurrentHandState.PlayerHoldingCards[key] = tempcp;
            this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[key] = tempcp;
        }


        this.tractorPlayer.CurrentHandState.Score = 0;
        this.tractorPlayer.CurrentHandState.ScoreCards = [];
        this.tractorPlayer.CurrentPoker = this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[players[0]];

        this.drawingFormHelper.DrawSidebarFull();
        if (this.shouldShowLast8Cards()) this.drawingFormHelper.DrawDiscardedCards();

        if (shouldDraw) {
            this.drawAllPlayerHandCards();
            this.drawingFormHelper.TrumpMadeCardsShowFromLastTrick();
        }
    }

    private drawAllPlayerHandCards() {
        if (this.gameScene.yesFirstPersonView === "true") {
            this.drawingFormHelper.DrawHandCardsByPosition(1, this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[this.PositionPlayer[1]], 1);
        } else {
            for (let i = 1; i <= 4; i++) {
                this.drawingFormHelper.DrawHandCardsByPosition(i, this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[this.PositionPlayer[i]], i == 1 ? 1 : this.gameScene.coordinates.replayHandCardScale);
            }
        }
    }

    private replayNextTrick() {
        if (this.tractorPlayer.replayEntity.CurrentTrickStates.length == 0) {
            return;
        }

        let isOnePlayerAtATime = this.onePlayerAtATime && this.onePlayerAtATime.curIndex < this.onePlayerAtATime.cardsListList.length || this.gameScene.yesFirstPersonView === "true" && this.tractorPlayer.replayEntity.CurrentTrickStates.length > 2;
        let isOnePlayerAtATimeInit = isOnePlayerAtATime && (!this.onePlayerAtATime || this.onePlayerAtATime.curIndex >= this.onePlayerAtATime.cardsListList.length);
        if (isOnePlayerAtATimeInit) {
            this.onePlayerAtATime = new OnePlayerAtATime(this.drawingFormHelper);
        }
        let trick!: CurrentTrickState;
        let isNormalShowCards = true;
        if (!isOnePlayerAtATime || isOnePlayerAtATimeInit) {
            trick = this.tractorPlayer.replayEntity.CurrentTrickStates[0];
            this.tractorPlayer.replayEntity.CurrentTrickStates.shift();
            this.tractorPlayer.replayedTricks.push(trick);
            if (trick.Rank < 0) {
                // 已出完所有牌，结束画面
                this.tractorPlayer.CurrentHandState.ScoreCards = CommonMethods.deepCopy<number[]>(this.tractorPlayer.replayEntity.CurrentHandState.ScoreCards);
                this.tractorPlayer.CurrentHandState.Score = this.tractorPlayer.replayEntity.CurrentHandState.Score;

                this.drawingFormHelper.resetReplay();
                this.drawingFormHelper.DrawFinishedSendedCards();
                return;
            }
            isNormalShowCards = Object.keys(trick.ShowedCards).length == 4;
            if (isOnePlayerAtATimeInit && isNormalShowCards) {
                this.onePlayerAtATime.winner = trick.Winner;
                this.onePlayerAtATime.points = trick.Points();
                this.onePlayerAtATime.scoreCards = trick.ScoreCards();
            }
        }

        if (!isOnePlayerAtATime || isOnePlayerAtATimeInit) {
            this.drawingFormHelper.resetReplay();
            if (isOnePlayerAtATimeInit) {
                this.drawAllPlayerHandCards();
            }
        }

        if (!isOnePlayerAtATime || isOnePlayerAtATimeInit) {
            if (Object.keys(trick.ShowedCards).length == 1 && this.PlayerPosition[trick.Learder] == 1) {
                this.DrawDumpFailureMessage(trick);
            }
        }

        let curPlayer!: string;
        if (!isOnePlayerAtATime || isOnePlayerAtATimeInit) {
            this.tractorPlayer.CurrentTrickState = trick;
            curPlayer = trick.Learder;
        }
        let drawDelay = 100;
        let i = 1;

        if (!isOnePlayerAtATime || isOnePlayerAtATimeInit) {
            for (; i <= Object.keys(trick.ShowedCards).length; i++) {
                let position = this.PlayerPosition[curPlayer];
                if (isNormalShowCards) {
                    trick.ShowedCards[curPlayer].forEach((card: any) => {
                        this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[curPlayer].RemoveCard(card);
                    })
                }

                let cardsList: number[] = CommonMethods.deepCopy<number[]>(trick.ShowedCards[curPlayer]);
                if (isOnePlayerAtATimeInit) {
                    this.onePlayerAtATime.cardsListList.push(cardsList);
                    this.onePlayerAtATime.positionList.push(position);
                } else {
                    setTimeout(() => {
                        this.drawingFormHelper.DrawShowedCardsByPosition(cardsList, position)
                    }, i * drawDelay);
                }
                curPlayer = CommonMethods.GetNextPlayerAfterThePlayer(this.tractorPlayer.CurrentGameState.Players, curPlayer).PlayerId;
            }
        }

        if (isOnePlayerAtATime) {
            this.onePlayerAtATime.DrawShowedCardsOnePlayerAtATime();
        }

        if (!isOnePlayerAtATime || isOnePlayerAtATimeInit) {
            if (Object.keys(trick.ShowedCards).length == 1 && this.PlayerPosition[trick.Learder] != 1) {
                this.DrawDumpFailureMessage(trick);
            }
        }

        if (isOnePlayerAtATime) {
            // 如果刚刚画完的出牌是自己的，则重画刷新自己的手牌
            if (this.onePlayerAtATime.positionList[this.onePlayerAtATime.curIndex - 1] == 1) {
                this.drawingFormHelper.destroyAllCards();
                this.drawAllPlayerHandCards();
            }
        } else {
            setTimeout(() => {
                this.drawAllPlayerHandCards();
            }, i * drawDelay);
        }

        if (!isOnePlayerAtATime) {
            if (trick.Winner) {
                if (!this.tractorPlayer.CurrentGameState.ArePlayersInSameTeam(
                    this.tractorPlayer.CurrentHandState.Starter, trick.Winner)) {
                    this.tractorPlayer.CurrentHandState.Score += trick.Points();
                    //收集得分牌
                    this.tractorPlayer.CurrentHandState.ScoreCards = this.tractorPlayer.CurrentHandState.ScoreCards.concat(trick.ScoreCards());
                }
            }
        } else {
            if (this.onePlayerAtATime.curIndex == 4 && this.onePlayerAtATime.winner) {
                if (!this.tractorPlayer.CurrentGameState.ArePlayersInSameTeam(
                    this.tractorPlayer.CurrentHandState.Starter, this.onePlayerAtATime.winner)) {
                    this.tractorPlayer.CurrentHandState.Score += this.onePlayerAtATime.points;
                    //收集得分牌
                    this.tractorPlayer.CurrentHandState.ScoreCards = this.tractorPlayer.CurrentHandState.ScoreCards.concat(this.onePlayerAtATime.scoreCards);
                }
            }
        }
        this.drawingFormHelper.DrawScoreImageAndCards();
    }

    private DrawDumpFailureMessage(trick: CurrentTrickState) {
        this.tractorPlayer.NotifyMessage([
            `玩家【${trick.Learder}】`,
            `甩牌${trick.ShowedCards[trick.Learder].length}张失败`,
            `罚分：${trick.ShowedCards[trick.Learder].length * 10}`,
            "",
            "",
            "",
            ""
        ]);
    }

    public btnFirstPersonView_Click() {
        if (this.gameScene.yesFirstPersonView === "false") {
            this.gameScene.yesFirstPersonView = "true";
            this.btnFirstPersonView.innerText = "全开视角";
        } else {
            this.gameScene.yesFirstPersonView = "false";
            this.btnFirstPersonView.innerText = "第一视角";
        }
        this.StartReplay(true);
    }

    public btnFirstTrick_Click() {
        if (this.onePlayerAtATime) {
            this.onePlayerAtATime.curIndex = 4;
        }
        if (this.tractorPlayer.replayedTricks.length > 0) this.loadReplayEntity(this.currentReplayEntities[1][this.selectTimes.selectedIndex], true);
        else {
            if (this.replayPreviousFile()) this.btnLastTrick_Click();
        }
    }

    public btnPreviousTrick_Click() {
        if (this.onePlayerAtATime) {
            this.onePlayerAtATime.curIndex = 4;
        }
        if (this.tractorPlayer.replayedTricks.length > 1) {
            this.drawingFormHelper.resetReplay();
            this.revertReplayTrick();
            this.revertReplayTrick();
            this.replayNextTrick();
        }
        else if (this.tractorPlayer.replayedTricks.length == 1) {
            this.btnFirstTrick_Click();
        }
        else {
            if (this.replayPreviousFile()) this.btnLastTrick_Click();
        }
    }

    public btnNextTrick_Click() {
        if (this.tractorPlayer.replayEntity.CurrentTrickStates.length == 0) {
            this.replayNextFile();
            return;
        }
        this.replayNextTrick();
    }

    public btnLastTrick_Click() {
        if (this.onePlayerAtATime) {
            this.onePlayerAtATime.curIndex = 4;
        }
        if (this.tractorPlayer.replayEntity.CurrentTrickStates.length > 0) {
            while (this.tractorPlayer.replayEntity.CurrentTrickStates.length > 1) {
                let trick: CurrentTrickState = this.tractorPlayer.replayEntity.CurrentTrickStates[0];
                this.tractorPlayer.replayedTricks.push(trick);
                this.tractorPlayer.replayEntity.CurrentTrickStates.shift();

                // 甩牌失败
                if (Object.keys(trick.ShowedCards).length == 1) continue;

                let curPlayer: string = trick.Learder;
                for (let i = 0; i < Object.keys(trick.ShowedCards).length; i++) {
                    trick.ShowedCards[curPlayer].forEach((card: any) => {
                        this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[curPlayer].RemoveCard(card);
                    })
                    curPlayer = CommonMethods.GetNextPlayerAfterThePlayer(this.tractorPlayer.CurrentGameState.Players, curPlayer).PlayerId;
                }
            }
            this.drawingFormHelper.DrawHandCardsByPosition(1, this.tractorPlayer.CurrentPoker, 1);
            this.replayNextTrick();
        }
        else this.replayNextFile();
    }

    private replayPreviousFile(): boolean {
        if (this.selectTimes.selectedIndex > 0) {
            this.selectTimes.selectedIndex = this.selectTimes.selectedIndex - 1;
            this.loadReplayEntity(this.currentReplayEntities[1][this.selectTimes.selectedIndex], false);
            return true;
        }
        else if (this.selectDates.selectedIndex > 0) {
            this.selectDates.selectedIndex = this.selectDates.selectedIndex - 1;
            this.onDatesSelectChange(false, -1);
            if (this.selectTimes.options && this.selectTimes.options.length > 0) {
                this.selectTimes.selectedIndex = this.selectTimes.options.length - 1;
                this.loadReplayEntity(this.currentReplayEntities[1][this.selectTimes.selectedIndex], false);
                return true;
            }
        }
        return false;
    }

    private replayNextFile() {
        if (this.selectTimes.selectedIndex < this.selectTimes.options.length - 1) {
            this.selectTimes.selectedIndex = this.selectTimes.selectedIndex + 1;
            this.loadReplayEntity(this.currentReplayEntities[1][this.selectTimes.selectedIndex], true);
        }
        else if (this.selectDates.selectedIndex < this.selectDates.options.length - 1) {
            this.selectDates.selectedIndex = this.selectDates.selectedIndex + 1;
            this.onDatesSelectChange(false, 1);
            if (this.selectTimes.options && this.selectTimes.options.length > 0) {
                this.loadReplayEntity(this.currentReplayEntities[1][this.selectTimes.selectedIndex], true);
            }
        }
    }

    private revertReplayTrick() {
        let trick: CurrentTrickState = (this.tractorPlayer.replayedTricks.pop() as CurrentTrickState);
        this.tractorPlayer.replayEntity.CurrentTrickStates.unshift(trick);
        if (trick.Rank < 0) {
            this.tractorPlayer.CurrentHandState.Score -= this.tractorPlayer.CurrentHandState.ScorePunishment + this.tractorPlayer.CurrentHandState.ScoreLast8CardsBase * this.tractorPlayer.CurrentHandState.ScoreLast8CardsMultiplier;
            if (this.shouldShowLast8Cards()) this.drawingFormHelper.DrawDiscardedCards();
        }
        else if (Object.keys(trick.ShowedCards).length == 4) {
            for (const [key, value] of Object.entries(trick.ShowedCards)) {
                (value as number[]).forEach(card => {
                    this.tractorPlayer.replayEntity.CurrentHandState.PlayerHoldingCards[key].AddCard(card);
                })
            }
            if (trick.Winner) {
                if (!this.tractorPlayer.CurrentGameState.ArePlayersInSameTeam(this.tractorPlayer.CurrentHandState.Starter, trick.Winner)) {
                    this.tractorPlayer.CurrentHandState.Score -= trick.Points();
                    //收集得分牌
                    trick.ScoreCards().forEach(sc => {
                        this.tractorPlayer.CurrentHandState.ScoreCards = CommonMethods.ArrayRemoveOneByValue(this.tractorPlayer.CurrentHandState.ScoreCards, sc)
                    })
                }
            }
            this.drawingFormHelper.DrawScoreImageAndCards();
        }
    }

    // pos is 1-based
    public replayAngleByPosition(pos: number) {
        let angleOffset = pos - 1;
        this.tractorPlayer.replayAngle = (this.tractorPlayer.replayAngle + angleOffset) % 4;
        this.tractorPlayer.replayEntity.Players = CommonMethods.RotateArray(this.tractorPlayer.replayEntity.Players, angleOffset);
        if (this.tractorPlayer.replayEntity.PlayerRanks != null) {
            this.tractorPlayer.replayEntity.PlayerRanks = CommonMethods.RotateArray(this.tractorPlayer.replayEntity.PlayerRanks, angleOffset);
        }
        this.StartReplay(true);
    }

    private onDatesSelectChange(isFromClick: boolean, direction: number) {
        if (isFromClick) {
            this.currentReplayEntities = [undefined, undefined, undefined];
            IDBHelper.ReadReplayEntityByDate(this.selectDates.value, (reList: ReplayEntity[]) => {
                this.currentReplayEntities[1] = reList;
                this.removeOptions(this.selectTimes);
                for (let i = 0; i < reList.length; i++) {
                    let re: ReplayEntity = reList[i];
                    let datetimes: string[] = re.ReplayId.split(IDBHelper.replaySeparator);
                    let timeString = datetimes[1];
                    var option = document.createElement("option");
                    option.text = timeString;
                    this.selectTimes.add(option);
                }
            });
            let prevDatesIndex = this.selectDates.selectedIndex - 1;
            if (prevDatesIndex >= 0) {
                IDBHelper.ReadReplayEntityByDate(this.selectDates.options[prevDatesIndex].value, (reList: ReplayEntity[]) => {
                    this.currentReplayEntities[0] = reList;
                });
            }
            let nextDatesIndex = this.selectDates.selectedIndex + 1;
            if (nextDatesIndex < this.selectDates.options.length) {
                IDBHelper.ReadReplayEntityByDate(this.selectDates.options[nextDatesIndex].value, (reList: ReplayEntity[]) => {
                    this.currentReplayEntities[2] = reList;
                });
            }
        } else {
            this.removeOptions(this.selectTimes);
            let reList: ReplayEntity[] = this.currentReplayEntities[1 + direction];
            for (let i = 0; i < reList.length; i++) {
                let re: ReplayEntity = reList[i];
                let datetimes: string[] = re.ReplayId.split(IDBHelper.replaySeparator);
                let timeString = datetimes[1];
                var option = document.createElement("option");
                option.text = timeString;
                this.selectTimes.add(option);
            }
            let newDatesIndex = this.selectDates.selectedIndex + direction;
            if (direction < 0) {
                this.currentReplayEntities.pop();
                this.currentReplayEntities.unshift(undefined);
                if (newDatesIndex >= 0) {
                    IDBHelper.ReadReplayEntityByDate(this.selectDates.options[newDatesIndex].value, (reList: ReplayEntity[]) => {
                        this.currentReplayEntities[0] = reList;
                    });
                }
            } else {
                this.currentReplayEntities.shift();
                this.currentReplayEntities.push(undefined);
                if (newDatesIndex < this.selectDates.options.length) {
                    IDBHelper.ReadReplayEntityByDate(this.selectDates.options[newDatesIndex].value, (reList: ReplayEntity[]) => {
                        this.currentReplayEntities[2] = reList;
                    });
                }
            }
        }
    }

    private shouldShowLast8Cards() {
        return this.gameScene.yesFirstPersonView !== "true" ||
            this.tractorPlayer.CurrentHandState.Starter === this.tractorPlayer.replayEntity.Players[0];
    }

    public removeOptions(selectElement: any) {
        var i, L = selectElement.options.length - 1;
        for (i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }

    public FullScreenPop(str: string) {
        var node = this.gameScene.ui.create.div('.damage');
        node.innerHTML = str;
        node.dataset.nature = 'thunder';
        this.gameScene.ui.window.appendChild(node);
        this.gameScene.ui.refresh(node);
        node.classList.add('damageadded');
        setTimeout(function () {
            node.delete();
            node.style.transform = 'scale(1.5)'
        }, 1600);
    }

    public WaitForPlayer(timerLength: number, playerID: string) {
        this.ClearTimer();
        let pos = this.PlayerPosition[playerID];
        let playerUI: any = undefined;
        let onend: any = undefined;
        let playCountDownAudio: any = () => {
            this.gameScene.playAudio(CommonMethods.audioCountdown8Sec);
        };
        let isSomeoneElse: boolean = false;
        if (playerID === this.tractorPlayer.PlayerId) {
            this.gameScene.ui.timer.show();
            onend = () => {
                this.gameScene.ui.timer.hide();
                // if actual player, trigger robot
                if (!this.tractorPlayer.isObserver) {
                    this.btnRobot_Click();
                }
            };
            playerUI = this.gameScene.ui.gameMe;
        } else {
            if (playerID in this.PlayerPosition) {
                isSomeoneElse = true;
                playerUI = this.gameScene.ui.gameRoomImagesChairOrPlayer[pos - 1];
                if (playerUI) playerUI.showTimer(1000 * timerLength)
            }
        }
        // 如果游戏还没进行到到庄家埋底阶段，则无需触发倒计时提示特效（切牌无需倒计时提示）
        if (this.tractorPlayer.CurrentHandState.CurrentHandStep < SuitEnums.HandStep.DiscardingLast8Cards) {
            playerUI = undefined;
            playCountDownAudio = undefined;
        }
        this.gameScene.game.countDown(timerLength, onend, true, playerUI, playCountDownAudio, isSomeoneElse);
    }

    public UnwaitForPlayer(playerID: string) {
        this.ClearTimer();
        this.gameScene.stopAudio(CommonMethods.audioCountdown8Sec);
        if (playerID !== this.tractorPlayer.PlayerId) {
            if (playerID in this.PlayerPosition) {
                let pos = this.PlayerPosition[playerID];
                let playerUI = this.gameScene.ui.gameRoomImagesChairOrPlayer[pos - 1];
                if (playerUI) playerUI.hideTimer()
            }
        }
    }
}
