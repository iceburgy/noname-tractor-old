import { CommonMethods } from "./common_methods.js"

export class ServerLocalCache {
    public lastShowedCards: {}
    public lastLeader: string
    public muteSound: boolean
    constructor() {
        this.lastShowedCards = {}
        this.lastLeader = ""
        this.muteSound = false
    }
    public CloneFrom(from: ServerLocalCache) {
        this.lastShowedCards = CommonMethods.deepCopy<any>(from.lastShowedCards)
        this.lastLeader = from.lastLeader
        this.muteSound = from.muteSound
    }
}
