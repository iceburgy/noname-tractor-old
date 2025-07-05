import { RoomSetting } from './room_setting.js';
import { CurrentPoker } from './current_poker.js';
import { GameState } from './game_state.js';
import { CurrentHandState } from './current_hand_state.js';
import { CurrentTrickState } from './current_trick_state.js';
import { PlayerLocalCache } from './player_local_cache.js';
import { CommonMethods } from './common_methods.js';
import { MainForm } from './main_form.js';
import { SuitEnums } from './suit_enums.js';
import { TractorRules } from './tractor_rules.js';
import { ShowingCardsValidationResult } from './showing_cards_validation_result.js';
import { RoomState } from './room_state.js';
import { ReplayEntity } from './replay_entity.js';
import { IDBHelper } from './idb_helper.js';

const PlayerMakeTrump_REQUEST = "PlayerMakeTrump"
const UsedShengbi_REQUEST = "UsedShengbi"
const NotifyPong_REQUEST = "NotifyPong"

declare let decadeUI: any;

export class TractorPlayer {
    public mainForm: MainForm
    public CurrentRoomSetting: RoomSetting
    public CurrentPoker: CurrentPoker
    public PlayerId: string
    public MyOwnId: string
    public isObserver: boolean
    public IsTryingReenter: boolean
    public IsOtherTryingReenter: boolean
    public IsTryingResumeGame: boolean
    public ShowLastTrickCards: boolean

    public CurrentGameState: GameState;
    public CurrentHandState: CurrentHandState
    public CurrentTrickState: CurrentTrickState;
    public playerLocalCache: PlayerLocalCache;
    public replayEntity: ReplayEntity;
    public replayedTricks: CurrentTrickState[];
    public replayAngle: number;
    public PingInterval = 17000;
    public PingStatus = 0; // 0: uninitialized; -1: unhealthy; 1: healthy

    constructor(mf: MainForm) {
        this.mainForm = mf
        this.CurrentRoomSetting = new RoomSetting()
        this.CurrentPoker = new CurrentPoker()
        this.PlayerId = mf.gameScene.playerName
        this.MyOwnId = mf.gameScene.playerName
        this.isObserver = false
        this.IsTryingReenter = false
        this.IsOtherTryingReenter = false
        this.IsTryingResumeGame = false
        this.ShowLastTrickCards = false
        this.CurrentGameState = new GameState()
        this.CurrentHandState = new CurrentHandState(this.CurrentGameState)
        this.CurrentTrickState = new CurrentTrickState()
        this.playerLocalCache = new PlayerLocalCache()
        this.replayEntity = new ReplayEntity()
        this.replayedTricks = []
        this.replayAngle = 0
    }

    public destroyAllClientMessages() {
        if (this.mainForm.gameScene.clientMessages == null || this.mainForm.gameScene.clientMessages.length == 0) return
        this.mainForm.gameScene.clientMessages.forEach((msg: any) => {
            msg.remove();
        });
        this.mainForm.gameScene.clientMessages = []
    }

    public NotifyPing() {
        this.mainForm.gameScene.sendMessageToServer(NotifyPong_REQUEST, this.MyOwnId, "");
        // during initial login after a new release, it'll take more than 5 seconds to fully load
        // and it tends to time out. 
        // hence don't trigger health check if it is not fully loaded
        if (!(this.mainForm.gameScene.isInGameHall() || this.mainForm.gameScene.isInGameRoom())) return;

        this.PingStatus = 1;
        setTimeout(() => {
            if (this.PingStatus < 0) {
                this.NotifyMessage(["您已离线，请尝试刷新页面重连"]);
            } else {
                this.PingStatus = -1;
            }
        }, this.PingInterval + this.PingInterval / 2);

        // check noDongtuUntil
        if (this.mainForm.gameScene.noDongtu.toLowerCase() === "true" && this.mainForm.isNoDongtuUntilExpired(this.mainForm.DaojuInfo)) {
            let finalMsg = `${CommonMethods.systemMsgPrefix}道具【关闭动图】已到期`;
            this.mainForm.drawingFormHelper.DrawDanmu(finalMsg);
            this.mainForm.appendChatMsg(finalMsg);
            this.mainForm.gameScene.noDongtu = "false";
            this.mainForm.UpdateSkinStatus();
        }

        // check noChatUntil
        if (this.mainForm.gameScene.noChat && !this.mainForm.isChatBanned(this.MyOwnId)) {
            let finalMsg = `${CommonMethods.systemMsgPrefix}禁言已解除，请刷新页面使其生效`;
            this.mainForm.drawingFormHelper.DrawDanmu(finalMsg);
            this.mainForm.appendChatMsg(finalMsg);
            this.mainForm.gameScene.noChat = false;
        }
    }

