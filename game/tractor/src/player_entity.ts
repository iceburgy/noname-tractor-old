import { CommonMethods } from "./common_methods.js"

export class PlayerEntity {
    static readonly GameTeam = [
        "None",
        "VerticalTeam",
        "HorizonTeam",
    ]

    public OfflineSince: string
    public PlayerId: string
    public PlayingSG: string
    public Rank: number
    public Team: number
    public IsReadyToStart: boolean
    public IsRobot: boolean
    public IsQiangliang: boolean
    public IsOffline: boolean
    public Observers: string[]
    constructor() {
        this.OfflineSince = ""
        this.PlayerId = ""
        this.PlayingSG = ""
        this.Rank = 0
        this.Team = 0
        this.IsReadyToStart = false
        this.IsRobot = false
        this.IsQiangliang = false
        this.IsOffline = false
        this.Observers = []
    }
    public CloneFrom(from: PlayerEntity) {
        this.OfflineSince = from.OfflineSince
        this.PlayerId = from.PlayerId
        this.PlayingSG = from.PlayingSG
        this.Rank = from.Rank
        this.Team = from.Team
        this.IsReadyToStart = from.IsReadyToStart
        this.IsRobot = from.IsRobot
        this.IsQiangliang = from.IsQiangliang
        this.IsOffline = from.IsOffline
        this.Observers = CommonMethods.deepCopy<string[]>(from.Observers)
    }
}
