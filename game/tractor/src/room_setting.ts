import { CommonMethods } from "./common_methods.js"

export class RoomSetting {
    public RoomName: string
    public RoomOwner: string
    public ManditoryRanks: number[]
    public AllowRiotWithTooFewScoreCards: number
    public AllowRiotWithTooFewTrumpCards: number
    public AllowJToBottom: boolean
    public AllowSurrender: boolean
    public AllowRobotMakeTrump: boolean
    public IsFullDebug: boolean
    public secondsToWaitForReenter: number
    public secondsToShowCards: number
    public secondsToDiscardCards: number
    public DisplaySignalCardInfo: boolean
    public HideOverridingFlag: boolean
    public RandomTeamUp: boolean

    constructor() {
        this.RoomName = ""
        this.RoomOwner = ""
        this.ManditoryRanks = []
        this.AllowRiotWithTooFewScoreCards = -1
        this.AllowRiotWithTooFewTrumpCards = -1
        this.AllowJToBottom = false
        this.AllowSurrender = false
        this.AllowRobotMakeTrump = false
        this.IsFullDebug = false
        this.secondsToWaitForReenter = 60
        this.secondsToShowCards = 0
        this.secondsToDiscardCards = 0
        this.DisplaySignalCardInfo = false
        this.HideOverridingFlag = false
        this.RandomTeamUp = false
    }
    public CloneFrom(from: RoomSetting) {
        this.RoomName = from.RoomName
        this.RoomOwner = from.RoomOwner
        this.ManditoryRanks = CommonMethods.deepCopy<number[]>(from.ManditoryRanks);
        this.AllowRiotWithTooFewScoreCards = from.AllowRiotWithTooFewScoreCards
        this.AllowRiotWithTooFewTrumpCards = from.AllowRiotWithTooFewTrumpCards
        this.AllowJToBottom = from.AllowJToBottom
        this.AllowSurrender = from.AllowSurrender
        this.AllowRobotMakeTrump = from.AllowRobotMakeTrump
        this.IsFullDebug = from.IsFullDebug
        this.secondsToWaitForReenter = from.secondsToWaitForReenter
        this.secondsToShowCards = from.secondsToShowCards
        this.secondsToDiscardCards = from.secondsToDiscardCards
        this.DisplaySignalCardInfo = from.DisplaySignalCardInfo
        this.HideOverridingFlag = from.HideOverridingFlag
        this.RandomTeamUp = from.RandomTeamUp
    }
}
