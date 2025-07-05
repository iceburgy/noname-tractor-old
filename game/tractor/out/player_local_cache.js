import { CommonMethods } from "./common_methods.js";
var PlayerLocalCache = /** @class */ (function () {
    function PlayerLocalCache() {
        this.ShowedCardsInCurrentTrick = {};
        this.WinnerPosition = 0;
        this.WinResult = 0;
        this.WinnderID = "";
        this.isLastTrick = false;
    }
    PlayerLocalCache.prototype.CloneFrom = function (from) {
        this.ShowedCardsInCurrentTrick = CommonMethods.deepCopy(from.ShowedCardsInCurrentTrick);
        this.WinnerPosition = from.WinnerPosition;
        this.WinResult = from.WinResult;
        this.WinnderID = from.WinnderID;
        this.isLastTrick = from.isLastTrick;
    };
    return PlayerLocalCache;
}());
export { PlayerLocalCache };
