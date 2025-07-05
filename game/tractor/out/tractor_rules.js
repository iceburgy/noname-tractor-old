import { CommonMethods } from "./common_methods.js";
import { CurrentPoker } from "./current_poker.js";
import { PokerHelper } from "./poker_helper.js";
import { ShowingCardsValidationResult } from "./showing_cards_validation_result.js";
var TractorRules = /** @class */ (function () {
    function TractorRules() {
    }
    TractorRules.GetCardNumberofEachPlayer = function (playerCount) {
        if (playerCount == 4)
            return 25;
        if (playerCount == 5)
            return 20;
        return 25;
    };
    TractorRules.IsValid = function (currentTrickState, selectedCards, currentCards) {
        var res = new ShowingCardsValidationResult();
        //玩家选择牌之后剩下的牌
        var leftCardsCp = new CurrentPoker();
        leftCardsCp.CloneFrom(currentCards);
        selectedCards.forEach(function (card) {
            leftCardsCp.RemoveCard(card);
        });
        var showingCardsCp = new CurrentPoker();
        showingCardsCp.Trump = currentCards.Trump;
        showingCardsCp.Rank = currentCards.Rank;
        selectedCards.forEach(function (showingCard) {
            showingCardsCp.AddCard(showingCard);
        });
        var leadingCardsCp = new CurrentPoker();
        leadingCardsCp.Trump = currentCards.Trump;
        leadingCardsCp.Rank = currentCards.Rank;
        currentTrickState.LeadingCards().forEach(function (card) {
            leadingCardsCp.AddCard(card);
        });
        //the first player to show cards
        if (!currentTrickState.IsStarted()) {
            if (showingCardsCp.Count() > 0 && !showingCardsCp.IsMixed()) {
                if (selectedCards.length == 1) //如果是单张牌
                 {
                    res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
                    return res;
                }
                if (selectedCards.length == 2 && (showingCardsCp.GetPairs().length == 1)) //如果是一对
                 {
                    res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
                    return res;
                }
                if ((showingCardsCp.GetTractorOfAnySuit().length > 1) &&
                    selectedCards.length == showingCardsCp.GetTractorOfAnySuit().length * 2) //如果是拖拉机
                 {
                    res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
                    return res;
                }
                res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.TryToDump;
                return res;
            }
        }
        //牌的数量
        if (currentTrickState.LeadingCards().length != selectedCards.length) {
            res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Invalid;
            return res;
        }
        //得到第一个家伙出的花色
        var leadingSuit = currentTrickState.LeadingSuit();
        var isTrump = PokerHelper.IsTrump(currentTrickState.LeadingCards()[0], currentCards.Trump, currentCards.Rank);
        if (isTrump)
            leadingSuit = currentCards.Trump;
        //如果出的牌混合的，则判断手中是否还剩出的花色，如果剩,false;如果不剩;true
        if (showingCardsCp.IsMixed()) {
            if (leftCardsCp.HasSomeCards(leadingSuit)) {
                res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Invalid;
                return res;
            }
            res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
            return res;
        }
        //出的牌的花色
        var mysuit = PokerHelper.GetSuit(selectedCards[0]);
        isTrump = PokerHelper.IsTrump(selectedCards[0], currentCards.Trump, currentCards.Rank);
        if (isTrump)
            mysuit = currentCards.Trump;
        //花色是否一致
        if (mysuit != leadingSuit) {
            //而且确实没有此花色
            if (leftCardsCp.HasSomeCards(leadingSuit)) {
                res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Invalid;
                return res;
            }
            res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
            return res;
        }
        //别人如果出对，我也应该出对
        var leadingCardsPairs = leadingCardsCp.GetPairs().length;
        var selectedCardsPairs = showingCardsCp.GetPairs().length;
        var holdingCardsPairs = currentCards.GetPairsBySuit(leadingSuit).length;
        //2.如果别人出拖拉机，我如果有，也应该出拖拉机
        if (leadingCardsCp.HasTractors()) {
            if ((!showingCardsCp.HasTractors()) && (currentCards.GetTractorBySuitInt(leadingSuit) > -1)) {
                res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Invalid;
                return res;
            }
            if ((selectedCardsPairs < leadingCardsPairs) && (holdingCardsPairs > selectedCardsPairs)) 
            //出的对比第一个玩家少，而且没有出所有的对
            {
                res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Invalid;
                return res;
            }
            res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
            return res;
        }
        if (leadingCardsPairs > 0) {
            //如果对出的不够多，而且没有出所有的对
            if ((holdingCardsPairs > selectedCardsPairs) && (selectedCardsPairs < leadingCardsPairs)) {
                res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Invalid;
                return res;
            }
            res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
            return res;
        }
        res.ResultType = ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid;
        return res;
    };
    //确定谁的牌最大，支持部分玩家出了牌
    TractorRules.GetWinner = function (trickState) {
        var cp = new Array(4);
        var trump = trickState.Trump;
        var trumpInt = trickState.Trump;
        var rank = trickState.Rank;
        cp[0] = new CurrentPoker(trickState.ShowedCards[trickState.Learder], trumpInt, rank);
        var nextPlayer1 = trickState.NextPlayerByID(trickState.Learder);
        cp[1] = new CurrentPoker(trickState.ShowedCards[nextPlayer1], trumpInt, rank);
        var nextPlayer2 = trickState.NextPlayerByID(nextPlayer1);
        cp[2] = new CurrentPoker(trickState.ShowedCards[nextPlayer2], trumpInt, rank);
        var nextPlayer3 = trickState.NextPlayerByID(nextPlayer2);
        cp[3] = new CurrentPoker(trickState.ShowedCards[nextPlayer3], trumpInt, rank);
        //cp[0].Sort();
        //cp[1].Sort();
        //cp[2].Sort();
        //cp[3].Sort();
        var leadingCardsCount = trickState.ShowedCards[trickState.Learder].length;
        var winderNumber = 0;
        var leadingSuit = trickState.LeadingSuit();
        var leadingTractor = cp[0].GetTractorOfAnySuit();
        //甩牌 拖拉机
        if ((leadingTractor.length > 1) && (cp[0].Count() > leadingTractor.length * 2)) //甩拖拉机
         {
            var maxCard_1 = CommonMethods.GetMaxCard(leadingTractor, trump, rank);
            if (trickState.ShowedCards[nextPlayer1].length > 0) {
                var tractor1 = cp[1].GetTractorBySuit(trump);
                if (tractor1.length >= leadingTractor.length &&
                    (!cp[1].IsMixed() && cp[1].GetPairs().length >= cp[0].GetPairs().length)) {
                    var tmpMax_1 = CommonMethods.GetMaxCard(tractor1, trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_1, tmpMax_1, trumpInt, rank, leadingSuit)) {
                        winderNumber = 1;
                        maxCard_1 = tmpMax_1;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer2].length > 0) {
                var tractor2 = cp[2].GetTractorBySuit(trump);
                if (tractor2.length >= leadingTractor.length &&
                    (!cp[2].IsMixed() && cp[2].GetPairs().length >= cp[0].GetPairs().length)) {
                    var tmpMax_2 = CommonMethods.GetMaxCard(tractor2, trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_1, tmpMax_2, trumpInt, rank, leadingSuit)) {
                        winderNumber = 2;
                        maxCard_1 = tmpMax_2;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer3].length > 0) {
                var tractor3 = cp[3].GetTractorBySuit(trump);
                if (tractor3.length >= leadingTractor.length &&
                    (!cp[3].IsMixed() && cp[3].GetPairs().length >= cp[0].GetPairs().length)) {
                    var tmpMax_3 = CommonMethods.GetMaxCard(tractor3, trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_1, tmpMax_3, trumpInt, rank, leadingSuit)) {
                        winderNumber = 3;
                    }
                }
            }
        }
        //甩牌 对
        else if ((2 < leadingCardsCount) && (cp[0].GetPairs().length > 0) && leadingTractor.length < 2) {
            var maxCard_2 = CommonMethods.GetMaxCard(cp[0].GetPairs(), trump, rank);
            if (trickState.ShowedCards[nextPlayer1].length > 0) {
                if (cp[1].GetPairs().length >= cp[0].GetPairs().length && (!cp[1].IsMixed())) {
                    var tmpMax_4 = CommonMethods.GetMaxCard(cp[1].GetPairs(), trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_2, tmpMax_4, trumpInt, rank, leadingSuit)) {
                        winderNumber = 1;
                        maxCard_2 = tmpMax_4;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer2].length > 0) {
                if (cp[2].GetPairs().length >= cp[0].GetPairs().length && (!cp[2].IsMixed())) {
                    var tmpMax_5 = CommonMethods.GetMaxCard(cp[2].GetPairs(), trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_2, tmpMax_5, trumpInt, rank, leadingSuit)) {
                        winderNumber = 2;
                        maxCard_2 = tmpMax_5;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer3].length > 0) {
                if (cp[3].GetPairs().length >= cp[0].GetPairs().length && (!cp[3].IsMixed())) {
                    var tmpMax_6 = CommonMethods.GetMaxCard(cp[3].GetPairs(), trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_2, tmpMax_6, trumpInt, rank, leadingSuit)) {
                        winderNumber = 3;
                    }
                }
            }
        }
        //甩多个单张牌
        else if ((leadingCardsCount > 1) && (cp[0].GetPairs().length == 0)) {
            var maxCard_3 = CommonMethods.GetMaxCard(trickState.ShowedCards[trickState.Learder], trump, rank);
            var tmpMax_7 = 0;
            if (trickState.ShowedCards[nextPlayer1].length > 0) {
                tmpMax_7 = CommonMethods.GetMaxCard(trickState.ShowedCards[nextPlayer1], trump, rank);
                if (cp[1].GetSuitCardsWithJokerAndRank(trumpInt).length ==
                    trickState.ShowedCards[trickState.Learder].length) {
                    if (!CommonMethods.CompareTo(maxCard_3, tmpMax_7, trumpInt, rank, leadingSuit)) {
                        winderNumber = 1;
                        maxCard_3 = tmpMax_7;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer2].length > 0) {
                if (cp[2].GetSuitCardsWithJokerAndRank(trumpInt).length ==
                    trickState.ShowedCards[trickState.Learder].length) {
                    tmpMax_7 = CommonMethods.GetMaxCard(trickState.ShowedCards[nextPlayer2], trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_3, tmpMax_7, trumpInt, rank, leadingSuit)) {
                        winderNumber = 2;
                        maxCard_3 = tmpMax_7;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer3].length > 0) {
                if (cp[3].GetSuitCardsWithJokerAndRank(trumpInt).length ==
                    trickState.ShowedCards[trickState.Learder].length) {
                    tmpMax_7 = CommonMethods.GetMaxCard(trickState.ShowedCards[nextPlayer3], trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_3, tmpMax_7, trumpInt, rank, leadingSuit)) {
                        winderNumber = 3;
                    }
                }
            }
        }
        //拖拉机
        else if (leadingTractor.length > 1) {
            //如果有拖拉机
            var tractor0 = cp[0].GetTractorOfAnySuit();
            var tractor1 = [];
            var tractor2 = [];
            var tractor3 = [];
            if (trickState.ShowedCards[nextPlayer1].length > 0)
                tractor1 = cp[1].GetTractorOfAnySuit();
            if (trickState.ShowedCards[nextPlayer2].length > 0)
                tractor2 = cp[2].GetTractorOfAnySuit();
            if (trickState.ShowedCards[nextPlayer3].length > 0)
                tractor3 = cp[3].GetTractorOfAnySuit();
            var maxCard_4 = CommonMethods.GetMaxCard(tractor0, trump, rank);
            if (trickState.ShowedCards[nextPlayer1].length > 0) {
                if (tractor1.length >= tractor0.length) {
                    var tmpMax_8 = CommonMethods.GetMaxCard(tractor1, trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_4, tmpMax_8, trumpInt, rank, leadingSuit)) {
                        winderNumber = 1;
                        maxCard_4 = tmpMax_8;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer2].length > 0) {
                if (tractor2.length >= tractor0.length) {
                    var tmpMax_9 = CommonMethods.GetMaxCard(tractor2, trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_4, tmpMax_9, trumpInt, rank, leadingSuit)) {
                        winderNumber = 2;
                        maxCard_4 = tmpMax_9;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer3].length > 0) {
                if (tractor3.length >= tractor0.length) {
                    var tmpMax_10 = CommonMethods.GetMaxCard(tractor3, trump, rank);
                    if (!CommonMethods.CompareTo(maxCard_4, tmpMax_10, trumpInt, rank, leadingSuit)) {
                        winderNumber = 3;
                    }
                }
            }
        }
        else if (cp[0].GetPairs().length == 1 && (leadingCardsCount == 2)) //如果有一个对
         {
            var maxCard = cp[0].GetPairs()[0];
            if (trickState.ShowedCards[nextPlayer1].length > 0) {
                if (cp[1].GetPairs().length > 0) {
                    var tmpMax = cp[1].GetPairs()[0];
                    if (!CommonMethods.CompareTo(maxCard, tmpMax, trumpInt, rank, leadingSuit)) {
                        winderNumber = 1;
                        maxCard = tmpMax;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer2].length > 0) {
                if (cp[2].GetPairs().length > 0) {
                    var tmpMax = cp[2].GetPairs()[0];
                    if (!CommonMethods.CompareTo(maxCard, tmpMax, trumpInt, rank, leadingSuit)) {
                        winderNumber = 2;
                        maxCard = tmpMax;
                    }
                }
            }
            if (trickState.ShowedCards[nextPlayer3].length > 0) {
                if (cp[3].GetPairs().length > 0) {
                    var tmpMax = cp[3].GetPairs()[0];
                    if (!CommonMethods.CompareTo(maxCard, tmpMax, trumpInt, rank, leadingSuit)) {
                        winderNumber = 3;
                    }
                }
            }
        }
        else if (leadingCardsCount == 1) //如果是单张牌
         {
            var maxCard_5 = trickState.ShowedCards[trickState.Learder][0];
            var tmpMax_11 = 0;
            if (trickState.ShowedCards[nextPlayer1].length > 0) {
                tmpMax_11 = trickState.ShowedCards[nextPlayer1][0];
                if (!CommonMethods.CompareTo(maxCard_5, tmpMax_11, trumpInt, rank, leadingSuit)) {
                    winderNumber = 1;
                    maxCard_5 = tmpMax_11;
                }
            }
            if (trickState.ShowedCards[nextPlayer2].length > 0) {
                tmpMax_11 = trickState.ShowedCards[nextPlayer2][0];
                if (!CommonMethods.CompareTo(maxCard_5, tmpMax_11, trumpInt, rank, leadingSuit)) {
                    winderNumber = 2;
                    maxCard_5 = tmpMax_11;
                }
            }
            if (trickState.ShowedCards[nextPlayer3].length > 0) {
                tmpMax_11 = trickState.ShowedCards[nextPlayer3][0];
                if (!CommonMethods.CompareTo(maxCard_5, tmpMax_11, trumpInt, rank, leadingSuit)) {
                    winderNumber = 3;
                }
            }
        }
        var winner = "";
        switch (winderNumber) {
            case 0:
                winner = trickState.Learder;
                break;
            case 1:
                winner = nextPlayer1;
                break;
            case 2:
                winner = nextPlayer2;
                break;
            case 3:
                winner = nextPlayer3;
                break;
        }
        return winner;
    };
    return TractorRules;
}());
export { TractorRules };
