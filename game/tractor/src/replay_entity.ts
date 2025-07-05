import { CommonMethods } from "./common_methods.js"
import { CurrentHandState } from "./current_hand_state.js"
import { CurrentTrickState } from "./current_trick_state.js"

export class ReplayEntity {
    public ReplayId: string
    public CurrentHandState: CurrentHandState
    public CurrentTrickStates: CurrentTrickState[]
    public Players: string[]
    public PlayerRanks: number[]
    constructor() {
        this.ReplayId = ""
        this.CurrentHandState = new CurrentHandState()
        this.CurrentTrickStates = []
        this.Players = []
        this.PlayerRanks = []
    }
    public CloneFrom(from: ReplayEntity) {
        this.ReplayId = from.ReplayId

        this.CurrentHandState = new CurrentHandState()
        this.CurrentHandState.CloneFrom(from.CurrentHandState)

        this.CurrentTrickStates = []
        for (let i = 0; i < from.CurrentTrickStates.length; i++) {
            this.CurrentTrickStates[i] = new CurrentTrickState()
            this.CurrentTrickStates[i].CloneFrom(from.CurrentTrickStates[i])
        }

        this.Players = CommonMethods.deepCopy<string[]>(from.Players)
        this.PlayerRanks = CommonMethods.deepCopy<number[]>(from.PlayerRanks)
    }
}
