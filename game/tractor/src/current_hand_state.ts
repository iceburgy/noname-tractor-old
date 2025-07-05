
import { TrumpState } from './trump_state.js';
import { GameState } from './game_state.js';
import { CurrentPoker } from './current_poker.js';
import { CommonMethods } from './common_methods.js';
export class CurrentHandState {
    public Id: string
    public PlayerHoldingCards: any
    public LastTrumpStates: TrumpState[]
    public ScoreCards: number[]
    public Starter: string
    public Last8Holder: string
    public Rank: number
    public Trump: number
    public TrumpExposingPoker: number
    public TrumpMaker: string
    public IsNoTrumpMaker: boolean
    public CurrentHandStep: number
    public IsFirstHand: boolean
    public DiscardedCards: number[]
    public Score: number
    public ScoreLast8CardsBase: number
    public ScoreLast8CardsMultiplier: number
    public ScorePunishment: number
    public LeftCardsCount: number
    constructor(gameState?: GameState) {
        if (gameState != null) {
            this.PlayerHoldingCards = {}
            gameState.Players.forEach(p => {
                if (p != null) {
                    (this.PlayerHoldingCards as any)[p.PlayerId] = new CurrentPoker()
                }
            })
        }
        this.LeftCardsCount = 25

        this.Id = ""
        this.PlayerHoldingCards = {}
        this.LastTrumpStates = []
        this.ScoreCards = []
        this.Starter = ""
        this.Last8Holder = ""
        this.Rank = 0
        this.Trump = 0
        this.TrumpExposingPoker = 0
        this.TrumpMaker = ""
        this.IsNoTrumpMaker = false
        this.CurrentHandStep = 0
        this.IsFirstHand = false
        this.DiscardedCards = []
        this.Score = 0
        this.ScoreLast8CardsBase = 0
        this.ScoreLast8CardsMultiplier = 0
        this.ScorePunishment = 0
    }
    public CloneFrom(from: CurrentHandState) {
        this.Id = from.Id
        this.PlayerHoldingCards = CommonMethods.deepCopy<any>(from.PlayerHoldingCards)
        this.LastTrumpStates = []
        from.LastTrumpStates.forEach(fromtemp => {
            let temp = new TrumpState()
            temp.CloneFrom(fromtemp)
            this.LastTrumpStates.push(temp)
        })
        this.ScoreCards = from.ScoreCards
        this.Starter = from.Starter
        this.Last8Holder = from.Last8Holder
        this.Rank = from.Rank
        this.Trump = from.Trump
        this.TrumpExposingPoker = from.TrumpExposingPoker
        this.TrumpMaker = from.TrumpMaker
        this.IsNoTrumpMaker = from.IsNoTrumpMaker
        this.CurrentHandStep = from.CurrentHandStep
        this.IsFirstHand = from.IsFirstHand
        this.DiscardedCards = CommonMethods.deepCopy<number[]>(from.DiscardedCards)
        this.Score = from.Score
        this.ScoreLast8CardsBase = from.ScoreLast8CardsBase
        this.ScoreLast8CardsMultiplier = from.ScoreLast8CardsMultiplier
        this.ScorePunishment = from.ScorePunishment
        this.LeftCardsCount = from.LeftCardsCount
    }
}