    public NotifyGameState(gameState: GameState, notifyType?: string) {
        //bug修复：如果所有人都开始了，然后来自服务器的新消息开始人数既不是0又不是4（由于网络延迟导致有一人未开始的来自服务器的消息滞后到达），那么不处理这条消息
        var isCurrentAllReady = CommonMethods.GetReadyCount(this.CurrentGameState.Players) == 4
        var newReadyCount = CommonMethods.GetReadyCount(gameState.Players);
        if (isCurrentAllReady && 0 < newReadyCount && newReadyCount < 4) {
            return
        }

        var teamMade = false;
        var playerChanged = false;
        var observerChanged = false;
        for (let i = 0; i < gameState.Players.length; i++) {
            var p = gameState.Players[i]
            if (p != null && p.Observers.includes(this.MyOwnId, 0)) {
                if (this.PlayerId != p.PlayerId) {
                    this.isObserver = true;
                    this.PlayerId = p.PlayerId;
                }
                break;
            }
        }

        var curIndex = CommonMethods.GetPlayerIndexByID(gameState.Players, this.PlayerId)
        let newPlayerPosition: any = {};
        let newPositionPlayer: any = {};
        for (let i = 0; i < 4; i++) {
            let p = gameState.Players[curIndex];
            if (p) {
                newPlayerPosition[p.PlayerId] = i + 1;
                newPositionPlayer[i + 1] = p.PlayerId;
            }
            curIndex = (curIndex + 1) % 4
        }

        let oldObservee = "";
        let newObservee = "";

        var totalPlayers = 0;
        for (let i = 0; i < 4; i++) {
            playerChanged = playerChanged || !(!newPositionPlayer[i + 1] && !this.mainForm.PositionPlayer[i + 1] ||
                newPositionPlayer[i + 1] && this.mainForm.PositionPlayer[i + 1] && newPositionPlayer[i + 1] == this.mainForm.PositionPlayer[i + 1]);
            observerChanged = observerChanged || !(!this.CurrentGameState.Players[i] && !gameState.Players[i] ||
                this.CurrentGameState.Players[i] && gameState.Players[i] && CommonMethods.ArrayIsEqual(this.CurrentGameState.Players[i].Observers, gameState.Players[i].Observers));

            if (this.CurrentGameState.Players[i] && this.CurrentGameState.Players[i].Observers.includes(this.MyOwnId)) oldObservee = this.CurrentGameState.Players[i].PlayerId;
            if (gameState.Players[i] && gameState.Players[i].Observers.includes(this.MyOwnId)) newObservee = gameState.Players[i].PlayerId;

            if (gameState.Players[i] != null && gameState.Players[i].Team != 0 &&
                (this.CurrentGameState.Players[i] == null || this.CurrentGameState.Players[i].PlayerId != gameState.Players[i].PlayerId || this.CurrentGameState.Players[i].Team != gameState.Players[i].Team)) {
                teamMade = true;
            }
            if (gameState.Players[i] != null) {
                totalPlayers++;
            }
        }
        let shouldReDrawChairOrPlayer = playerChanged || newObservee !== "" && newObservee !== oldObservee;
        var anyBecomesReady = CommonMethods.SomeoneBecomesReady(this.CurrentGameState.Players, gameState.Players)

        this.CurrentGameState.CloneFrom(gameState);

        if (teamMade || observerChanged && totalPlayers == 4) {
            this.mainForm.PlayersTeamMade()
        }

        if ((playerChanged || observerChanged)) {
            this.mainForm.PlayerPosition = newPlayerPosition;
            this.mainForm.PositionPlayer = newPositionPlayer;
            this.mainForm.NewPlayerJoined(shouldReDrawChairOrPlayer)
        }

        for (let i = 0; i < gameState.Players.length; i++) {
            var p = gameState.Players[i]
            if (p == null) continue;
            if (p.PlayerId == this.PlayerId) {
                this.mainForm.NewPlayerReadyToStart(p.IsReadyToStart)
                this.mainForm.PlayerToggleIsRobot(p.IsRobot)
                this.mainForm.PlayerToggleIsQiangliang(p.IsQiangliang)
                if (anyBecomesReady &&
                    (this.CurrentHandState.CurrentHandStep <= SuitEnums.HandStep.BeforeDistributingCards || this.CurrentHandState.CurrentHandStep >= SuitEnums.HandStep.SpecialEnding)) {
                    if (CommonMethods.AllReady(this.CurrentGameState.Players)) this.mainForm.gameScene.playAudio(CommonMethods.audioTie);
                    else this.mainForm.gameScene.playAudio(CommonMethods.audioRecoverhp);
                }
                break;
            }
        }

        if (this.IsTryingReenter ||
            this.IsTryingResumeGame) {
            this.mainForm.ReenterOrResumeOrObservePlayerByIDEvent(true)
            this.IsTryingReenter = false;
            this.IsTryingResumeGame = false;
        }
        if (this.IsOtherTryingReenter) {
            this.IsOtherTryingReenter = false;
        }
    }

