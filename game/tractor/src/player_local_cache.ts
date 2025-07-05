import { CommonMethods } from "./common_methods.js"

export class PlayerLocalCache {
    public ShowedCardsInCurrentTrick: {}
    public WinnerPosition: number
    public WinResult: number
    public WinnderID: string
    public isLastTrick: boolean
    constructor() {
        this.ShowedCardsInCurrentTrick = {}
        this.WinnerPosition = 0
        this.WinResult = 0
        this.WinnderID = ""
        this.isLastTrick = false
    }
    public CloneFrom(from: PlayerLocalCache) {
        this.ShowedCardsInCurrentTrick = CommonMethods.deepCopy<any>(from.ShowedCardsInCurrentTrick);
        this.WinnerPosition = from.WinnerPosition
        this.WinResult = from.WinResult
        this.WinnderID = from.WinnderID
        this.isLastTrick = from.isLastTrick
    }
}
