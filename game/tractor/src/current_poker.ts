import { CommonMethods } from "./common_methods.js"
import { SuitEnums } from "./suit_enums.js"

export class CurrentPoker {
    public Rank: number
    public Cards: number[]
    public Trump: number
    constructor(cards?: any, suit?: any, rank?: any) {
        this.Cards = []
        for (let i = 0; i < 54; i++) {
            this.Cards[i] = 0
        }
        this.Rank = rank !== undefined ? rank : 0
        this.Trump = suit !== undefined ? suit : 0
        if (cards !== undefined) {
            var temp: number[] = cards as Array<number>
            temp.forEach(c => {
                this.AddCard(c)
            });
        }
    }

    public CloneFrom(cp: CurrentPoker) {
        this.Rank = cp.Rank;
        this.Trump = cp.Trump;
        this.Cards = CommonMethods.deepCopy<number[]>(cp.Cards)
    }

    //增加一张牌
    public AddCard(cn: number) {
        if (cn < 0 || cn > 53)
            return;
        this.Cards[cn] = this.Cards[cn] + 1;
    }

    //减少一张牌
    public RemoveCard(number: number) {
        if (number < 0 || number > 53)
            return;
        if (this.Cards[number] > 0) {
            this.Cards[number] = this.Cards[number] - 1;
        }
    }

    public Count(): number {
        return CommonMethods.ArraySum(this.Cards)
    }

    // 红桃
    public Hearts(): number[] {
        var temp: number[] = CommonMethods.ArrayCopy(this.Cards, 0, 13)
        return temp;
    }
    public HeartsNoRank(): number[] {
        let temp = this.Hearts();
        temp[this.Rank] = 0;
        return temp;
    }

    public HeartsNoRankTotal(): number {
        return CommonMethods.ArraySum(this.HeartsNoRank())
    }

    public HeartsRankTotal(): number {
        return this.Hearts()[this.Rank]
    }

    // 黑桃
    public Spades(): number[] {
        var temp: number[] = CommonMethods.ArrayCopy(this.Cards, 13, 13)
        return temp;
    }
    public SpadesNoRank(): number[] {
        let temp = this.Spades();
        temp[this.Rank] = 0;
        return temp;
    }

    public SpadesNoRankTotal(): number {
        return CommonMethods.ArraySum(this.SpadesNoRank())
    }

    public SpadesRankTotal(): number {
        return this.Spades()[this.Rank]
    }

    // 方块
    public Diamonds(): number[] {
        var temp: number[] = CommonMethods.ArrayCopy(this.Cards, 26, 13)
        return temp;
    }
    public DiamondsNoRank(): number[] {
        let temp = this.Diamonds();
        temp[this.Rank] = 0;
        return temp;
    }

    public DiamondsNoRankTotal(): number {
        return CommonMethods.ArraySum(this.DiamondsNoRank())
    }

    public DiamondsRankTotal(): number {
        return this.Diamonds()[this.Rank]
    }

    // 梅花
    public Clubs(): number[] {
        var temp: number[] = CommonMethods.ArrayCopy(this.Cards, 39, 13)
        return temp;
    }
    public ClubsNoRank(): number[] {
        let temp = this.Clubs();
        temp[this.Rank] = 0;
        return temp;
    }

    public ClubsNoRankTotal(): number {
        return CommonMethods.ArraySum(this.ClubsNoRank())
    }

    public ClubsRankTotal(): number {
        return this.Clubs()[this.Rank]
    }

    //大王
    public RedJoker(): number {
        return this.Cards[53];
    }

    //小王
    public BlackJoker(): number {
        return this.Cards[52];
    }