    public NotifyRoomSetting(roomSetting: RoomSetting, showMessage: boolean) {
        if (this.IsTryingReenter) {
            this.mainForm.drawGameRoom();
        }

        this.CurrentRoomSetting = roomSetting;

        if (this.mainForm.gameScene.ui.roomNameText
            && this.mainForm.gameScene.ui.roomOwnerText) {
            (this.mainForm.gameScene.ui.roomNameText as any).innerHTML = `房间：${roomSetting.RoomName}`;
            (this.mainForm.gameScene.ui.roomOwnerText as any).innerHTML = `房主：${this.mainForm.gameScene.hidePlayerID ? "" : roomSetting.RoomOwner}`;
        }

        if (showMessage) {
            var msgs = []
            if (roomSetting.DisplaySignalCardInfo) {
                msgs.push("信号牌机制声明：")
                msgs.push("一方出A，同伴出8、9、J、Q代表有另一张A")
                msgs.push("使用常主调主表示寻求对家帮忙清主")
                msgs.push("")
            } else {
                msgs.push("该房间不打信号牌")
                msgs.push("")
            }

            msgs.push("房间设置：")
            msgs.push(`关闭大牌语音及画面提示：${roomSetting.HideOverridingFlag ? "是" : "否"}`)
            msgs.push(`出牌时限：${roomSetting.secondsToShowCards > 0 ? roomSetting.secondsToShowCards + "秒" : "不限制"}`)
            msgs.push(`埋底时限：${roomSetting.secondsToDiscardCards > 0 ? roomSetting.secondsToDiscardCards + "秒" : "不限制"}`)

            this.NotifyMessage(msgs)
        }
    }
    public NotifyCurrentHandState(currentHandState: CurrentHandState, notifyType?: string) {
        var trumpChanged = false;
        var newHandStep = false;
        var starterChanged = false;
        trumpChanged = this.CurrentHandState.Trump != currentHandState.Trump || (this.CurrentHandState.Trump == currentHandState.Trump && this.CurrentHandState.TrumpExposingPoker < currentHandState.TrumpExposingPoker);
        newHandStep = this.CurrentHandState.CurrentHandStep != currentHandState.CurrentHandStep;
        starterChanged = this.CurrentHandState.Starter != currentHandState.Starter;

        this.CurrentHandState.CloneFrom(currentHandState);

        //埋底中
        if (currentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards) {
            if (currentHandState.Last8Holder == this.MyOwnId) {
                this.mainForm.gameScene.ui.btnPig.show();
                this.mainForm.gameScene.ui.btnPig.classList.add("disabled");
                this.mainForm.gameScene.ui.btnPig.classList.remove('pointerdiv');
            }
            this.mainForm.setStartLabels();
        }

        //断线重连后重画手牌
        if (this.IsTryingReenter || this.IsTryingResumeGame) {
            this.CurrentPoker.CloneFrom(this.CurrentHandState.PlayerHoldingCards[this.PlayerId] as CurrentPoker)
            this.CurrentPoker.Rank = this.CurrentHandState.Rank;
            this.CurrentPoker.Trump = this.CurrentHandState.Trump;
            return;
        }

        //改变旁观视角
        if (notifyType && notifyType === CommonMethods.NotifyStateType_ObservePlayerById) {
            let drawCards = false;
            if (SuitEnums.HandStep.DistributingCards <= currentHandState.CurrentHandStep &&
                currentHandState.CurrentHandStep <= SuitEnums.HandStep.Playing &&
                this.CurrentHandState.PlayerHoldingCards != undefined &&
                this.CurrentHandState.PlayerHoldingCards[this.PlayerId] != undefined) {
                drawCards = true;
                this.CurrentPoker.CloneFrom(this.CurrentHandState.PlayerHoldingCards[this.PlayerId] as CurrentPoker)
                this.CurrentPoker.Rank = this.CurrentHandState.Rank;
                this.CurrentPoker.Trump = this.CurrentHandState.Trump;
            }
            this.mainForm.ReenterOrResumeOrObservePlayerByIDEvent(drawCards)
            this.mainForm.TrumpChangedForObservePlayerById()
            return;
        }

        this.CurrentPoker.Trump = this.CurrentHandState.Trump;

        if (trumpChanged) {
            this.mainForm.TrumpChanged()

            // //resort cards
            if (currentHandState.CurrentHandStep > SuitEnums.HandStep.DistributingCards) {
                this.mainForm.drawingFormHelper.ResortMyHandCards();
            }
        }
        if (currentHandState.CurrentHandStep == SuitEnums.HandStep.BeforeDistributingCards) {
            this.mainForm.StartGame()
        }
        else if (newHandStep) {
            if (currentHandState.CurrentHandStep == SuitEnums.HandStep.DistributingCardsFinished) {
                this.mainForm.ResetBtnRobot();
                this.mainForm.drawingFormHelper.ResortMyHandCards();
            }
            else if (currentHandState.CurrentHandStep == SuitEnums.HandStep.DistributingLast8Cards) {
                this.mainForm.DistributingLast8Cards()
            }
            else if (currentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards) {
                this.mainForm.DiscardingLast8()
            }
            else if (currentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8CardsFinished) {
                this.mainForm.Last8Discarded()
            }
            //player begin to showing card
            //开始出牌
            else if (currentHandState.CurrentHandStep == SuitEnums.HandStep.Playing) {
                this.mainForm.drawingFormHelper.ResortMyHandCards();
                this.mainForm.ShowingCardBegan();
            }
            else if (currentHandState.CurrentHandStep == SuitEnums.HandStep.Ending) {
                this.mainForm.HandEnding();
            }
            // else if (currentHandState.CurrentHandStep == SuitEnums.HandStep.SpecialEnding)
            // {
            //     if (SpecialEndingEvent != null)
            //         SpecialEndingEvent();
            // }
        }

        //显示庄家
        if (starterChanged || this.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Ending || currentHandState.CurrentHandStep == SuitEnums.HandStep.SpecialEnding) {
            this.mainForm.StarterChangedEvent()
        }

        //摸完牌，庄家亮不起主，所以换庄家
        if (currentHandState.CurrentHandStep == SuitEnums.HandStep.DistributingCardsFinished && starterChanged) {
            this.CurrentPoker.Rank = this.CurrentHandState.Rank;
            this.mainForm.StarterFailedForTrump()
        }
    }

