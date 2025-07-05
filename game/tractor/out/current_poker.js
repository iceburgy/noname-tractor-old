import { CommonMethods } from "./common_methods.js";
import { SuitEnums } from "./suit_enums.js";
var CurrentPoker = /** @class */ (function () {
    function CurrentPoker(cards, suit, rank) {
        var _this = this;
        this.Cards = [];
        for (var i = 0; i < 54; i++) {
            this.Cards[i] = 0;
        }
        this.Rank = rank !== undefined ? rank : 0;
        this.Trump = suit !== undefined ? suit : 0;
        if (cards !== undefined) {
            var temp = cards;
            temp.forEach(function (c) {
                _this.AddCard(c);
            });
        }
    }
    CurrentPoker.prototype.CloneFrom = function (cp) {
        this.Rank = cp.Rank;
        this.Trump = cp.Trump;
        this.Cards = CommonMethods.deepCopy(cp.Cards);
    };
    //增加一张牌
    CurrentPoker.prototype.AddCard = function (cn) {
        if (cn < 0 || cn > 53)
            return;
        this.Cards[cn] = this.Cards[cn] + 1;
    };
    //减少一张牌
    CurrentPoker.prototype.RemoveCard = function (number) {
        if (number < 0 || number > 53)
            return;
        if (this.Cards[number] > 0) {
            this.Cards[number] = this.Cards[number] - 1;
        }
    };
    CurrentPoker.prototype.Count = function () {
        return CommonMethods.ArraySum(this.Cards);
    };
    // 红桃
    CurrentPoker.prototype.Hearts = function () {
        var temp = CommonMethods.ArrayCopy(this.Cards, 0, 13);
        return temp;
    };
    CurrentPoker.prototype.HeartsNoRank = function () {
        var temp = this.Hearts();
        temp[this.Rank] = 0;
        return temp;
    };
    CurrentPoker.prototype.HeartsNoRankTotal = function () {
        return CommonMethods.ArraySum(this.HeartsNoRank());
    };
    CurrentPoker.prototype.HeartsRankTotal = function () {
        return this.Hearts()[this.Rank];
    };
    // 黑桃
    CurrentPoker.prototype.Spades = function () {
        var temp = CommonMethods.ArrayCopy(this.Cards, 13, 13);
        return temp;
    };
    CurrentPoker.prototype.SpadesNoRank = function () {
        var temp = this.Spades();
        temp[this.Rank] = 0;
        return temp;
    };
    CurrentPoker.prototype.SpadesNoRankTotal = function () {
        return CommonMethods.ArraySum(this.SpadesNoRank());
    };
    CurrentPoker.prototype.SpadesRankTotal = function () {
        return this.Spades()[this.Rank];
    };
    // 方块
    CurrentPoker.prototype.Diamonds = function () {
        var temp = CommonMethods.ArrayCopy(this.Cards, 26, 13);
        return temp;
    };
    CurrentPoker.prototype.DiamondsNoRank = function () {
        var temp = this.Diamonds();
        temp[this.Rank] = 0;
        return temp;
    };
    CurrentPoker.prototype.DiamondsNoRankTotal = function () {
        return CommonMethods.ArraySum(this.DiamondsNoRank());
    };
    CurrentPoker.prototype.DiamondsRankTotal = function () {
        return this.Diamonds()[this.Rank];
    };
    // 梅花
    CurrentPoker.prototype.Clubs = function () {
        var temp = CommonMethods.ArrayCopy(this.Cards, 39, 13);
        return temp;
    };
    CurrentPoker.prototype.ClubsNoRank = function () {
        var temp = this.Clubs();
        temp[this.Rank] = 0;
        return temp;
    };
    CurrentPoker.prototype.ClubsNoRankTotal = function () {
        return CommonMethods.ArraySum(this.ClubsNoRank());
    };
    CurrentPoker.prototype.ClubsRankTotal = function () {
        return this.Clubs()[this.Rank];
    };
    //大王
    CurrentPoker.prototype.RedJoker = function () {
        return this.Cards[53];
    };
    //小王
    CurrentPoker.prototype.BlackJoker = function () {
        return this.Cards[52];
    };
    //是否是混合出牌
    CurrentPoker.prototype.IsMixed = function () {
        var c = [0, 0, 0, 0, 0];
        for (var i = 0; i < 13; i++) {
            if (this.HeartsNoRank()[i] > 0) {
                c[0]++;
                break;
            }
        }
        for (var i = 0; i < 13; i++) {
            if (this.SpadesNoRank()[i] > 0) {
                c[1]++;
                break;
            }
        }
        for (var i = 0; i < 13; i++) {
            if (this.DiamondsNoRank()[i] > 0) {
                c[2]++;
                break;
            }
        }
        for (var i = 0; i < 13; i++) {
            if (this.ClubsNoRank()[i] > 0) {
                c[3]++;
                break;
            }
        }
        if (this.HeartsRankTotal() > 0 || this.SpadesRankTotal() > 0 || this.DiamondsRankTotal() > 0 || this.ClubsRankTotal() > 0 ||
            this.BlackJoker() > 0 || this.RedJoker() > 0)
            c[4] = 1;
        if (this.Trump == SuitEnums.Suit.Heart) {
            c[0] = Math.max(c[0], c[4]);
        }
        else if (this.Trump == SuitEnums.Suit.Spade) {
            c[1] = Math.max(c[1], c[4]);
        }
        else if (this.Trump == SuitEnums.Suit.Diamond) {
            c[2] = Math.max(c[2], c[4]);
        }
        else if (this.Trump == SuitEnums.Suit.Club) {
            c[3] = Math.max(c[3], c[4]);
        }
        if (this.Trump != SuitEnums.Suit.Joker)
            c[4] = 0;
        return CommonMethods.ArraySum(c) > 1;
    };
    //是否有对
    CurrentPoker.prototype.GetPairs = function () {
        var list = [];
        for (var i = 0; i < 13; i++) {
            if (this.Hearts()[i] > 1) {
                list.push(i);
            }
            if (this.Spades()[i] > 1) {
                list.push(i + 13);
            }
            if (this.Diamonds()[i] > 1) {
                list.push(i + 26);
            }
            if (this.Clubs()[i] > 1) {
                list.push(i + 39);
            }
        }
        if (this.BlackJoker() > 1) {
            list.push(52);
        }
        if (this.RedJoker() > 1) {
            list.push(53);
        }
        return list;
    };
    CurrentPoker.prototype.GetMasterPairs = function () {
        var list = [];
        for (var i = 0; i < 13; i++) {
            if (this.Trump == 1) {
                if (this.HeartsNoRank()[i] > 1) {
                    list.push(i);
                }
            }
            if (this.Trump == 2) {
                if (this.SpadesNoRank()[i] > 1) {
                    list.push(i + 13);
                }
            }
            if (this.Trump == 3) {
                if (this.DiamondsNoRank()[i] > 1) {
                    list.push(i + 26);
                }
            }
            if (this.Trump == 4) {
                if (this.ClubsNoRank()[i] > 1) {
                    list.push(i + 39);
                }
            }
        }
        if (this.Trump != 1) {
            if (this.HeartsRankTotal() > 1) {
                list.push(this.Rank);
            }
        }
        if (this.Trump != 2) {
            if (this.SpadesRankTotal() > 1) {
                list.push(this.Rank + 13);
            }
        }
        if (this.Trump != 3) {
            if (this.DiamondsRankTotal() > 1) {
                list.push(this.Rank + 26);
            }
        }
        if (this.Trump != 4) {
            if (this.ClubsRankTotal() > 1) {
                list.push(this.Rank + 39);
            }
        }
        if (this.MasterRank() == 2) {
            list.push((this.Trump - 1) * 13 + this.Rank);
        }
        if (this.BlackJoker() > 1) {
            list.push(52);
        }
        if (this.RedJoker() > 1) {
            list.push(53);
        }
        return list;
    };
    CurrentPoker.prototype.GetPairsBySuit = function (asuit) {
        if (asuit == this.Trump) {
            return this.GetMasterPairs();
        }
        return this.GetNoRankPairs(asuit);
    };
    //是否有拖拉机
    CurrentPoker.prototype.HasTractors = function () {
        var list = this.GetPairs();
        if (list.length == 0) {
            return false;
        }
        if (this.GetTractor() == -1) {
            return false;
        }
        return true;
    };
    CurrentPoker.prototype.GetTractor = function () {
        //大小王
        if ((this.BlackJoker() == 2) && (this.RedJoker() == 2)) {
            return 53;
        }
        //小王主花色
        if ((this.BlackJoker() == 2) && (this.MasterRank() == 2)) {
            return 52;
        }
        //主花色副花色
        if ((this.MasterRank() == 2) && this.HasSubRankPairs()) {
            return ((this.Trump - 1) * 13 + this.Rank);
        }
        //副花色A时
        if (this.HasSubRankPairs()) {
            var a = this.GetSubRankPairs();
            var m = 12;
            if (this.Rank == 12) {
                m = 11;
            }
            if ((this.Trump == 1) && (this.Hearts()[m] > 1)) {
                return a[0];
            }
            if ((this.Trump == 2) && (this.Spades()[m] > 1)) {
                return a[0];
            }
            if ((this.Trump == 3) && (this.Diamonds()[m] > 1)) {
                return a[0];
            }
            if ((this.Trump == 4) && (this.Clubs()[m] > 1)) {
                return a[0];
            }
        }
        //顺序比较
        for (var i = 12; i > 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            var m = i - 1;
            if (m == this.Rank) {
                m--;
            }
            if (m < 0) {
                break;
            }
            if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                return i;
            }
            if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                return (i + 13);
            }
            if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                return (i + 26);
            }
            if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                return (i + 39);
            }
        }
        return -1;
    };
    CurrentPoker.prototype.GetTractorBySuitInt = function (asuit) {
        if (asuit == this.Trump) {
            return this.GetMasterTractor();
        }
        //顺序比较
        for (var i = 12; i > 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            var m = i - 1;
            if (m == this.Rank) {
                m--;
            }
            if (m < 0) {
                break;
            }
            if (asuit == 1) {
                if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                    return i;
                }
            }
            if (asuit == 2) {
                if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                    return (i + 13);
                }
            }
            if (asuit == 3) {
                if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                    return (i + 26);
                }
            }
            if (asuit == 4) {
                if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                    return (i + 39);
                }
            }
        }
        return -1;
    };
    CurrentPoker.prototype.GetTractorOfAnySuit = function () {
        var result = this.GetTractorBySuit(SuitEnums.Suit.Club);
        if (result.length > 1)
            return result;
        result = this.GetTractorBySuit(SuitEnums.Suit.Diamond);
        if (result.length > 1)
            return result;
        result = this.GetTractorBySuit(SuitEnums.Suit.Heart);
        if (result.length > 1)
            return result;
        result = this.GetTractorBySuit(SuitEnums.Suit.Spade);
        if (result.length > 1)
            return result;
        result = this.GetTractorBySuit(SuitEnums.Suit.Joker);
        if (result.length > 1)
            return result;
        return [];
    };
    CurrentPoker.prototype.GetTractorBySuit = function (suit) {
        var result = this.GetTractorUnsorted(suit);
        result.sort(function (n1, n2) { return n1 - n2; });
        return result;
    };
    CurrentPoker.prototype.GetTractorUnsorted = function (suit) {
        if (suit == this.Trump || suit == SuitEnums.Suit.Joker)
            return this.GetTrumpTractor();
        var result = [];
        //顺序比较
        for (var i = 12; i > -1; i--) {
            if (i == this.Rank) {
                continue;
            }
            if (i < 0) {
                break;
            }
            if (suit == SuitEnums.Suit.Heart) {
                if (this.HeartsNoRank()[i] > 1)
                    result.push(i);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
            else if (suit == SuitEnums.Suit.Spade) {
                if (this.SpadesNoRank()[i] > 1)
                    result.push(i + 13);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
            else if (suit == SuitEnums.Suit.Diamond) {
                if (this.DiamondsNoRank()[i] > 1)
                    result.push(i + 26);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
            else if (suit == SuitEnums.Suit.Club) {
                if (this.ClubsNoRank()[i] > 1)
                    result.push(i + 39);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
        }
        if (result.length <= 1)
            result = [];
        return result;
    };
    CurrentPoker.prototype.GetTrumpTractor = function () {
        var result = [];
        //大小王
        if (this.RedJoker() == 2) {
            result.push(53);
        }
        //小王主花色
        if (this.BlackJoker() == 2) {
            result.push(52);
        }
        else
            result = [];
        //主花色副花色
        if (this.Trump != SuitEnums.Suit.Joker) {
            //只有在不打无主时才考虑主级牌，从而打无主时副级牌+小王仍被视为拖拉机
            if (this.MasterRank() == 2)
                result.push((this.Trump - 1) * 13 + this.Rank);
            else if (result.length > 1)
                return result;
            else
                result = [];
        }
        //副花色A时
        if (this.HasSubRankPairs()) {
            var a = this.GetSubRankPairs();
            result.push(a[0]);
        }
        else if (result.length > 1)
            return result;
        else
            result = [];
        //顺序比较
        for (var i = 12; i >= 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            if (this.Trump == SuitEnums.Suit.Heart) {
                if (this.HeartsNoRank()[i] > 1)
                    result.push(i);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
            else if (this.Trump == SuitEnums.Suit.Spade) {
                if (this.SpadesNoRank()[i] > 1)
                    result.push(i + 13);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
            else if (this.Trump == SuitEnums.Suit.Diamond) {
                if (this.DiamondsNoRank()[i] > 1)
                    result.push(i + 26);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
            else if (this.Trump == SuitEnums.Suit.Club) {
                if (this.ClubsNoRank()[i] > 1)
                    result.push(i + 39);
                else if (result.length > 1)
                    return result;
                else
                    result = [];
            }
        }
        if (result.length <= 1)
            result = [];
        return result;
    };
    CurrentPoker.prototype.GetMasterTractor = function () {
        //大小王
        if ((this.BlackJoker() == 2) && (this.RedJoker() == 2)) {
            return 53;
        }
        //小王主花色
        if ((this.BlackJoker() == 2) && (this.MasterRank() == 2)) {
            return 52;
        }
        //主花色副花色
        if ((this.MasterRank() == 2) && this.HasSubRankPairs()) {
            return ((this.Trump - 1) * 13 + this.Rank);
        }
        //副花色A时
        if (this.HasSubRankPairs()) {
            var a = this.GetSubRankPairs();
            var m = this.Rank;
            if (this.Rank == 12) {
                m = 11;
            }
            if ((this.Trump == 1) && (this.Hearts()[m] > 1)) {
                return a[0];
            }
            if ((this.Trump == 2) && (this.Spades()[m] > 1)) {
                return a[0];
            }
            if ((this.Trump == 3) && (this.Diamonds()[m] > 1)) {
                return a[0];
            }
            if ((this.Trump == 4) && (this.Clubs()[m] > 1)) {
                return a[0];
            }
        }
        //顺序比较
        for (var i = 12; i > 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            var m = i - 1;
            if (m == this.Rank) {
                m--;
            }
            if (m < 0) {
                break;
            }
            if (this.Trump == 1) {
                if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                    return i;
                }
            }
            if (this.Trump == 2) {
                if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                    return (i + 13);
                }
            }
            if (this.Trump == 3) {
                if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                    return (i + 26);
                }
            }
            if (this.Trump == 4) {
                if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                    return (i + 39);
                }
            }
        }
        return -1;
    };
    CurrentPoker.prototype.GetSubRankPairs = function () {
        var list = [];
        if (this.Trump != 1) {
            if (this.HeartsRankTotal() == 2) {
                list.push(this.Rank);
            }
        }
        if (this.Trump != 2) {
            if (this.SpadesRankTotal() == 2) {
                list.push(13 + this.Rank);
            }
        }
        if (this.Trump != 3) {
            if (this.DiamondsRankTotal() == 2) {
                list.push(26 + this.Rank);
            }
        }
        if (this.Trump != 4) {
            if (this.ClubsRankTotal() == 2) {
                list.push(39 + this.Rank);
            }
        }
        return list;
    };
    CurrentPoker.prototype.HasMasterRankPairs = function () {
        if (this.Rank > 12) {
            return false;
        }
        if (this.MasterRank() > 1) {
            return true;
        }
        return false;
    };
    CurrentPoker.prototype.HasSubRankPairs = function () {
        if (this.Rank > 12) {
            return false;
        }
        var count = 0;
        if (this.Hearts()[this.Rank] > 1) {
            count++;
        }
        if (this.Spades()[this.Rank] > 1) {
            count++;
        }
        if (this.Diamonds()[this.Rank] > 1) {
            count++;
        }
        if (this.Clubs()[this.Rank] > 1) {
            count++;
        }
        if (this.HasMasterRankPairs()) {
            count--;
        }
        if (count > 0) {
            return true;
        }
        return false;
    };
    CurrentPoker.prototype.GetTractorOtherCards = function (max) {
        //大小王
        if (max == 53) {
            return [53, 52, 52];
        }
        //小王主花色
        if (max == 52) {
            return [52, (this.Trump - 1) * 13 + this.Rank, (this.Trump - 1) * 13 + this.Rank];
        }
        //主花色副花色
        if (max == ((this.Trump - 1) * 13 + this.Rank)) {
            var a = this.GetSubRankPairs();
            return [(this.Trump - 1) * 13 + this.Rank, a[0], a[0]];
        }
        //副花色A时
        if (this.HasSubRankPairs()) {
            var a = this.GetSubRankPairs();
            if (a[0] == max) {
                var m = 12;
                if (this.Rank == 12) {
                    m = 11;
                }
                if ((this.Trump == 1) && (this.Hearts()[m] > 1)) {
                    return [a[0], m, m];
                }
                if ((this.Trump == 2) && (this.Spades()[m] > 1)) {
                    return [a[0], m + 13, m + 13];
                }
                if ((this.Trump == 3) && (this.Diamonds()[m] > 1)) {
                    return [a[0], m + 26, m + 26];
                }
                if ((this.Trump == 4) && (this.Clubs()[m] > 1)) {
                    return [a[0], m + 39, m + 39];
                }
            }
        }
        //顺序比较
        for (var i = 12; i > 0; i--) {
            if (this.Trump == 1) {
                var m = i - 1;
                if (m == this.Rank) {
                    m--;
                }
                if (m < 0) {
                    break;
                }
                if (max == i) {
                    if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                        return [i, m, m];
                    }
                }
            }
            if (this.Trump == 2) {
                if ((max - 13) == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                        return [i + 13, m + 13, m + 13];
                    }
                }
            }
            if (this.Trump == 3) {
                if ((max - 26) == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                        return [i + 26, m + 26, m + 26];
                    }
                }
            }
            if (this.Trump == 4) {
                if ((max - 39) == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                        return [i + 39, m + 39, m + 39];
                    }
                }
            }
        }
        //顺序比较
        for (var i = 12; i > 0; i--) {
            if (this.Trump != 1) {
                if (max == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                        return [i, m, m];
                    }
                }
            }
            if (this.Trump != 2) {
                if ((max - 13) == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                        return [i + 13, m + 13, m + 13];
                    }
                }
            }
            if (this.Trump != 3) {
                if ((max - 26) == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                        return [i + 26, m + 26, m + 26];
                    }
                }
            }
            if (this.Trump != 4) {
                if ((max - 39) == i) {
                    var m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                        return [i + 39, m + 39, m + 39];
                    }
                }
            }
        }
        return [];
    };
    CurrentPoker.prototype.GetNoRankNoSuitTractor = function () {
        //顺序比较
        for (var i = 12; i > 0; i--) {
            if (this.Trump != 1) {
                if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[i - 1] > 1)) {
                    return i;
                }
            }
            if (this.Trump != 2) {
                if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[i - 1] > 1)) {
                    return (i + 13);
                }
            }
            if (this.Trump != 3) {
                if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[i - 1] > 1)) {
                    return (i + 26);
                }
            }
            if (this.Trump != 4) {
                if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[i - 1] > 1)) {
                    return (i + 39);
                }
            }
        }
        return -1;
    };
    CurrentPoker.prototype.MasterRank = function () {
        if (this.Trump == SuitEnums.Suit.Joker || this.Trump == 0)
            return 0;
        var index = (this.Trump - 1) * 13 + this.Rank;
        return this.Cards[index];
    };
    CurrentPoker.prototype.SubRank = function () {
        return this.HeartsRankTotal() + this.SpadesRankTotal() + this.DiamondsRankTotal() + this.ClubsRankTotal() - this.MasterRank();
    };
    CurrentPoker.prototype.GetMasterCardsCount = function () {
        var tmp = this.RedJoker() + this.BlackJoker() + this.MasterRank() + this.SubRank();
        if (this.Trump == 1) {
            tmp += this.HeartsNoRankTotal();
        }
        else if (this.Trump == 2) {
            tmp += this.SpadesNoRankTotal();
        }
        else if (this.Trump == 3) {
            tmp += this.DiamondsNoRankTotal();
        }
        else if (this.Trump == 4) {
            tmp += this.ClubsNoRankTotal();
        }
        return tmp;
    };
    //比较单张副牌
    CurrentPoker.prototype.CompareToSingle = function (number) {
        var masterCards = this.GetMasterCardsCount();
        if (number >= 0 && number < 13) {
            for (var i = 12; i > -1; i--) {
                if (this.HeartsNoRank()[i] > 0) {
                    if (number >= i)
                        return false;
                    return true;
                }
            }
            if (masterCards > 0) {
                return true;
            }
            return false;
        }
        if (number >= 13 && number < 26) {
            for (var i = 12; i > -1; i--) {
                if (this.SpadesNoRank()[i] > 0) {
                    if ((number - 13) >= i)
                        return false;
                    return true;
                }
            }
            if (masterCards > 0) {
                return true;
            }
            return false;
        }
        if (number >= 26 && number < 39) {
            for (var i = 12; i > -1; i--) {
                if (this.DiamondsNoRank()[i] > 0) {
                    if ((number - 26) >= i)
                        return false;
                    return true;
                }
            }
            if (masterCards > 0) {
                return true;
            }
            return false;
        }
        if (number >= 39 && number < 52) {
            for (var i = 12; i > -1; i--) {
                if (this.ClubsNoRank()[i] > 0) {
                    if ((number - 39) >= i)
                        return false;
                    return true;
                }
            }
            if (masterCards > 0) {
                return true;
            }
            return false;
        }
        return false;
    };
    //比较对
    CurrentPoker.prototype.CompareToPair = function (numbers) {
        if (numbers.length >= 6) {
            return false;
        }
        var al = [];
        if (numbers[0] >= 0 && numbers[0] < 13) {
            al = this.GetNoRankPairs(1);
        }
        else if (numbers[0] >= 13 && numbers[0] < 26) {
            al = this.GetNoRankPairs(2);
        }
        else if (numbers[0] >= 26 && numbers[0] < 39) {
            al = this.GetNoRankPairs(3);
        }
        else if (numbers[0] >= 39 && numbers[0] < 52) {
            al = this.GetNoRankPairs(4);
        }
        if (al.length == 0) {
            return false;
        }
        if (al.length >= 0) {
            if (al[0] - numbers[0] >= 0) {
                return true;
            }
            return false;
        }
        return true;
    };
    CurrentPoker.prototype.GetNoRankPairs = function (asuit) {
        var list = [];
        if ((asuit == 1)) {
            for (var i = 0; i < 13; i++) {
                if (this.HeartsNoRank()[i] > 1) {
                    list.push(i);
                }
            }
        }
        else if ((asuit == 2)) {
            for (var i = 0; i < 13; i++) {
                if (this.SpadesNoRank()[i] > 1) {
                    list.push(i + 13);
                }
            }
        }
        else if ((asuit == 3)) {
            for (var i = 0; i < 13; i++) {
                if (this.DiamondsNoRank()[i] > 1) {
                    list.push(i + 26);
                }
            }
        }
        else if ((asuit == 4)) {
            for (var i = 0; i < 13; i++) {
                if (this.ClubsNoRank()[i] > 1) {
                    list.push(i + 39);
                }
            }
        }
        else if ((asuit == 5)) {
            if (this.BlackJoker() > 1) {
                list.push(52);
            }
            if (this.RedJoker() > 1) {
                list.push(53);
            }
        }
        return list;
    };
    CurrentPoker.prototype.HasSomeCards = function (suit) {
        if (suit == this.Trump) {
            var count = this.HeartsRankTotal() + this.SpadesRankTotal() + this.DiamondsRankTotal() + this.ClubsRankTotal();
            count = count + this.MasterRank() + this.SubRank() + this.RedJoker() + this.BlackJoker();
            if (suit == 1) {
                count += this.HeartsNoRankTotal();
            }
            else if (suit == 2) {
                count += this.SpadesNoRankTotal();
            }
            else if (suit == 3) {
                count += this.DiamondsNoRankTotal();
            }
            else if (suit == 4) {
                count += this.ClubsNoRankTotal();
            }
            if (count > 0)
                return true;
            return false;
        }
        if (suit == 1) {
            if (this.HeartsNoRankTotal() > 0) {
                return true;
            }
            return false;
        }
        if (suit == 2) {
            if (this.SpadesNoRankTotal() > 0) {
                return true;
            }
            return false;
        }
        if (suit == 3) {
            if (this.DiamondsNoRankTotal() > 0) {
                return true;
            }
            return false;
        }
        if (suit == 4) {
            if (this.ClubsNoRankTotal() > 0) {
                return true;
            }
            return false;
        }
        if (suit == 5) {
            if ((this.BlackJoker() + this.RedJoker()) > 0) {
                return true;
            }
            return false;
        }
        return false;
    };
    CurrentPoker.prototype.GetSuitCardsWithJokerAndRank = function (asuit) {
        var list = [];
        if (asuit == 5) {
            if (this.Rank != 53) {
                if (this.SpadesRankTotal() == 1) {
                    list.push(13 + this.Rank);
                }
                else if (this.SpadesRankTotal() == 2) {
                    list.push(13 + this.Rank);
                    list.push(13 + this.Rank);
                }
                if (this.DiamondsRankTotal() == 1) {
                    list.push(26 + this.Rank);
                }
                else if (this.DiamondsRankTotal() == 2) {
                    list.push(26 + this.Rank);
                    list.push(26 + this.Rank);
                }
                if (this.ClubsRankTotal() == 1) {
                    list.push(39 + this.Rank);
                }
                else if (this.ClubsRankTotal() == 2) {
                    list.push(39 + this.Rank);
                    list.push(39 + this.Rank);
                }
                //
                if (this.HeartsRankTotal() == 1) {
                    list.push(this.Rank);
                }
                else if (this.HeartsRankTotal() == 2) {
                    list.push(this.Rank);
                    list.push(this.Rank);
                }
            }
            if (this.BlackJoker() == 1) {
                list.push(52);
            }
            else if (this.BlackJoker() == 2) {
                list.push(52);
                list.push(52);
            }
            if (this.RedJoker() == 1) {
                list.push(53);
            }
            else if (this.RedJoker() == 2) {
                list.push(53);
                list.push(53);
            }
        }
        else if (asuit == this.Trump) {
            if (asuit == 1) {
                for (var i = 0; i < 13; i++) {
                    if (this.HeartsNoRank()[i] == 1) {
                        list.push(i);
                    }
                    else if (this.HeartsNoRank()[i] == 2) {
                        list.push(i);
                        list.push(i);
                    }
                }
                //
                if (this.SpadesRankTotal() == 1) {
                    list.push(13 + this.Rank);
                }
                else if (this.SpadesRankTotal() == 2) {
                    list.push(13 + this.Rank);
                    list.push(13 + this.Rank);
                }
                if (this.DiamondsRankTotal() == 1) {
                    list.push(26 + this.Rank);
                }
                else if (this.DiamondsRankTotal() == 2) {
                    list.push(26 + this.Rank);
                    list.push(26 + this.Rank);
                }
                if (this.ClubsRankTotal() == 1) {
                    list.push(39 + this.Rank);
                }
                else if (this.ClubsRankTotal() == 2) {
                    list.push(39 + this.Rank);
                    list.push(39 + this.Rank);
                }
                //
                if (this.HeartsRankTotal() == 1) {
                    list.push(this.Rank);
                }
                else if (this.HeartsRankTotal() == 2) {
                    list.push(this.Rank);
                    list.push(this.Rank);
                }
                //
                if (this.BlackJoker() == 1) {
                    list.push(52);
                }
                else if (this.BlackJoker() == 2) {
                    list.push(52);
                    list.push(52);
                }
                if (this.RedJoker() == 1) {
                    list.push(53);
                }
                else if (this.RedJoker() == 2) {
                    list.push(53);
                    list.push(53);
                }
            }
            else if (asuit == 2) {
                for (var i = 0; i < 13; i++) {
                    if (this.SpadesNoRank()[i] == 1) {
                        list.push(i + 13);
                    }
                    else if (this.SpadesNoRank()[i] == 2) {
                        list.push(i + 13);
                        list.push(i + 13);
                    }
                }
                //
                if (this.HeartsRankTotal() == 1) {
                    list.push(this.Rank);
                }
                else if (this.HeartsRankTotal() == 2) {
                    list.push(this.Rank);
                    list.push(this.Rank);
                }
                if (this.DiamondsRankTotal() == 1) {
                    list.push(26 + this.Rank);
                }
                else if (this.DiamondsRankTotal() == 2) {
                    list.push(26 + this.Rank);
                    list.push(26 + this.Rank);
                }
                if (this.ClubsRankTotal() == 1) {
                    list.push(39 + this.Rank);
                }
                else if (this.ClubsRankTotal() == 2) {
                    list.push(39 + this.Rank);
                    list.push(39 + this.Rank);
                }
                //
                if (this.SpadesRankTotal() == 1) {
                    list.push(13 + this.Rank);
                }
                else if (this.SpadesRankTotal() == 2) {
                    list.push(13 + this.Rank);
                    list.push(13 + this.Rank);
                }
                //
                if (this.BlackJoker() == 1) {
                    list.push(52);
                }
                else if (this.BlackJoker() == 2) {
                    list.push(52);
                    list.push(52);
                }
                if (this.RedJoker() == 1) {
                    list.push(53);
                }
                else if (this.RedJoker() == 2) {
                    list.push(53);
                    list.push(53);
                }
            }
            else if (asuit == 3) {
                for (var i = 0; i < 13; i++) {
                    if (this.DiamondsNoRank()[i] == 1) {
                        list.push(i + 26);
                    }
                    else if (this.DiamondsNoRank()[i] == 2) {
                        list.push(i + 26);
                        list.push(i + 26);
                    }
                }
                //
                if (this.SpadesRankTotal() == 1) {
                    list.push(13 + this.Rank);
                }
                else if (this.SpadesRankTotal() == 2) {
                    list.push(13 + this.Rank);
                    list.push(13 + this.Rank);
                }
                if (this.HeartsRankTotal() == 1) {
                    list.push(this.Rank);
                }
                else if (this.HeartsRankTotal() == 2) {
                    list.push(this.Rank);
                    list.push(this.Rank);
                }
                //
                if (this.DiamondsRankTotal() == 1) {
                    list.push(26 + this.Rank);
                }
                else if (this.DiamondsRankTotal() == 2) {
                    list.push(26 + this.Rank);
                    list.push(26 + this.Rank);
                }
                if (this.ClubsRankTotal() == 1) {
                    list.push(39 + this.Rank);
                }
                else if (this.ClubsRankTotal() == 2) {
                    list.push(39 + this.Rank);
                    list.push(39 + this.Rank);
                }
                //
                if (this.BlackJoker() == 1) {
                    list.push(52);
                }
                else if (this.BlackJoker() == 2) {
                    list.push(52);
                    list.push(52);
                }
                if (this.RedJoker() == 1) {
                    list.push(53);
                }
                else if (this.RedJoker() == 2) {
                    list.push(53);
                    list.push(53);
                }
            }
            else if (asuit == 4) {
                for (var i = 0; i < 13; i++) {
                    if (this.ClubsNoRank()[i] == 1) {
                        list.push(i + 39);
                    }
                    else if (this.ClubsNoRank()[i] == 2) {
                        list.push(i + 39);
                        list.push(i + 39);
                    }
                }
                //
                if (this.HeartsRankTotal() == 1) {
                    list.push(this.Rank);
                }
                else if (this.HeartsRankTotal() == 2) {
                    list.push(this.Rank);
                    list.push(this.Rank);
                }
                if (this.SpadesRankTotal() == 1) {
                    list.push(13 + this.Rank);
                }
                else if (this.SpadesRankTotal() == 2) {
                    list.push(13 + this.Rank);
                    list.push(13 + this.Rank);
                }
                if (this.DiamondsRankTotal() == 1) {
                    list.push(26 + this.Rank);
                }
                else if (this.DiamondsRankTotal() == 2) {
                    list.push(26 + this.Rank);
                    list.push(26 + this.Rank);
                }
                //
                if (this.ClubsRankTotal() == 1) {
                    list.push(39 + this.Rank);
                }
                else if (this.ClubsRankTotal() == 2) {
                    list.push(39 + this.Rank);
                    list.push(39 + this.Rank);
                }
                //
                if (this.BlackJoker() == 1) {
                    list.push(52);
                }
                else if (this.BlackJoker() == 2) {
                    list.push(52);
                    list.push(52);
                }
                if (this.RedJoker() == 1) {
                    list.push(53);
                }
                else if (this.RedJoker() == 2) {
                    list.push(53);
                    list.push(53);
                }
            }
        }
        else {
            if (asuit == 1) {
                for (var i = 0; i < 13; i++) {
                    if (this.HeartsNoRank()[i] == 1) {
                        list.push(i);
                    }
                    else if (this.HeartsNoRank()[i] == 2) {
                        list.push(i);
                        list.push(i);
                    }
                }
            }
            else if (asuit == 2) {
                for (var i = 0; i < 13; i++) {
                    if (this.SpadesNoRank()[i] == 1) {
                        list.push(i + 13);
                    }
                    else if (this.SpadesNoRank()[i] == 2) {
                        list.push(i + 13);
                        list.push(i + 13);
                    }
                }
            }
            else if (asuit == 3) {
                for (var i = 0; i < 13; i++) {
                    if (this.DiamondsNoRank()[i] == 1) {
                        list.push(i + 26);
                    }
                    else if (this.DiamondsNoRank()[i] == 2) {
                        list.push(i + 26);
                        list.push(i + 26);
                    }
                }
            }
            else if (asuit == 4) {
                for (var i = 0; i < 13; i++) {
                    if (this.ClubsNoRank()[i] == 1) {
                        list.push(i + 39);
                    }
                    else if (this.ClubsNoRank()[i] == 2) {
                        list.push(i + 39);
                        list.push(i + 39);
                    }
                }
            }
        }
        return list;
    };
    CurrentPoker.prototype.GetMaxCards = function (asuit) {
        var rt = -1;
        if (asuit == 1) {
            for (var i = 12; i > -1; i--) {
                if (this.HeartsNoRank()[i] > 0) {
                    return i;
                }
            }
        }
        else if (asuit == 2) {
            for (var i = 12; i > -1; i--) {
                if (this.SpadesNoRank()[i] > 0) {
                    return i + 13;
                }
            }
        }
        else if (asuit == 3) {
            for (var i = 12; i > -1; i--) {
                if (this.DiamondsNoRank()[i] > 0) {
                    return i + 26;
                }
            }
        }
        else if (asuit == 4) {
            for (var i = 12; i > -1; i--) {
                if (this.ClubsNoRank()[i] > 0) {
                    return i + 39;
                }
            }
        }
        return rt;
    };
    CurrentPoker.prototype.GetMinMasterCards = function (asuit) {
        var rt = -1;
        if (asuit == 1) {
            for (var i = 0; i < 13; i++) {
                if (this.HeartsNoRank()[i] > 0) {
                    return i;
                }
            }
        }
        else if (asuit == 2) {
            for (var i = 0; i < 13; i++) {
                if (this.SpadesNoRank()[i] > 0) {
                    return i + 13;
                }
            }
        }
        else if (asuit == 3) {
            for (var i = 0; i < 13; i++) {
                if (this.DiamondsNoRank()[i] > 0) {
                    return i + 26;
                }
            }
        }
        else if (asuit == 4) {
            for (var i = 0; i < 13; i++) {
                if (this.ClubsNoRank()[i] > 0) {
                    return i + 39;
                }
            }
        }
        if (this.Trump != 1) {
            if (this.HeartsRankTotal() > 0) {
                rt = this.Rank;
                return rt;
            }
        }
        if (this.Trump != 2) {
            if (this.SpadesRankTotal() > 0) {
                rt = this.Rank + 13;
                return rt;
            }
        }
        if (this.Trump != 3) {
            if (this.DiamondsRankTotal() > 0) {
                rt = this.Rank + 26;
                return rt;
            }
        }
        if (this.Trump != 4) {
            if (this.ClubsRankTotal() > 0) {
                rt = this.Rank + 39;
                return rt;
            }
        }
        if (this.MasterRank() > 0) {
            rt = (this.Trump - 1) * 13 + this.Rank;
            return rt;
        }
        if (this.BlackJoker() > 0) {
            rt = 52;
            return rt;
        }
        if (this.RedJoker() > 0) {
            rt = 53;
            return rt;
        }
        return rt;
    };
    //全部清空
    CurrentPoker.prototype.Clear = function () {
        this.Cards = new Array(54);
        this.Cards.fill(0);
    };
    return CurrentPoker;
}());
export { CurrentPoker };
