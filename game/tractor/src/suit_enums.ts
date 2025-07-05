
export class SuitEnums {
    static readonly Suit = {
        None: 0,
        Heart: 1,
        Spade: 2,
        Diamond: 3,
        Club: 4,
        Joker: 5,
    }
    static readonly NumberToSuit = [
        "None",
        "Heart",
        "Spade",
        "Diamond",
        "Club",
        "Joker",
    ]

    static readonly TrumpExposingPoker = {
        None: 0,
        SingleRank: 1,
        PairRank: 2,
        PairBlackJoker: 3,
        PairRedJoker: 4,
    }

    static readonly HandStep = {
        BeforeDistributingCards: 0,
        DistributingCards: 1,
        DistributingCardsFinished: 2,
        DistributingLast8Cards: 3,
        DistributingLast8CardsFinished: 4,
        DiscardingLast8Cards: 5,
        DiscardingLast8CardsFinished: 6,
        Last8CardsRobbed: 7,
        Playing: 8,
        SpecialEnding: 9,
        Ending: 10,
    }

    static readonly SpecialEndingType = [
        "Surrender",
        "RiotByScore",
        "RiotByTrump",
    ]

    constructor() {
    }
}
