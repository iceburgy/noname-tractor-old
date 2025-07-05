import { CommonMethods } from './common_methods.js';
import { PokerHelper } from './poker_helper.js';
import { ServerLocalCache } from './server_local_cache.js';
import { SuitEnums } from './suit_enums.js';
var CurrentTrickState = /** @class */ (function () {
    function CurrentTrickState() {
        this.Learder = "";
        this.Winner = "";
        this.ShowedCards = {};
        this.serverLocalCache = new ServerLocalCache();
        this.Trump = 0;
        this.Rank = 0;
    }
    CurrentTrickState.prototype.CloneFrom = function (from) {
        this.Learder = from.Learder;
        this.Winner = from.Winner;
        this.ShowedCards = CommonMethods.deepCopy(from.ShowedCards);
        this.serverLocalCache.CloneFrom(from.serverLocalCache);
        this.Trump = from.Trump;
        this.Rank = from.Rank;
    };
    CurrentTrickState.prototype.LatestPlayerShowedCard = function () {
        var playerId = "";
        if (!this.Learder || !this.ShowedCards[this.Learder] || this.ShowedCards[this.Learder].length == 0)
            return playerId;
        var afterLeader = false;
        //find next player to show card after learder
        for (var _i = 0, _a = Object.entries(this.ShowedCards); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (key != this.Learder && afterLeader == false)
                continue;
            else if (key == this.Learder) //search from leader;
             {
                playerId = this.Learder;
                afterLeader = true;
            }
            else if (afterLeader) {
                if (value.length == 0)
                    return playerId;
                playerId = key;
            }
        }
        for (var _c = 0, _d = Object.entries(this.ShowedCards); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], value = _e[1];
            {
                if (key != this.Learder) {
                    if (value.length == 0)
                        return playerId;
                    playerId = key;
                }
                else //search end before leader
                    break;
            }
        }
        return playerId;
    };
    CurrentTrickState.prototype.IsStarted = function () {
        if (!this.Learder)
            return false;
        if (!this.ShowedCards || Object.keys(this.ShowedCards).length == 0)
            return false;
        return this.ShowedCards[this.Learder].length > 0;
    };
    CurrentTrickState.prototype.CountOfPlayerShowedCards = function () {
        var result = 0;
        if (!this.ShowedCards)
            return result;
        for (var _i = 0, _a = Object.entries(this.ShowedCards); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (value.length > 0)
                result++;
        }
        return result;
    };
    CurrentTrickState.prototype.ScoreCards = function () {
        var scorecards = [];
        Object.values(this.ShowedCards).forEach(function (cardsList) {
            cardsList.forEach(function (card) {
                if (card % 13 == 3 || card % 13 == 8 || card % 13 == 11)
                    scorecards.push(card);
            });
        });
        return scorecards;
    };
    CurrentTrickState.prototype.NextPlayer = function () {
        var playerId = "";
        if (this.ShowedCards[this.Learder].length == 0)
            playerId = this.Learder;
        else {
            var afterLeader = false;
            //find next player to show card after learder
            for (var _i = 0, _a = Object.entries(this.ShowedCards); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (key != this.Learder && afterLeader == false)
                    continue;
                if (key == this.Learder) { // search from learder
                    afterLeader = true;
                }
                if (afterLeader) {
                    if (value.length == 0) {
                        playerId = key;
                        break;
                    }
                }
            }
            if (!playerId) {
                for (var _c = 0, _d = Object.entries(this.ShowedCards); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    if (key != this.Learder) {
                        if (value.length == 0) {
                            playerId = key;
                            break;
                        }
                    }
                    else //search end before leader;
                        break;
                }
            }
        }
        return playerId;
    };
    CurrentTrickState.prototype.NextPlayerByID = function (playerId) {
        var nextPlayer = "";
        if (!this.ShowedCards || !this.ShowedCards[playerId])
            return "";
        var afterLeader = false;
        //find next player to show card after learder
        for (var _i = 0, _a = Object.entries(this.ShowedCards); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (key != playerId && afterLeader == false)
                continue;
            else if (key == playerId) // search from learder
             {
                afterLeader = true;
            }
            else if (afterLeader) {
                nextPlayer = key;
                break;
            }
        }
        if (!nextPlayer) {
            for (var _c = 0, _d = Object.entries(this.ShowedCards); _c < _d.length; _c++) {
                var _e = _d[_c], key = _e[0], value = _e[1];
                if (key != playerId) {
                    nextPlayer = key;
                }
                break;
            }
        }
        return nextPlayer;
    };
    CurrentTrickState.prototype.AllPlayedShowedCards = function () {
        for (var _i = 0, _a = Object.entries(this.ShowedCards); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (value.length == 0)
                return false;
        }
        return true;
    };
    CurrentTrickState.prototype.LeadingCards = function () {
        if (this.IsStarted()) {
            return this.ShowedCards[this.Learder];
        }
        return [];
    };
    CurrentTrickState.prototype.LeadingSuit = function () {
        if (this.IsStarted()) {
            if (PokerHelper.IsTrump(this.LeadingCards()[0], this.Trump, this.Rank))
                return this.Trump;
            else
                return PokerHelper.GetSuit(this.LeadingCards()[0]);
        }
        return SuitEnums.Suit.None;
    };
    CurrentTrickState.prototype.Points = function () {
        var points = 0;
        for (var _i = 0, _a = Object.values(this.ShowedCards); _i < _a.length; _i++) {
            var cardsList = _a[_i];
            for (var _b = 0, _c = cardsList; _b < _c.length; _b++) {
                var card = _c[_b];
                if (card % 13 == 3)
                    points += 5;
                else if (card % 13 == 8)
                    points += 10;
                else if (card % 13 == 11)
                    points += 10;
            }
        }
        return points;
    };
    return CurrentTrickState;
}());
export { CurrentTrickState };