    public NotifyCurrentTrickState(currentTrickState: CurrentTrickState, notifyType?: string) {
        this.CurrentTrickState.CloneFrom(currentTrickState);

        if (notifyType === CommonMethods.NotifyStateType_ObservePlayerById) return;

        // 显示确定按钮，提示当前回合玩家出牌
        let isMeNextPlayer = this.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing &&
            Object.keys(this.CurrentTrickState.ShowedCards).length > 0 &&
            this.CurrentTrickState.NextPlayer() == this.MyOwnId;
        if (!this.isObserver && isMeNextPlayer) {
            this.mainForm.gameScene.ui.btnPig.show();
            this.mainForm.gameScene.ui.btnPig.classList.add("disabled");
            this.mainForm.gameScene.ui.btnPig.classList.remove('pointerdiv');
        }
        // 出牌中
        if (this.CurrentHandState.CurrentHandStep >= SuitEnums.HandStep.Playing) {
            this.mainForm.setStartLabels();
        }
        if (this.IsOtherTryingReenter || this.IsTryingReenter || this.IsTryingResumeGame) return;

        if (this.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Ending || this.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.SpecialEnding) {
            return;
        }
        if (this.CurrentTrickState.LatestPlayerShowedCard() != "") {
            this.mainForm.PlayerShowedCards();
        }

        if (this.CurrentTrickState.Winner) {
            this.mainForm.TrickFinished();
        }

        if (!this.CurrentTrickState.IsStarted()) {
            this.mainForm.TrickStarted();
        }
    }

