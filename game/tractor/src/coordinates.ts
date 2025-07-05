import { CommonMethods } from "./common_methods.js";
import { GameScene } from "./game_scene.js";

const chatWidth = 240;
const screenWidthReal = document.documentElement.clientWidth;
const screenWidth = screenWidthReal - chatWidth;
const screenHeight = document.documentElement.clientHeight;

export class Coordinates {
    public isReplayMode = false;
    // 屏幕左上角为坐标原点 (0, 0), 横轴为 x, 纵轴为 y
    // 右边无法显示的区域
    public screenWidReal
    public screenWid
    public screenHei
    public centerXReal
    public centerX
    public centerY
    public hiddenWidth
    public chatWid
    public chatHeightRatio

    // progress bar
    public progressBarWidth
    public progressBarHeight

    // hall controls
    public hallPlayerHeaderPosition
    public hallPlayerTopPosition

    public pokerTablePositionStart
    public pokerTableOffsets
    public pokerTableLabelOffsets

    public pokerChairOffsets

    // danmu
    public danmuPositionY
    public danmuOffset

    // room controls
    public clientMessagePosition
    public lineOffsetY

    public cardWidth
    public cardHeight
    public handCardOffset
    public suitSequenceSize
    public overridingFlagHeight
    public overridingFlagWidth

    public btnLowerSize
    public btnExitRoomPosition
    public btnExitAndObservePosition
    public btnSmallGamesPosition
    public btnShowLastTrickPosition
    public btnReadyPosition
    public btnRobotPosition
    public btnFirstPersonView
    public btnFirstTrickPosition

    public controlButtonOffset

    // players
    // public playerMainTextPositions
    // public playerTextPositions
    public playerSkinPositions
    public playerChairPositions
    public observerTextPositions
    public player1TextWid
    public player1TextWidBigDelta
    public regexNonEnglishChar = /[^\u0000-\u007F]/g

    public playerStarterPositions
    // public player1StarterWid

    public sgsAnimWidth
    public sgsAnimHeight
    public sgsAnimOffsetY

    // cards
    public showedCardsPositions
    public showedCardsPositionsAni
    public trumpMadeCardsPositions
    public trumpMadeCardsScale

    // last8cards
    public last8CardsForStarterPosition

    // replay
    // account for maximum of five suites, with 4 gaps, shift to left by 2 gaps
    public replayControlButtonWidth
    public replayHandCardScale
    public handCardPositions
    public toolbarSize
    public toolbarPosition
    public btnPigPosition

    // sidebar for room info and game state
    // public iconSize
    // public sidebarOffset
    // public roomNameTextPosition
    // public roomOwnerTextPosition
    // public sidebarMyTeamPostion
    // public sidebarOpTeamPostion
    // public sidebarTrumpMaker
    // public sidebarScoreText
    // public sidebarScoreCards

    // sidebar for replay
    public replayBarPosition

    // ending UI
    public last8Position
    public scoreCardsPosition
    public winPointsPosition
    public last8PointsPosition
    public punishmentPointsPosition
    public totalPointsPosition

    // public countDownPosition
    public countDownSzie

    // distributing last 8
    public distributingLast8MaxEdge
    public distributingLast8Position
    public distributingLast8PositionOffset
    public discardLast8AniPosition

