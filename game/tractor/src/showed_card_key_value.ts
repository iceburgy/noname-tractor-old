import { CommonMethods } from './common_methods.js';
export class ShowedCardKeyValue {
    public PlayerID: string
    public Cards: number[]
    constructor() {
        this.PlayerID = ""
        this.Cards = []
    }
    public CloneFrom(from: ShowedCardKeyValue) {
        this.PlayerID = from.PlayerID
        this.Cards = CommonMethods.deepCopy<number[]>(from.Cards)
    }
}
