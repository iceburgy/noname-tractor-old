import { CommonMethods } from './common_methods.js';
var ShowedCardKeyValue = /** @class */ (function () {
    function ShowedCardKeyValue() {
        this.PlayerID = "";
        this.Cards = [];
    }
    ShowedCardKeyValue.prototype.CloneFrom = function (from) {
        this.PlayerID = from.PlayerID;
        this.Cards = CommonMethods.deepCopy(from.Cards);
    };
    return ShowedCardKeyValue;
}());
export { ShowedCardKeyValue };
