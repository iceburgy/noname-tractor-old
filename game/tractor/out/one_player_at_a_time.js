var OnePlayerAtATime = /** @class */ (function () {
    function OnePlayerAtATime(dfh) {
        this.drawingFormHelper = dfh;
        this.cardsListList = [];
        this.positionList = [];
        this.curIndex = 0;
        this.winner = "";
        this.points = 0;
        this.scoreCards = [];
    }
    OnePlayerAtATime.prototype.DrawShowedCardsOnePlayerAtATime = function () {
        this.drawingFormHelper.DrawShowedCardsByPosition(this.cardsListList[this.curIndex], this.positionList[this.curIndex]);
        this.curIndex++;
    };
    return OnePlayerAtATime;
}());
export { OnePlayerAtATime };
