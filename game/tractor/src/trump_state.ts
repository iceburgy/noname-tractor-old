
export class TrumpState {
    public Trump: number
    public TrumpExposingPoker: number
    public TrumpMaker: string
    public IsNoTrumpMaker: boolean
    constructor() {
        this.Trump = 0
        this.TrumpExposingPoker = 0
        this.TrumpMaker = ""
        this.IsNoTrumpMaker = false
    }
    public CloneFrom(from: TrumpState) {
        this.Trump = from.Trump
        this.TrumpExposingPoker = from.TrumpExposingPoker
        this.TrumpMaker = from.TrumpMaker
        this.IsNoTrumpMaker = from.IsNoTrumpMaker
    }
}