    //是否是混合出牌
    public IsMixed(): boolean {
        let c = [0, 0, 0, 0, 0]

        for (let i = 0; i < 13; i++) {
            if (this.HeartsNoRank()[i] > 0) {
                c[0]++;
                break;
            }
        }
        for (let i = 0; i < 13; i++) {
            if (this.SpadesNoRank()[i] > 0) {
                c[1]++;
                break;
            }
        }
        for (let i = 0; i < 13; i++) {
            if (this.DiamondsNoRank()[i] > 0) {
                c[2]++;
                break;
            }
        }
        for (let i = 0; i < 13; i++) {
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

        if (this.Trump != SuitEnums.Suit.Joker) c[4] = 0;
        return CommonMethods.ArraySum(c) > 1;
    }

    //是否有对
    public GetPairs(): number[] {
        let list: number[] = []
        for (let i = 0; i < 13; i++) {
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
    }

    public GetMasterPairs(): number[] {
        let list: number[] = []
        for (let i = 0; i < 13; i++) {
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
    }

    public GetPairsBySuit(asuit: number): number[] {
        if (asuit == this.Trump) {
            return this.GetMasterPairs();
        }
        return this.GetNoRankPairs(asuit);
    }

    //是否有拖拉机
    public HasTractors(): boolean {
        let list: number[] = this.GetPairs();
        if (list.length == 0) {
            return false;
        }

        if (this.GetTractor() == -1) {
            return false;
        }
        return true;
    }

    public GetTractor(): number {
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
            let a: number[] = this.GetSubRankPairs();

            let m = 12;
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
        for (let i = 12; i > 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            let m = i - 1;
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
    }

    public GetTractorBySuitInt(asuit: number): number {
        if (asuit == this.Trump) {
            return this.GetMasterTractor();
        }
        //顺序比较
        for (let i = 12; i > 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            let m = i - 1;
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
    }

    public GetTractorOfAnySuit(): number[] {
        let result: number[] = this.GetTractorBySuit(SuitEnums.Suit.Club);
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

        return []
    }

    public GetTractorBySuit(suit: number): number[] {
        let result = this.GetTractorUnsorted(suit);
        result.sort((n1, n2) => n1 - n2)
        return result;
    }

    private GetTractorUnsorted(suit: number): number[] {
        if (suit == this.Trump || suit == SuitEnums.Suit.Joker)
            return this.GetTrumpTractor();

        var result: number[] = []
        //顺序比较
        for (let i = 12; i > -1; i--) {
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
                    result = []
            }

            else if (suit == SuitEnums.Suit.Spade) {
                if (this.SpadesNoRank()[i] > 1)
                    result.push(i + 13);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }

            else if (suit == SuitEnums.Suit.Diamond) {
                if (this.DiamondsNoRank()[i] > 1)
                    result.push(i + 26);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }
            else if (suit == SuitEnums.Suit.Club) {
                if (this.ClubsNoRank()[i] > 1)
                    result.push(i + 39);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }
        }

        if (result.length <= 1)
            result = []

        return result;
    }

    public GetTrumpTractor(): number[] {
        let result: number[] = []
        //大小王
        if (this.RedJoker() == 2) {
            result.push(53);
        }
        //小王主花色
        if (this.BlackJoker() == 2) {
            result.push(52);
        }
        else
            result = []

        //主花色副花色
        if (this.Trump != SuitEnums.Suit.Joker) {
            //只有在不打无主时才考虑主级牌，从而打无主时副级牌+小王仍被视为拖拉机
            if (this.MasterRank() == 2)
                result.push((this.Trump - 1) * 13 + this.Rank);
            else if (result.length > 1)
                return result;
            else
                result = []
        }
        //副花色A时
        if (this.HasSubRankPairs()) {
            let a: number[] = this.GetSubRankPairs();
            result.push(a[0]);
        }
        else if (result.length > 1)
            return result;
        else
            result = []


        //顺序比较
        for (let i = 12; i >= 0; i--) {
            if (i == this.Rank) {
                continue;
            }

            if (this.Trump == SuitEnums.Suit.Heart) {
                if (this.HeartsNoRank()[i] > 1)
                    result.push(i);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }

            else if (this.Trump == SuitEnums.Suit.Spade) {
                if (this.SpadesNoRank()[i] > 1)
                    result.push(i + 13);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }

            else if (this.Trump == SuitEnums.Suit.Diamond) {
                if (this.DiamondsNoRank()[i] > 1)
                    result.push(i + 26);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }
            else if (this.Trump == SuitEnums.Suit.Club) {
                if (this.ClubsNoRank()[i] > 1)
                    result.push(i + 39);
                else if (result.length > 1)
                    return result;
                else
                    result = []
            }
        }

        if (result.length <= 1)
            result = []
        return result;
    }

    public GetMasterTractor(): number {
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
            let a: number[] = this.GetSubRankPairs();
            let m = this.Rank;
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
        for (let i = 12; i > 0; i--) {
            if (i == this.Rank) {
                continue;
            }
            let m = i - 1;
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
    }

    public GetSubRankPairs(): number[] {
        let list: number[] = []
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
    }

    public HasMasterRankPairs(): boolean {
        if (this.Rank > 12) {
            return false;
        }

        if (this.MasterRank() > 1) {
            return true;
        }
        return false;
    }

    public HasSubRankPairs(): boolean {
        if (this.Rank > 12) {
            return false;
        }

        let count = 0;
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
    }

    public GetTractorOtherCards(max: number): number[] {
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
            let a: number[] = this.GetSubRankPairs();
            return [(this.Trump - 1) * 13 + this.Rank, a[0], a[0]];
        }

        //副花色A时
        if (this.HasSubRankPairs()) {
            let a: number[] = this.GetSubRankPairs();

            if (a[0] == max) {
                let m = 12;
                if (this.Rank == 12) {
                    m = 11;
                }

                if ((this.Trump == 1) && (this.Hearts()[m] > 1)) {
                    return [a[0], m, m]
                }
                if ((this.Trump == 2) && (this.Spades()[m] > 1)) {
                    return [a[0], m + 13, m + 13]
                }
                if ((this.Trump == 3) && (this.Diamonds()[m] > 1)) {
                    return [a[0], m + 26, m + 26]
                }
                if ((this.Trump == 4) && (this.Clubs()[m] > 1)) {
                    return [a[0], m + 39, m + 39]
                }
            }
        }

        //顺序比较
        for (let i = 12; i > 0; i--) {
            if (this.Trump == 1) {
                let m = i - 1;
                if (m == this.Rank) {
                    m--;
                }
                if (m < 0) {
                    break;
                }

                if (max == i) {
                    if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                        return [i, m, m]
                    }
                }
            }
            if (this.Trump == 2) {
                if ((max - 13) == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }

                    if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                        return [i + 13, m + 13, m + 13]
                    }
                }
            }
            if (this.Trump == 3) {
                if ((max - 26) == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }

                    if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                        return [i + 26, m + 26, m + 26]
                    }
                }
            }
            if (this.Trump == 4) {
                if ((max - 39) == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }

                    if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                        return [i + 39, m + 39, m + 39]
                    }
                }
            }
        }

        //顺序比较
        for (let i = 12; i > 0; i--) {
            if (this.Trump != 1) {
                if (max == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.HeartsNoRank()[i] > 1) && (this.HeartsNoRank()[m] > 1)) {
                        return [i, m, m]
                    }
                }
            }
            if (this.Trump != 2) {
                if ((max - 13) == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.SpadesNoRank()[i] > 1) && (this.SpadesNoRank()[m] > 1)) {
                        return [i + 13, m + 13, m + 13]
                    }
                }
            }
            if (this.Trump != 3) {
                if ((max - 26) == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }

                    if ((this.DiamondsNoRank()[i] > 1) && (this.DiamondsNoRank()[m] > 1)) {
                        return [i + 26, m + 26, m + 26]
                    }
                }
            }
            if (this.Trump != 4) {
                if ((max - 39) == i) {
                    let m = i - 1;
                    if (m == this.Rank) {
                        m--;
                    }
                    if (m < 0) {
                        break;
                    }
                    if ((this.ClubsNoRank()[i] > 1) && (this.ClubsNoRank()[m] > 1)) {
                        return [i + 39, m + 39, m + 39]
                    }
                }
            }
        }

        return [];
    }

    public GetNoRankNoSuitTractor(): number {
        //顺序比较
        for (let i = 12; i > 0; i--) {
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
    }

    public MasterRank(): number {
        if (this.Trump == SuitEnums.Suit.Joker || this.Trump == 0)
            return 0;

        let index: number = (this.Trump - 1) * 13 + this.Rank;
        return this.Cards[index];
    }

    public SubRank(): number {
        return this.HeartsRankTotal() + this.SpadesRankTotal() + this.DiamondsRankTotal() + this.ClubsRankTotal() - this.MasterRank();
    }

    public GetMasterCardsCount(): number {
        let tmp = this.RedJoker() + this.BlackJoker() + this.MasterRank() + this.SubRank();
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
    }

    //比较单张副牌
    public CompareToSingle(number: number): boolean {
        let masterCards = this.GetMasterCardsCount();

        if (number >= 0 && number < 13) {
            for (let i = 12; i > -1; i--) {
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
            for (let i = 12; i > -1; i--) {
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
            for (let i = 12; i > -1; i--) {
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
            for (let i = 12; i > -1; i--) {
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
    }

    //比较对
    public CompareToPair(numbers: number[]): boolean {
        if (numbers.length >= 6) {
            return false;
        }

        var al: number[] = []
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
    }

    public GetNoRankPairs(asuit: number): number[] {
        var list: number[] = []

        if ((asuit == 1)) {
            for (let i = 0; i < 13; i++) {
                if (this.HeartsNoRank()[i] > 1) {
                    list.push(i);
                }
            }
        }
        else if ((asuit == 2)) {
            for (let i = 0; i < 13; i++) {
                if (this.SpadesNoRank()[i] > 1) {
                    list.push(i + 13);
                }
            }
        }
        else if ((asuit == 3)) {
            for (let i = 0; i < 13; i++) {
                if (this.DiamondsNoRank()[i] > 1) {
                    list.push(i + 26);
                }
            }
        }
        else if ((asuit == 4)) {
            for (let i = 0; i < 13; i++) {
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
    }

    public HasSomeCards(suit: number): boolean {
        if (suit == this.Trump) {
            let count = this.HeartsRankTotal() + this.SpadesRankTotal() + this.DiamondsRankTotal() + this.ClubsRankTotal();
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
    }

    public GetSuitCardsWithJokerAndRank(asuit: number): number[] {
        var list: number[] = []
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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
                for (let i = 0; i < 13; i++) {
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

        return list
    }

    public GetMaxCards(asuit: number): number {
        let rt = -1;

        if (asuit == 1) {
            for (let i = 12; i > -1; i--) {
                if (this.HeartsNoRank()[i] > 0) {
                    return i;
                }
            }
        }
        else if (asuit == 2) {
            for (let i = 12; i > -1; i--) {
                if (this.SpadesNoRank()[i] > 0) {
                    return i + 13;
                }
            }
        }
        else if (asuit == 3) {
            for (let i = 12; i > -1; i--) {
                if (this.DiamondsNoRank()[i] > 0) {
                    return i + 26;
                }
            }
        }
        else if (asuit == 4) {
            for (let i = 12; i > -1; i--) {
                if (this.ClubsNoRank()[i] > 0) {
                    return i + 39;
                }
            }
        }

        return rt;
    }

    public GetMinMasterCards(asuit: number): number {
        let rt = -1;

        if (asuit == 1) {
            for (let i = 0; i < 13; i++) {
                if (this.HeartsNoRank()[i] > 0) {
                    return i;
                }
            }
        }
        else if (asuit == 2) {
            for (let i = 0; i < 13; i++) {
                if (this.SpadesNoRank()[i] > 0) {
                    return i + 13;
                }
            }
        }
        else if (asuit == 3) {
            for (let i = 0; i < 13; i++) {
                if (this.DiamondsNoRank()[i] > 0) {
                    return i + 26;
                }
            }
        }
        else if (asuit == 4) {
            for (let i = 0; i < 13; i++) {
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
    }

    //全部清空
    public Clear() {
        this.Cards = new Array(54)
        this.Cards.fill(0)
    }

}
