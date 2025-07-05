
export class ShowingCardsValidationResult {

    public CardsToShow: number[]
    public MustShowCardsForDumpingFail: number[]
    public PlayerId: string
    public ResultType: number
    constructor() {
        this.CardsToShow = []
        this.MustShowCardsForDumpingFail = []
        this.PlayerId = ""
        this.ResultType = 0
    }

    public static ShowingCardsValidationResultType = {
        Unknown: 0,
        Invalid: 1,
        Valid: 2,
        TryToDump: 3,
        DumpingFail: 4,
        DumpingSuccess: 5,
    }
}