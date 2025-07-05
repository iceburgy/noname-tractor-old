
import { SuitEnums } from './suit_enums.js';
export class PokerHelper {
    constructor() {
    }

    public static GetSuit(cardNumber: number): number {
        if (cardNumber >= 0 && cardNumber < 13) {
            return SuitEnums.Suit.Heart;
        }
        if (cardNumber >= 13 && cardNumber < 26) {
            return SuitEnums.Suit.Spade;
        }
        if (cardNumber >= 26 && cardNumber < 39) {
            return SuitEnums.Suit.Diamond;
        }

        if (cardNumber >= 39 && cardNumber < 52) {
            return SuitEnums.Suit.Club;
        }

        return SuitEnums.Suit.Joker;
    }

    public static IsTrump(cardNumber: number, trump: number, rank: number): boolean {
        let result: boolean

        if (cardNumber == 53 || cardNumber == 52) {
            result = true;
        }
        else if ((cardNumber % 13) == rank) {
            result = true;
        }
        else {
            let suit = PokerHelper.GetSuit(cardNumber);
            if (suit == trump)
                result = true;
            else
                result = false;
        }

        return result;
    }
}