    constructor(gs: GameScene) {
        this.isReplayMode = gs.isReplayMode;
        // 屏幕左上角为坐标原点 (0, 0), 横轴为 x, 纵轴为 y
        // 右边无法显示的区域
        this.screenWidReal = screenWidthReal
        this.screenWid = this.isReplayMode ? this.screenWidReal : screenWidth
        this.screenHei = screenHeight
        this.centerXReal = screenWidthReal * 0.5
        this.centerX = this.screenWid * 0.5
        this.centerY = screenHeight * 0.5
        this.hiddenWidth = 20
        this.chatWid = chatWidth
        this.chatHeightRatio = 0.7;

        // progress bar
        this.progressBarWidth = 300
        this.progressBarHeight = 30

        // hall controls
        this.hallPlayerHeaderPosition = { x: 50, y: 160 }
        this.hallPlayerTopPosition = { x: 50, y: 240 }

        this.pokerTablePositionStart = { x: 320, y: 160 }
        this.pokerTableOffsets = { x: 400, y: 320 }
        this.pokerTableLabelOffsets = { x: 40, y: 20 }

        this.pokerChairOffsets = [
            { x: 40, y: -80 },
            { x: -80, y: 40 },
            { x: 40, y: 120 },
            { x: 160, y: 40 },
        ]

        // danmu
        this.danmuPositionY = '50px';
        this.danmuOffset = 40;

        // room controls
        this.controlButtonOffset = 10

        this.clientMessagePosition = { x: "50% - 200px", y: "50%" };
        this.lineOffsetY = 40

        this.cardWidth = 90
        this.cardHeight = 120
        this.handCardOffset = gs.useCardUIStyleClassic ? 18 : 24;
        this.suitSequenceSize = 15
        this.overridingFlagHeight = 40
        this.overridingFlagWidth = this.overridingFlagHeight * 3 / 2

        this.btnLowerSize = 90
        this.btnExitRoomPosition = { x: 10, y: screenHeight - 60 }
        this.btnExitAndObservePosition = { x: this.btnExitRoomPosition.x + this.btnLowerSize, y: this.btnExitRoomPosition.y }
        this.btnSmallGamesPosition = { x: this.btnExitAndObservePosition.x + this.btnLowerSize, y: this.btnExitRoomPosition.y }
        this.btnShowLastTrickPosition = { x: this.screenWid - 90, y: this.btnExitRoomPosition.y }
        this.btnReadyPosition = { x: this.btnShowLastTrickPosition.x - this.btnLowerSize, y: this.btnShowLastTrickPosition.y }
        this.btnRobotPosition = { x: this.btnShowLastTrickPosition.x - this.btnLowerSize * 2, y: this.btnShowLastTrickPosition.y }
        this.btnFirstPersonView = { x: this.btnExitRoomPosition.x + this.btnLowerSize, y: this.btnExitRoomPosition.y }
        this.btnFirstTrickPosition = { x: this.screenWid - 300, y: this.btnExitRoomPosition.y }

        // players
        this.player1TextWid = 20;
        this.player1TextWidBigDelta = 12;
        // this.playerMainTextPositions = [
        //     { x: "0px", y: "0px" },
        //     { x: "0px", y: "50% - 80px" },
        //     { x: "50% - 60px", y: "0px" },
        //     { x: "0px", y: "50% - 80px" },
        // ]
        // this.playerTextPositions = [
        //     { x: this.playerMainTextPositions[0].x, y: this.playerMainTextPositions[0].y },
        //     { x: this.playerMainTextPositions[1].x, y: this.playerMainTextPositions[1].y + 120 },
        //     { x: this.playerMainTextPositions[2].x, y: this.playerMainTextPositions[2].y }, // x is dynamically calculated based on skin width
        //     { x: this.playerMainTextPositions[3].x, y: this.playerMainTextPositions[3].y + 120 },
        // ]

        // from decadeLayout.css - using top
        this.playerSkinPositions = [
            { x: "0px", y: "0px" },
            { x: "0px", y: "50% - 60px" },
            { x: "50% - 45px", y: "0px" },
            { x: "0px", y: "50% - 60px" },
        ]
        this.playerChairPositions = [
            { x: "0px", y: "0px" }, // ignore, not used
            { x: this.playerSkinPositions[1].x, y: `${this.playerSkinPositions[1].y} + 40px` },
            { x: this.playerSkinPositions[2].x, y: this.playerSkinPositions[2].y },
            { x: this.playerSkinPositions[3].x, y: `${this.playerSkinPositions[3].y} + 40px` },
        ]
        this.observerTextPositions = [
            { x: `${this.playerSkinPositions[0].x}`, y: "1%" },
            { x: "0px", y: "50% + 70px" },
            { x: `${this.playerSkinPositions[2].x}`, y: "0px" },
            { x: "0px", y: "50% + 70px" },
        ]

        // this.player1StarterWid = 100;
        this.playerStarterPositions = [
            { x: "0px", y: "1% + 130px" },
            { x: "0px", y: "50% + 70px" },
            { x: "50% + 55px", y: "0px" },
            { x: "0px", y: "50% + 70px" },
        ]

        this.sgsAnimWidth = 80;
        this.sgsAnimHeight = 120;
        this.sgsAnimOffsetY = 10;

        // cards
        this.showedCardsPositions = [
            { x: this.playerSkinPositions[2].x, y: `${this.playerSkinPositions[0].y} + ${this.cardHeight + 45}px` },
            { x: `${this.playerSkinPositions[1].x} + 180px`, y: `${this.playerSkinPositions[1].y}` },
            { x: this.playerSkinPositions[2].x, y: `${this.playerSkinPositions[2].y} + 160px` },
            { x: `${this.playerSkinPositions[3].x} + 180px`, y: `${this.playerSkinPositions[3].y}` },
        ]
        this.showedCardsPositionsAni = [
            { x: this.playerSkinPositions[2].x, y: `${this.playerSkinPositions[0].y} + ${this.cardHeight + 40}px` },
            { x: `${this.playerSkinPositions[1].x} + 180px`, y: `${this.playerSkinPositions[1].y}` },
            { x: this.playerSkinPositions[2].x, y: `${this.playerSkinPositions[2].y} + 160px` },
            { x: `${this.playerSkinPositions[3].x} + 180px`, y: `${this.playerSkinPositions[3].y}` },
        ]
        this.trumpMadeCardsScale = 2 / 3
        // from last trick
        this.trumpMadeCardsPositions = [
            { x: "0px", y: "1%" },
            { x: "0px", y: "50% + 100px" },
            { x: "50% + 60px", y: "30px" },
            { x: "0px", y: "50% + 100px" },
        ]

        // last8cards
        this.last8CardsForStarterPosition = { x: "0px", y: "0px" }

        // replay
        // account for maximum of five suites, with 4 gaps, shift to left by 2 gaps
        this.replayControlButtonWidth = 60
        this.replayHandCardScale = 0.67
        this.handCardPositions = [
            { x: `50% - ${this.cardWidth / 2}px`, y: "0px" },
            { x: this.last8CardsForStarterPosition.x, y: `${this.showedCardsPositions[0].y}` },
            { x: this.last8CardsForStarterPosition.x, y: `${this.showedCardsPositions[2].y} + ${this.cardHeight * (1 - this.replayHandCardScale)}px` },
            { x: this.playerSkinPositions[3].x, y: `${this.showedCardsPositions[0].y}` },
        ]
        this.toolbarSize = 50
        this.toolbarPosition = { x: "10px", y: `${this.showedCardsPositions[0].y}` }
        this.btnPigPosition = { x: "20%", y: `${this.showedCardsPositions[0].y}` }

        // sidebar for room info and game state
        // this.iconSize = 20
        // this.sidebarOffset = 30
        // this.roomNameTextPosition = { x: 10, y: 10 }
        // this.roomOwnerTextPosition = { x: this.roomNameTextPosition.x, y: this.roomNameTextPosition.y + this.sidebarOffset }
        // this.sidebarMyTeamPostion = { x: this.roomNameTextPosition.x, y: this.roomNameTextPosition.y + this.sidebarOffset * 2 }
        // this.sidebarOpTeamPostion = { x: this.roomNameTextPosition.x, y: this.roomNameTextPosition.y + this.sidebarOffset * 3 }
        // this.sidebarTrumpMaker = { x: this.roomNameTextPosition.x, y: this.roomNameTextPosition.y + this.sidebarOffset * 4 }
        // this.sidebarScoreText = { x: this.roomNameTextPosition.x, y: this.roomNameTextPosition.y + this.sidebarOffset * 5 }
        // this.sidebarScoreCards = { x: this.roomNameTextPosition.x, y: this.roomNameTextPosition.y + this.sidebarOffset * 6 }

        // sidebar for replay
        this.replayBarPosition = { x: this.screenWid * 0.65, y: 10 }

        // ending UI
        this.last8Position = { x: this.playerSkinPositions[2].x, y: `${this.playerSkinPositions[2].y} + 140px` }
        this.scoreCardsPosition = { x: this.last8Position.x, y: `${this.last8Position.y} + ${this.cardHeight + 30}px` }
        this.winPointsPosition = { x: this.last8Position.x, y: `${this.scoreCardsPosition.y} + ${this.cardHeight + 30}px` }
        this.last8PointsPosition = { x: this.last8Position.x, y: `${this.winPointsPosition.y} + 30px` }
        this.punishmentPointsPosition = { x: this.last8Position.x, y: `${this.last8PointsPosition.y} + 30px` }
        this.totalPointsPosition = { x: this.last8Position.x, y: `${this.punishmentPointsPosition.y} + 30px` }

        // this.countDownPosition = { x: this.screenWid * 0.1, y: this.showedCardsPositions[0].y }
        this.countDownSzie = 60

        // distributing last 8
        this.distributingLast8MaxEdge = 30
        this.distributingLast8PositionOffset = this.handCardOffset / 4;
        this.distributingLast8Position = { x: `50% - ${(this.cardWidth / 2)}px - ${this.distributingLast8PositionOffset * 3.5}px`, y: `50% - ${this.cardHeight / 2}px` }
        this.discardLast8AniPosition = { x: `50% - ${(this.cardWidth / 2)}px - ${this.handCardOffset * 3.5}px`, y: `50% - ${this.cardHeight / 2}px` }
    }
}
