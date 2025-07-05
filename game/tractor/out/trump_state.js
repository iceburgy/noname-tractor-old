var TrumpState = /** @class */ (function () {
    function TrumpState() {
        this.Trump = 0;
        this.TrumpExposingPoker = 0;
        this.TrumpMaker = "";
        this.IsNoTrumpMaker = false;
    }
    TrumpState.prototype.CloneFrom = function (from) {
        this.Trump = from.Trump;
        this.TrumpExposingPoker = from.TrumpExposingPoker;
        this.TrumpMaker = from.TrumpMaker;
        this.IsNoTrumpMaker = from.IsNoTrumpMaker;
    };
    return TrumpState;
}());
export { TrumpState };