    //我是否可以亮主
    public AvailableTrumps(): number[] {
        let availableTrumps: number[] = []
        let rank = this.CurrentHandState.Rank;

        if (this.CurrentHandState.CurrentHandStep >= SuitEnums.HandStep.DistributingLast8Cards) {
            availableTrumps = []
            return availableTrumps;
        }

        //当前是自己亮的单张主，只能加固
        if (this.CurrentHandState.TrumpMaker == this.PlayerId) {
            if (this.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.SingleRank) {
                if (rank != 53) {
                    if (this.CurrentPoker.Clubs()[rank] > 1) {
                        if (this.CurrentHandState.Trump == SuitEnums.Suit.Club)
                            availableTrumps.push(SuitEnums.Suit.Club);
                    }
                    if (this.CurrentPoker.Diamonds()[rank] > 1) {
                        if (this.CurrentHandState.Trump == SuitEnums.Suit.Diamond)
                            availableTrumps.push(SuitEnums.Suit.Diamond);
                    }
                    if (this.CurrentPoker.Spades()[rank] > 1) {
                        if (this.CurrentHandState.Trump == SuitEnums.Suit.Spade)
                            availableTrumps.push(SuitEnums.Suit.Spade);
                    }
                    if (this.CurrentPoker.Hearts()[rank] > 1) {
                        if (this.CurrentHandState.Trump == SuitEnums.Suit.Heart)
                            availableTrumps.push(SuitEnums.Suit.Heart);
                    }
                }
            }
            return availableTrumps;
        }

        //如果目前无人亮主
        if (this.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.None) {
            if (rank != 53) {
                if (this.CurrentPoker.Clubs()[rank] > 0) {
                    availableTrumps.push(SuitEnums.Suit.Club);
                }
                if (this.CurrentPoker.Diamonds()[rank] > 0) {
                    availableTrumps.push(SuitEnums.Suit.Diamond);
                }
                if (this.CurrentPoker.Spades()[rank] > 0) {
                    availableTrumps.push(SuitEnums.Suit.Spade);
                }
                if (this.CurrentPoker.Hearts()[rank] > 0) {
                    availableTrumps.push(SuitEnums.Suit.Heart);
                }
            }
        }
        //亮了单张
        else if (this.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.SingleRank) {

            if (rank != 53) {
                if (this.CurrentPoker.Clubs()[rank] > 1) {
                    availableTrumps.push(SuitEnums.Suit.Club);
                }
                if (this.CurrentPoker.Diamonds()[rank] > 1) {
                    availableTrumps.push(SuitEnums.Suit.Diamond);
                }
                if (this.CurrentPoker.Spades()[rank] > 1) {
                    availableTrumps.push(SuitEnums.Suit.Spade);
                }
                if (this.CurrentPoker.Hearts()[rank] > 1) {
                    availableTrumps.push(SuitEnums.Suit.Heart);
                }
            }
        }

        if (this.CurrentHandState.TrumpExposingPoker != SuitEnums.TrumpExposingPoker.PairRedJoker) {
            if (rank != 53) {
                if (this.CurrentPoker.BlackJoker() == 2) {
                    availableTrumps.push(SuitEnums.Suit.Joker);
                }
            }
        }

        if (rank != 53) {
            if (this.CurrentPoker.RedJoker() == 2) {
                availableTrumps.push(SuitEnums.Suit.Joker);
            }
        }
        return availableTrumps;
    }

    public ExposeTrump(trumpExposingPoker: number, trump: number, usedShengbi: number) {
        let params: number[] = [trumpExposingPoker, trump, usedShengbi]
        this.mainForm.gameScene.sendMessageToServer(PlayerMakeTrump_REQUEST, this.PlayerId, JSON.stringify(params))
    }

    public GetDistributedCard(cardNumber: number) {
        this.CurrentPoker.AddCard(cardNumber)

        if (this.CurrentHandState.CurrentHandStep != SuitEnums.HandStep.DistributingLast8Cards) {
            this.mainForm.PlayerOnGetCard(cardNumber);
        }

        if (this.CurrentPoker.Count() == TractorRules.GetCardNumberofEachPlayer(this.CurrentGameState.Players.length) + 8) {
            this.mainForm.drawingFormHelper.ResortMyHandCards();
        }
    }

