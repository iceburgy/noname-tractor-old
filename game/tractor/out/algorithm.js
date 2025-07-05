import { CommonMethods } from "./common_methods.js";
import { CurrentPoker } from "./current_poker.js";
import { PokerHelper } from "./poker_helper.js";
import { SuitEnums } from "./suit_enums.js";
export var Algorithm = /** @class */ (function () {
    function Algorithm() {
    }
    //跟出
    Algorithm.MustSelectedCards = function (selectedCards, currentTrickState, currentPoker) {
        var currentCards = new CurrentPoker();
        currentCards.CloneFrom(currentPoker);
        var leadingCardsCp = new CurrentPoker();
        leadingCardsCp.Trump = currentTrickState.Trump;
        leadingCardsCp.Rank = currentTrickState.Rank;
        currentTrickState.LeadingCards().forEach(function (card) {
            leadingCardsCp.AddCard(card);
        });
        var leadingSuit = currentTrickState.LeadingSuit();
        var isTrump = PokerHelper.IsTrump(currentTrickState.LeadingCards()[0], currentCards.Trump, currentCards.Rank);
        if (isTrump)
            leadingSuit = currentCards.Trump;
        selectedCards.length = 0;
        var allSuitCardsCp = new CurrentPoker();
        allSuitCardsCp.CloneFrom(currentPoker);
        var allSuitCards = allSuitCardsCp.Cards;
        var leadingTractors = leadingCardsCp.GetTractorBySuit(leadingSuit);
        var leadingPairs = leadingCardsCp.GetPairsBySuit(leadingSuit);
        //如果别人出拖拉机，我如果有，也应该出拖拉机
        var currentTractors = currentCards.GetTractorBySuit(leadingSuit);
        for (var i = 0; i < leadingTractors.length && i < currentTractors.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            selectedCards.push(currentTractors[i]);
            selectedCards.push(currentTractors[i]);
            allSuitCards[currentTractors[i]] -= 2;
            leadingPairs = CommonMethods.ArrayRemoveOneByValue(leadingPairs, currentTractors[i]);
        }
        //对子：先跳过常主
        var currentPairs = currentCards.GetPairsBySuit(leadingSuit);
        for (var i = 0; i < leadingPairs.length && i < currentPairs.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[currentPairs[i]] <= 0 || i % 13 == currentCards.Rank || i >= 52)
                continue;
            selectedCards.push(currentPairs[i]);
            selectedCards.push(currentPairs[i]);
            allSuitCards[currentPairs[i]] -= 2;
        }
        //对子
        for (var i = 0; i < leadingPairs.length && i < currentPairs.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[currentPairs[i]] <= 0)
                continue;
            selectedCards.push(currentPairs[i]);
            selectedCards.push(currentPairs[i]);
            allSuitCards[currentPairs[i]] -= 2;
        }
        //单张先跳过对子、常主
        var currentSuitCards = currentCards.GetSuitCardsWithJokerAndRank(leadingSuit);
        for (var i = 0; i < currentSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[currentSuitCards[i]] <= 0 || i % 13 == currentCards.Rank || i >= 52)
                continue;
            selectedCards.push(currentSuitCards[i]);
            allSuitCards[currentSuitCards[i]]--;
        }
        //单张先跳过对子
        for (var i = 0; i < currentSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[currentSuitCards[i]] <= 0)
                continue;
            selectedCards.push(currentSuitCards[i]);
            allSuitCards[currentSuitCards[i]]--;
        }
        //单张
        for (var i = 0; i < currentSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[currentSuitCards[i]] <= 0)
                continue;
            selectedCards.push(currentSuitCards[i]);
            allSuitCards[currentSuitCards[i]]--;
        }
        //其他花色的牌先跳过所有主牌，和副牌对子，即副牌单张
        for (var i = 0; i < allSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            var isITrump = PokerHelper.IsTrump(i, currentCards.Trump, currentCards.Rank);
            if (isITrump || allSuitCards[i] <= 0 || allSuitCards[i] == 2)
                continue;
            selectedCards.push(i);
            allSuitCards[i]--;
        }
        //其他花色的牌跳过所有主牌
        for (var i = 0; i < allSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            var isITrump = PokerHelper.IsTrump(i, currentCards.Trump, currentCards.Rank);
            if (isITrump || allSuitCards[i] <= 0)
                continue;
            while (allSuitCards[i] > 0 && selectedCards.length < leadingCardsCp.Count()) {
                selectedCards.push(i);
                allSuitCards[i]--;
            }
        }
        //被迫选主牌：先跳过对子，和常主
        for (var i = 0; i < allSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[i] <= 0 || allSuitCards[i] == 2 || i % 13 == currentCards.Rank || i >= 52)
                continue;
            selectedCards.push(i);
            allSuitCards[i]--;
        }
        //被迫选主牌跳过对子
        for (var i = 0; i < allSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (allSuitCards[i] <= 0 || allSuitCards[i] == 2)
                continue;
            selectedCards.push(i);
            allSuitCards[i]--;
        }
        //被迫选主牌对子：先跳过常主
        for (var i = 0; i < allSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            if (i % 13 == currentCards.Rank || i >= 52)
                continue;
            while (allSuitCards[i] > 0 && selectedCards.length < leadingCardsCp.Count()) {
                selectedCards.push(i);
                allSuitCards[i]--;
            }
        }
        //被迫选主牌对子
        for (var i = 0; i < allSuitCards.length && selectedCards.length < leadingCardsCp.Count(); i++) {
            while (allSuitCards[i] > 0 && selectedCards.length < leadingCardsCp.Count()) {
                selectedCards.push(i);
                allSuitCards[i]--;
            }
        }
    };
    //跟选：在有必选牌的情况下自动选择必选牌，方便玩家快捷出牌
    Algorithm.MustSelectedCardsNoShow = function (selectedCards, currentTrickState, currentPoker) {
        var currentCards = new CurrentPoker();
        currentCards.CloneFrom(currentPoker);
        var leadingCardsCp = new CurrentPoker();
        leadingCardsCp.Trump = currentTrickState.Trump;
        leadingCardsCp.Rank = currentTrickState.Rank;
        currentTrickState.LeadingCards().forEach(function (card) {
            leadingCardsCp.AddCard(card);
        });
        var leadingSuit = currentTrickState.LeadingSuit();
        var isTrump = PokerHelper.IsTrump(currentTrickState.LeadingCards()[0], currentCards.Trump, currentCards.Rank);
        if (isTrump)
            leadingSuit = currentCards.Trump;
        selectedCards.length = 0;
        var currentSuitCards = currentCards.GetSuitCardsWithJokerAndRank(leadingSuit);
        var leadingTractors = leadingCardsCp.GetTractorBySuit(leadingSuit);
        var leadingPairs = leadingCardsCp.GetPairsBySuit(leadingSuit);
        //如果别人出拖拉机，则选择我手中相同花色的拖拉机
        var currentTractors = currentCards.GetTractorBySuit(leadingSuit);
        if (currentTractors.length <= leadingTractors.length) {
            for (var i = 0; i < leadingTractors.length && i < currentTractors.length && selectedCards.length < leadingCardsCp.Count(); i++) {
                selectedCards.push(currentTractors[i]);
                selectedCards.push(currentTractors[i]);
                currentSuitCards = CommonMethods.ArrayRemoveOneByValue(currentSuitCards, currentTractors[i]);
                currentSuitCards = CommonMethods.ArrayRemoveOneByValue(currentSuitCards, currentTractors[i]);
                leadingPairs = CommonMethods.ArrayRemoveOneByValue(currentSuitCards, currentTractors[i]);
            }
        }
        //如果别人出对子，则选择我手中相同花色的对子
        var currentPairs = currentCards.GetPairsBySuit(leadingSuit);
        if (currentPairs.length <= leadingPairs.length) {
            for (var i = 0; i < leadingPairs.length && i < currentPairs.length && selectedCards.length < leadingCardsCp.Count(); i++) {
                if (selectedCards.includes(currentPairs[i]))
                    continue;
                selectedCards.push(currentPairs[i]);
                selectedCards.push(currentPairs[i]);
                currentSuitCards = CommonMethods.ArrayRemoveOneByValue(currentSuitCards, currentPairs[i]);
                currentSuitCards = CommonMethods.ArrayRemoveOneByValue(currentSuitCards, currentPairs[i]);
            }
        }
        //如果别人出单张，则选择我手中相同花色的单张
        if (currentSuitCards.length <= leadingCardsCp.Count() - selectedCards.length) {
            for (var i = 0; i < currentSuitCards.length; i++) {
                selectedCards.push(currentSuitCards[i]);
            }
        }
    };
    //先手
    Algorithm.ShouldSelectedCards = function (selectedCards, currentTrickState, currentPoker) {
        var currentCards = new CurrentPoker();
        currentCards.CloneFrom(currentPoker);
        var allSuitCardsCp = new CurrentPoker();
        allSuitCardsCp.CloneFrom(currentPoker);
        var allSuitCards = allSuitCardsCp.Cards;
        var maxValue = currentPoker.Rank == 12 ? 11 : 12;
        //先出A
        for (var _i = 0, _a = Object.entries(SuitEnums.Suit); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], st = _b[1];
            if (st == SuitEnums.Suit.None || st == SuitEnums.Suit.Joker || st == currentCards.Trump)
                continue;
            var maxCards = currentCards.GetMaxCards(st);
            if (maxCards % 13 == maxValue && allSuitCards[maxCards] == 1) {
                selectedCards.push(maxCards);
                return;
            }
            //dumping causing concurrency issue, TODO: use timer tick
            //if (maxCards % 13 == maxValue)
            //{
            //    while (maxCards % 13 > 0 && allSuitCards[maxCards] == 2 || maxCards == currentTrickState.Rank)
            //    {
            //    if(maxCards != currentTrickState.Rank){
            //        selectedCards.Add(maxCards);
            //        selectedCards.Add(maxCards);
            //    }
            //        maxCards--;
            //    }
            //    selectedCards.Add(maxCards);
            //    if (allSuitCards[maxCards] == 2) selectedCards.Add(maxCards);
            //    return;
            //}
        }
        //再出对子
        for (var _c = 0, _d = Object.entries(SuitEnums.Suit); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], st = _e[1];
            if (st == SuitEnums.Suit.None || st == SuitEnums.Suit.Joker || st == currentCards.Trump)
                continue;
            var currentTractors = currentCards.GetTractorBySuit(st);
            if (currentTractors.length > 1) {
                currentTractors.forEach(function (tr) {
                    selectedCards.push(tr);
                    selectedCards.push(tr);
                });
                return;
            }
            var currentPairs = currentCards.GetPairsBySuit(st);
            if (currentPairs.length > 0) {
                selectedCards.push(currentPairs[currentPairs.length - 1]);
                selectedCards.push(currentPairs[currentPairs.length - 1]);
                return;
            }
        }
        var masterTractors = currentCards.GetTractorBySuit(currentTrickState.Trump);
        if (masterTractors.length > 1) {
            masterTractors.forEach(function (tr) {
                selectedCards.push(tr);
                selectedCards.push(tr);
            });
            return;
        }
        var masterPair = currentCards.GetPairsBySuit(currentTrickState.Trump);
        if (masterPair.length > 0) {
            selectedCards.push(masterPair[masterPair.length - 1]);
            selectedCards.push(masterPair[masterPair.length - 1]);
            return;
        }
        var minMaster = currentCards.GetMinMasterCards(currentTrickState.Trump);
        if (minMaster >= 0) {
            selectedCards.push(minMaster);
            return;
        }
        //其他花色的牌
        for (var i = 0; i < allSuitCards.length; i++) {
            if (allSuitCards[i] > 0) {
                selectedCards.push(i);
                return;
            }
        }
    };
    //埋底
    Algorithm.ShouldSelectedLast8Cards = function (selectedCards, currentPoker) {
        var goodCards = [];
        var currentCards = new CurrentPoker();
        currentCards.CloneFrom(currentPoker);
        var badCardsCp = new CurrentPoker();
        badCardsCp.CloneFrom(currentPoker);
        var allSuitCardsCp = new CurrentPoker();
        allSuitCardsCp.CloneFrom(currentPoker);
        var allSuitCards = allSuitCardsCp.Cards;
        var maxValue = currentPoker.Rank == 12 ? 11 : 12;
        //副牌里，先挑出好牌来，最好不埋
        //挑出A及以下的牌
        for (var _i = 0, _a = Object.entries(SuitEnums.Suit); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], st = _b[1];
            if (st == SuitEnums.Suit.None || st == SuitEnums.Suit.Joker || st == currentCards.Trump)
                continue;
            var maxCards = currentCards.GetMaxCards(st);
            if (maxCards % 13 == maxValue) {
                while (maxCards % 13 > 0 && allSuitCards[maxCards] == 2 || maxCards == currentCards.Rank) //保证打几的牌没有对子，也不会打断继续往下找大牌对子
                 {
                    if (maxCards != currentCards.Rank) {
                        goodCards.push(maxCards);
                        goodCards.push(maxCards);
                        badCardsCp.RemoveCard(maxCards);
                        badCardsCp.RemoveCard(maxCards);
                    }
                    maxCards--;
                }
                goodCards.push(maxCards);
                badCardsCp.RemoveCard(maxCards);
                if (allSuitCards[maxCards] == 2) {
                    goodCards.push(maxCards);
                    badCardsCp.RemoveCard(maxCards);
                }
            }
        }
        //再挑出对子
        for (var _c = 0, _d = Object.entries(SuitEnums.Suit); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], st = _e[1];
            if (st == SuitEnums.Suit.None || st == SuitEnums.Suit.Joker || st == currentCards.Trump)
                continue;
            var currentPairs = currentCards.GetPairsBySuit(st);
            currentPairs.forEach(function (pair) {
                goodCards.push(pair);
                goodCards.push(pair);
                badCardsCp.RemoveCard(pair);
                badCardsCp.RemoveCard(pair);
            });
        }
        //将剩余的差牌按花色排序，少的靠前
        var badCardsBySuit = [];
        for (var _f = 0, _g = Object.entries(SuitEnums.Suit); _f < _g.length; _f++) {
            var _h = _g[_f], key = _h[0], st = _h[1];
            if (st == SuitEnums.Suit.None || st == SuitEnums.Suit.Joker || st == currentCards.Trump)
                continue;
            badCardsBySuit.push(badCardsCp.GetSuitCardsWithJokerAndRank(st));
        }
        badCardsBySuit.sort(function (a, b) { return (a.length - b.length); });
        var masterCards = badCardsCp.GetSuitCardsWithJokerAndRank(currentCards.Trump);
        badCardsBySuit.push(masterCards);
        //从差到好选出8张牌
        for (var i = 0; i < badCardsBySuit.length; i++) {
            var badCards = badCardsBySuit[i];
            for (var j = 0; j < badCards.length; j++) {
                selectedCards.push(badCards[j]);
                if (selectedCards.length == 8)
                    return;
            }
        }
        for (var i = 0; i < goodCards.length; i++) {
            selectedCards.push(goodCards[i]);
            if (selectedCards.length == 8)
                return;
        }
        //如果副牌总共不到8张，那就埋主
        while (selectedCards.length < 8) {
            var minMaster = currentCards.GetMinMasterCards(currentCards.Trump);
            if (minMaster >= 0) {
                selectedCards.push(minMaster);
            }
        }
    };
    Algorithm.TryExposingTrump = function (availableTrump, qiangliangMin, isFirstHand, currentPoker, fullDebug) {
        var nonJokerMaxCount = 0;
        var nonJoker = SuitEnums.Suit.None;
        var mayJoker = SuitEnums.Suit.None;
        var currentCards = new CurrentPoker();
        currentCards.CloneFrom(currentPoker);
        for (var i = 0; i < availableTrump.length; i++) {
            var st = availableTrump[i];
            switch (st) {
                case SuitEnums.Suit.Heart:
                    var heartCount = currentCards.HeartsNoRankTotal();
                    if (isFirstHand || heartCount >= qiangliangMin && heartCount > nonJokerMaxCount) {
                        nonJokerMaxCount = heartCount;
                        nonJoker = st;
                    }
                    break;
                case SuitEnums.Suit.Spade:
                    var spadeCount = currentCards.SpadesNoRankTotal();
                    if (isFirstHand || spadeCount >= qiangliangMin && spadeCount > nonJokerMaxCount) {
                        nonJokerMaxCount = spadeCount;
                        nonJoker = st;
                    }
                    break;
                case SuitEnums.Suit.Diamond:
                    var diamondCount = currentCards.DiamondsNoRankTotal();
                    if (isFirstHand || diamondCount >= qiangliangMin && diamondCount > nonJokerMaxCount) {
                        nonJokerMaxCount = diamondCount;
                        nonJoker = st;
                    }
                    break;
                case SuitEnums.Suit.Club:
                    var clubCount = currentCards.ClubsNoRankTotal();
                    if (isFirstHand || clubCount >= qiangliangMin && clubCount > nonJokerMaxCount) {
                        nonJokerMaxCount = clubCount;
                        nonJoker = st;
                    }
                    break;
                case SuitEnums.Suit.Joker:
                    var jokerAndRankCount = currentCards.GetSuitCardsWithJokerAndRank(SuitEnums.Suit.Joker).length;
                    if (fullDebug && jokerAndRankCount >= Algorithm.exposeTrumpJokerThreshold)
                        mayJoker = SuitEnums.Suit.Joker;
                    break;
                default:
                    break;
            }
        }
        if (isFirstHand || nonJokerMaxCount > 0)
            return nonJoker;
        else
            return mayJoker;
    };
    // 暂时取消自动亮无主
    Algorithm.exposeTrumpJokerThreshold = 999;
    return Algorithm;
}());
