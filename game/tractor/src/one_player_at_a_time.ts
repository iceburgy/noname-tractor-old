import { DrawingFormHelper } from "./drawing_form_helper";

export class OnePlayerAtATime {
    public drawingFormHelper: DrawingFormHelper;
    public cardsListList: number[][];
    public positionList: number[];
    public curIndex: number;
    public winner: string;
    public points: number;
    public scoreCards: number[];
    constructor(dfh: DrawingFormHelper) {
        this.drawingFormHelper = dfh;
        this.cardsListList = [];
        this.positionList = [];
        this.curIndex = 0;
        this.winner = "";
        this.points = 0;
        this.scoreCards = [];
    }

    public DrawShowedCardsOnePlayerAtATime() {
        this.drawingFormHelper.DrawShowedCardsByPosition(this.cardsListList[this.curIndex], this.positionList[this.curIndex]);
        this.curIndex++;
    }
}