    public NotifyMessage(msgs: string[]) {
        if (this.mainForm.gameScene.hidePlayerID) return;

        if (msgs == null || msgs.length == 0) {
            return
        }
        else if (msgs.length > 0 && msgs[0] === CommonMethods.loginSuccessFlag) {
            return;
        }

        this.destroyAllClientMessages()
        let posX = this.mainForm.gameScene.coordinates.clientMessagePosition.x;
        let posY = `${this.mainForm.gameScene.coordinates.clientMessagePosition.y} - ${(msgs.length - 1) / 2 * this.mainForm.gameScene.coordinates.lineOffsetY}px`;
        if (msgs.length >= 2 && msgs[1].includes("获胜！")) {
            posX = this.mainForm.gameScene.coordinates.totalPointsPosition.x;
            posY = `${this.mainForm.gameScene.coordinates.totalPointsPosition.y} + 30px`;
        }
        for (let i = 0; i < msgs.length; i++) {
            let m = msgs[i]
            if (m.includes("获胜！")) {
                this.mainForm.gameScene.playAudio(CommonMethods.audioWin);
            }
            else if (m.includes(CommonMethods.reenterRoomSignal)) {
                if (m.includes(`【${this.MyOwnId}】`)) {
                    this.IsTryingReenter = true;
                } else {
                    this.IsOtherTryingReenter = true;
                }
            }
            else if (m == CommonMethods.resumeGameSignal) {
                this.IsTryingResumeGame = true;
            }
            else if (m.includes("新游戏即将开始")) {
                //新游戏开始前播放提示音，告诉玩家要抢庄
                this.mainForm.gameScene.playAudio(CommonMethods.audioWin);
                this.mainForm.FullScreenPop("准备抢庄！");
            }
            else if (m.includes("罚分") && !this.mainForm.gameScene.isReplayMode) {
                //甩牌失败播放提示音
                let playerID = this.MyOwnId;
                if (msgs[0].includes("【")) {
                    playerID = msgs[0].split("【")[1].split("】")[0];
                }
                this.mainForm.gameScene.playAudio(CommonMethods.audioShuaicuo, this.mainForm.GetPlayerSex(playerID));
            }

            let parent = this.mainForm.gameScene.ui.frameGameHall;
            if (this.mainForm.gameScene.isInGameRoom()) {
                parent = this.mainForm.gameScene.ui.frameGameRoom;
            }
            if (!parent) {
                parent = this.mainForm.gameScene.ui.arena;
            }

            var notifyMessageText = this.mainForm.gameScene.ui.create.div('.notifyMessageText', m, parent);
            notifyMessageText.style.fontFamily = 'serif';
            notifyMessageText.style.fontSize = '28px';
            notifyMessageText.style.color = 'yellow';
            notifyMessageText.style.textAlign = 'center';
            notifyMessageText.style.left = `calc(${posX})`;
            notifyMessageText.style.top = `calc(${posY} + ${i * this.mainForm.gameScene.coordinates.lineOffsetY}px)`;
            this.mainForm.gameScene.clientMessages.push(notifyMessageText);
        }
    }
    public NotifyCardsReady(mcir: boolean[]) {
        for (let i = 0; i < mcir.length; i++) {
            this.mainForm.myCardIsReady[i] = mcir[i];
        }
        this.mainForm.drawingFormHelper.DrawMyPlayingCards()
    }
    public UsedShengbi(usedShengbiType: string) {
        this.mainForm.gameScene.sendMessageToServer(UsedShengbi_REQUEST, this.PlayerId, usedShengbiType)
    }

    public NotifyDaojuInfo(daojuInfo: any, updateQiandao: boolean, updateSkin: boolean) {
        // 如果刚刚购买了道具“关闭动图”，则令其直接生效
        if (this.mainForm.isNoDongtuUntilExpired(this.mainForm.DaojuInfo) && !this.mainForm.isNoDongtuUntilExpired(daojuInfo) && this.mainForm.gameScene.noDongtu === "false") {
            this.mainForm.gameScene.noDongtu = "true";
            this.mainForm.gameScene.game.saveConfig("noDongtu", this.mainForm.gameScene.noDongtu);
        }

        this.mainForm.DaojuInfo = daojuInfo;
        this.mainForm.gameScene.noChat = this.mainForm.isChatBanned(this.MyOwnId);
        if (updateQiandao) this.mainForm.UpdateQiandaoStatus();
        this.mainForm.gameScene.skinInUse = daojuInfo.daojuInfoByPlayer[this.MyOwnId] ? daojuInfo.daojuInfoByPlayer[this.MyOwnId].skinInUse : CommonMethods.defaultSkinInUse;
        if (updateSkin) this.mainForm.UpdateSkinStatus();
    }
}