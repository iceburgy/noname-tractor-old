import { CommonMethods } from "./common_methods.js";
var ServerLocalCache = /** @class */ (function () {
    function ServerLocalCache() {
        this.lastShowedCards = {};
        this.lastLeader = "";
        this.muteSound = false;
    }
    ServerLocalCache.prototype.CloneFrom = function (from) {
        this.lastShowedCards = CommonMethods.deepCopy(from.lastShowedCards);
        this.lastLeader = from.lastLeader;
        this.muteSound = from.muteSound;
    };
    return ServerLocalCache;
}());
export { ServerLocalCache };
