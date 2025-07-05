export var ShowingCardsValidationResult = /** @class */ (function () {
    function ShowingCardsValidationResult() {
        this.CardsToShow = [];
        this.MustShowCardsForDumpingFail = [];
        this.PlayerId = "";
        this.ResultType = 0;
    }
    ShowingCardsValidationResult.ShowingCardsValidationResultType = {
        Unknown: 0,
        Invalid: 1,
        Valid: 2,
        TryToDump: 3,
        DumpingFail: 4,
        DumpingSuccess: 5,
    };
    return ShowingCardsValidationResult;
}());
