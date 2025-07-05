
import { CurrentPoker } from './current_poker.js';
import { PlayerEntity } from './player_entity.js';
import { SuitEnums } from './suit_enums.js';
export class CommonMethods {
    public static storageFileForCardsKey = "storageFileForCards"
    public static SendJoinOrQuitYuezhan_REQUEST = "SendJoinOrQuitYuezhan"
    public static SendAwardOnlineBonus_REQUEST = "SendAwardOnlineBonus"

    public static SET_PLAYER_NAME_REQUEST = "set_player_name"
    public static PLAYER_CLIENT_TYPE_shengjiweb = "PlayerClientType_shengjiweb"
    public static PLAYER_CLIENT_TYPE_TLJAPP = "PlayerClientType_tljapp"
    public static PLAYER_ENTER_HALL_REQUEST = "PlayerEnterHall"
    public static JOIN_ROOM_REQUEST = "join_room"
    public static PREPARE_REQUEST = "prepare"
    public static ROOM_LIST_RESPONSE = "room_list"
    public static EXISTS_PLAYERS_RESPONSE = "exists_players"
    public static DEAL_POKER_RESPONSE = "deal_poker"
    public static NotifyGameHall_RESPONSE = "NotifyGameHall"
    public static NotifyOnlinePlayerList_RESPONSE = "NotifyOnlinePlayerList";
    public static NotifyDaojuInfo_RESPONSE = "NotifyDaojuInfo";
    public static NotifyGameRoomPlayerList_RESPONSE = "NotifyGameRoomPlayerList";
    public static NotifyMessage_RESPONSE = "NotifyMessage"
    public static NotifyRoomSetting_RESPONSE = "NotifyRoomSetting"
    public static NotifyGameState_RESPONSE = "NotifyGameState"
    public static NotifyCurrentHandState_RESPONSE = "NotifyCurrentHandState"
    public static NotifyCurrentTrickState_RESPONSE = "NotifyCurrentTrickState"
    public static GetDistributedCard_RESPONSE = "GetDistributedCard"
    public static NotifyCardsReady_RESPONSE = "NotifyCardsReady"
    public static NotifyDumpingValidationResult_RESPONSE = "NotifyDumpingValidationResult" // failure
    public static NotifyTryToDumpResult_RESPONSE = "NotifyTryToDumpResult" // both
    public static NotifyStartTimer_RESPONSE = "NotifyStartTimer" // both
    public static NotifyEmoji_RESPONSE = "NotifyEmoji"
    public static CutCardShoeCards_RESPONSE = "CutCardShoeCards"
    public static NotifyReplayState_RESPONSE = "NotifyReplayState"
    public static NotifyPing_RESPONSE = "NotifyPing"
    public static NotifySgcsPlayerUpdated_RESPONSE = "NotifySgcsPlayerUpdated"
    public static NotifyCreateCollectStar_RESPONSE = "NotifyCreateCollectStar"
    public static NotifyEndCollectStar_RESPONSE = "NotifyEndCollectStar"
    public static NotifyGrabStar_RESPONSE = "NotifyGrabStar"
    public static NotifyUpdateGobang_RESPONSE = "NotifyUpdateGobang"

    public static SendEmoji_REQUEST = "SendEmoji"
    public static SendBroadcast_REQUEST = "SendBroadcast"
    public static BuyNoDongtuUntil_REQUEST = "BuyNoDongtuUntil"
    public static PlayerHasCutCards_REQUEST = "PlayerHasCutCards"
    public static cardNumToValue: string[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    public static reenterRoomSignal = "断线重连中,请稍后...";
    public static resumeGameSignal = "牌局加载中,请稍后...";
    public static systemMsgPrefix = "【系统消息】：";

    public static wsErrorType_Insecure = "insecure";
    public static chatMaxLength = 100;
    public static danmuMaxLength = 30;

    public static zIndexGameMe = -1;
    public static zIndexDanmu = 10;
    public static zIndexFrameChat = 11;
    public static zIndexSettingsForm = 100;
    public static zIndexFrameGameHallOnliners = 1;
    public static zeroDuration = "00:00:00";
    public static OnlineBonusMunitesRequired = 60;

    public static gifferPrefix = "playerGiffer";

    public static winEmojiLength = 4
    public static danmuDuration = 8
    public static distributeLast8Delay = 0.2;
    public static distributeLast8Interval = 0.1;
    public static distributeLast8Duration = 0.5;
    public static animatedEmojiTypeLength = 7
    public static emojiMsgs: string[] = [
        "这波操作，666！",
        "哈哈哈哈~~",
        "不好意思，这个没出好",
        "没事儿",
        "能不能快点啊，兵贵神速！",
        "烟花",
        "嗯，没错儿",
        "有劳点击“开始”继续游戏",
        "有劳房主点击右上角“设置”，再点击“继续上盘牌局”",
        "不好意思，得撤了，最后一把咯",
        "谢谢大家",
        "拜拜",
        "好的",
        "Hi，大家好！",
        "不好意思，请稍等，马上回来",
    ]
    public static emojiIndexToKeyCodes: number[] = [
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        76,
        84,
        66,
        79,
        72,
        77,
    ]
    public static emojiKeyCodeToIndex: any = {
        "49": 0,
        "50": 1,
        "51": 2,
        "52": 3,
        "53": 4,
        "54": 5,
        "55": 6,
        "56": 7,
        "57": 8,
        "76": 9,
        "84": 10,
        "66": 11,
        "79": 12,
        "72": 13,
        "77": 14,
    }
    public static emojiWarningIntervalInSec = 3;
    public static emojiWarningMsg = `请不要过于频繁发送消息，每条消息间隔${CommonMethods.emojiWarningIntervalInSec}秒`
    public static hiddenEffectsWarningMsg = "隐藏技正在进行中，请稍后再试"
    public static nickNameOverridePassLength = 5
    public static cookieExpireInDays = 3650;
    public static recoverLoginPassFlag = "RecoverLoginPass";
    public static loginSuccessFlag = "LoginSuccess";
    public static qiangliangkaCost = 10;
    public static sendBroadcastPrefix = "@all";
    public static sendBroadcastCost = 10;
    public static buyNoDongtuUntilCost = 0;
    public static chatMessageCost = 0;
    public static defaultSkinInUse = "skin_questionmark";

    public static audioLiangpai = "liangpai";
    public static audioShuaicuo = "shuaicuo";

    public static audioRecoverhp = "audioRecoverhp";
    public static audioDraw = "audiodraw";
    public static audioDrawx = "audiodrawx";
    public static audioTie = "audiotie";
    public static audioWin = "audiowin";
    public static audioGameStart = "audioGameStart";
    public static audioEnterHall = "audioEnterHall";
    public static audioEnterRoom = "audioEnterRoom";
    public static audioCountdown8Sec = "audioCountdown8Sec";

    public static NotifyStateType_ObservePlayerById = "ObservePlayerById";
    public static classIsSuiteAvail = "classIsSuiteAvail";

    public static classCardProcessed = "classCardProcessed";
    public static cardTiltHeight = 30;
    public static cardBackIndex = 54;

    constructor() {
    }

    public static ArrayIsEqual(a: any[], b: any[]): boolean {
        if (a == null || b == null) {
            return false
        }
        if (a.length != b.length) {
            return false
        }
        for (let i = 0; i < a.length; i++) {
            if (!b.includes(a[i])) {
                return false;
            }
        }
        for (let i = 0; i < b.length; i++) {
            if (!a.includes(b[i])) {
                return false;
            }
        }
        return true
    }

    public static IncludesByPlayerID(a: PlayerEntity[], b: string): boolean {
        for (let i = 0; i < a.length; i++) {
            var p = a[i]
            if (p != null && p.PlayerId == b) {
                return true
            }
        }
        return false
    }

    public static GetReadyCount(a: PlayerEntity[]): number {
        var count = 0
        for (let i = 0; i < a.length; i++) {
            var p = a[i]
            if (p != null && p.IsReadyToStart) {
                count++
            }
        }
        return count
    }

    public static GetPlayerCount(a: PlayerEntity[]): number {
        var count = 0
        for (let i = 0; i < a.length; i++) {
            var p = a[i]
            if (p != null) {
                count++
            }
        }
        return count
    }

    public static GetPlayerIndexByID(a: PlayerEntity[], playerID: string): number {
        for (let i = 0; i < a.length; i++) {
            var p = a[i]
            if (p != null && p.PlayerId == playerID) {
                return i;
            }
        }
        return -1
    }

    public static GetPlayerByID(a: PlayerEntity[], playerID: string): PlayerEntity {
        var res: any;
        for (let i = 0; i < a.length; i++) {
            var p = a[i]
            if (p != null && p.PlayerId == playerID) {
                res = p;
            }
        }
        return res;
    }

    public static GetPlayerIndexByPos(a: PlayerEntity[], playerID: string, pos: number): number {
        let selfIndex = CommonMethods.GetPlayerIndexByID(a, playerID);
        return (selfIndex + (pos - 1)) % 4;
    }

    public static GetNextPlayerAfterThePlayer(a: PlayerEntity[], playerId: string): PlayerEntity {
        var thisPlayerIndex = CommonMethods.GetPlayerIndexByID(a, playerId)
        return a[(thisPlayerIndex + 1) % 4];
    }

    public static BuildCardNumMap() {
        //based on front_end\src\assets\poker.png
        //server:
        //红桃0-12
        //黑桃13-25
        //方块26-38
        //梅花39-51
        //小王52
        //大王53
        //UI:
        //红桃0-12
        //方块13-25
        //黑桃26-38
        //梅花39-51
        //大王52
        //小王53
        CommonMethods.ServerToUICardMap = []
        CommonMethods.UIToServerCardMap = []
        for (let i = 0; i < 13; i++) {
            if (i < 12) CommonMethods.ServerToUICardMap[i] = i + 1
            else CommonMethods.ServerToUICardMap[i] = i + 1 - 13
            if (i > 0) CommonMethods.UIToServerCardMap[i] = i - 1
            else CommonMethods.UIToServerCardMap[i] = i - 1 + 13
        }
        for (let i = 13; i < 26; i++) {
            if (i < 25) CommonMethods.ServerToUICardMap[i] = i + 1 + 13
            else CommonMethods.ServerToUICardMap[i] = i + 1 - 13 + 13
            if (i > 13) CommonMethods.UIToServerCardMap[i] = i - 1 + 13
            else CommonMethods.UIToServerCardMap[i] = i - 1 + 13 + 13
        }
        for (let i = 26; i < 39; i++) {
            if (i < 38) CommonMethods.ServerToUICardMap[i] = i + 1 - 13
            else CommonMethods.ServerToUICardMap[i] = i + 1 - 13 - 13
            if (i > 26) CommonMethods.UIToServerCardMap[i] = i - 1 - 13
            else CommonMethods.UIToServerCardMap[i] = i - 1 + 13 - 13
        }
        for (let i = 39; i < 52; i++) {
            if (i < 51) CommonMethods.ServerToUICardMap[i] = i + 1
            else CommonMethods.ServerToUICardMap[i] = i + 1 - 13
            if (i > 39) CommonMethods.UIToServerCardMap[i] = i - 1
            else CommonMethods.UIToServerCardMap[i] = i - 1 + 13
        }
        CommonMethods.ServerToUICardMap[52] = 53
        CommonMethods.UIToServerCardMap[52] = 53
        CommonMethods.ServerToUICardMap[53] = 52
        CommonMethods.UIToServerCardMap[53] = 52
        CommonMethods.ServerToUICardMap[54] = 54
        CommonMethods.UIToServerCardMap[54] = 54
    }

    public static ServerToUICardMap: number[]
    public static UIToServerCardMap: number[]

    public static ArrayCopy(from: any[], start: number, len: number): any[] {
        var to: any[] = []
        for (let i = start; i < start + len; i++) {
            to.push(from[i])
        }
        return to
    }

    public static ArraySum(from: number[]): number {
        let sum = 0;
        if (from == undefined) return sum
        from.forEach((element) => {
            sum += element;
        });
        return sum;
    }

    public static deepCopy<T>(instance: T): T {
        if (instance == null) {
            return instance;
        }

        // handle Dates
        if (instance instanceof Date) {
            return new Date(instance.getTime()) as any;
        }

        // handle Array types
        if (instance instanceof Array) {
            var cloneArr = [] as any[];
            (instance as any[]).forEach((value) => { cloneArr.push(value) });
            // for nested objects
            return cloneArr.map((value: any) => CommonMethods.deepCopy<any>(value)) as any;
        }
        // handle objects
        if (instance instanceof Object) {
            var copyInstance = {
                ...(instance as { [key: string]: any }
                )
            } as { [key: string]: any };
            for (var attr in instance) {
                if ((instance as Object).hasOwnProperty(attr))
                    copyInstance[attr] = CommonMethods.deepCopy<any>((instance as any)[attr]);
            }
            return copyInstance as T;
        }
        // handling primitive data types
        return instance;
    }

    public static ArrayRemoveOneByValue(arr: number[], value: number): number[] {
        var to: number[] = []
        let found = false
        for (let i = 0; i < arr.length; i++) {
            if (found || arr[i] != value) to.push(arr[i])
            else found = true
        }
        return to
    }

    public static ArrayMinus(arr1: number[], arr2: number[]): number[] {
        let res = this.deepCopy<number[]>(arr1);
        for (let i = 0; i < arr2.length; i++) {
            if (res.includes(arr2[i])) res = this.ArrayRemoveOneByValue(res, arr2[i]);
        }
        return res;
    }

    /// <summary>
    ///     得到一个牌的花色
    /// </summary>
    /// <param name="a">牌值</param>
    /// <returns>花色</returns>
    public static GetSuit(a: number): number {
        if (a >= 0 && a < 13) {
            return 1;
        }
        if (a >= 13 && a < 26) {
            return 2;
        }
        if (a >= 26 && a < 39) {
            return 3;
        }

        if (a >= 39 && a < 52) {
            return 4;
        }

        return 5;
    }

    public static GetSuitString(a: number): string {
        let suitInt = CommonMethods.GetSuit(a);
        let suit: number = suitInt;
        return SuitEnums.NumberToSuit[suit];
    }

    public static GetNumberString(a: number): string {
        if (a == 52) {
            return "Small";
        }
        if (a == 53) {
            return "Big";
        }
        return CommonMethods.cardNumToValue[a % 13];
    }

    public static GetScoreCardsScore(scoreCards: number[]): number {
        let points = 0;
        scoreCards.forEach(card => {
            if (card % 13 == 3)
                points += 5;
            else if (card % 13 == 8)
                points += 10;
            else if (card % 13 == 11)
                points += 10;

        })
        return points;
    }

    public static AllOnline(players: PlayerEntity[]): boolean {
        for (let i = 0; i < 4; i++) {
            if (players[i] == null || players[i].IsOffline) return false;

        }
        return true;
    }

    public static AllReady(players: PlayerEntity[]): boolean {
        for (let i = 0; i < 4; i++) {
            if (players[i] == null || !players[i].IsReadyToStart) return false;

        }
        return true;
    }

    public static SomeoneBecomesReady(oldOnes: PlayerEntity[], newOnes: PlayerEntity[]): boolean {
        for (let i = 0; i < 4; i++) {
            if ((oldOnes[i] == null || !oldOnes[i].IsReadyToStart) && (newOnes[i] != null && newOnes[i].IsReadyToStart)) return true;
        }
        return false;
    }

    /// <summary>
    ///     比较两张牌孰大孰小
    /// </summary>
    /// <param name="a">第一张牌</param>
    /// <param name="b">第二张牌</param>
    /// <param name="suit">主花色</param>
    /// <param name="rank">主Rank</param>
    /// <param name="firstSuit">第一张牌的花色</param>
    /// <returns>如果第一张大于等于第二张牌，返回true,否则返回false</returns>
    public static CompareTo(a: number, b: number, suit: number, rank: number, firstSuit: number): boolean {
        if ((a == -1) && (b == -1)) {
            return true;
        }
        if ((a == -1) && (b != -1)) {
            return false;
        }
        if ((a != -1) && (b == -1)) {
            return true;
        }

        let suit1 = this.GetSuitByTrumpAndRank(a, suit, rank);
        let suit2 = this.GetSuitByTrumpAndRank(b, suit, rank);

        if ((suit1 == firstSuit) && (suit2 != firstSuit)) {
            if (suit1 == suit) {
                return true;
            }
            if (suit2 == suit) {
                return false;
            }
            return true;
        }
        if ((suit1 != firstSuit) && (suit2 == firstSuit)) {
            if (suit1 == suit) {
                return true;
            }
            if (suit2 == suit) {
                return false;
            }

            return false;
        }

        if (a == 53) {
            return true;
        }

        if (a == 52) {
            if (b == 53) {
                return false;
            }
            return true;
        }
        if (b == 52) {
            if (a == 53) {
                return true;
            }
            return false;
        }


        if (a == (suit - 1) * 13 + rank) {
            if (b == 53 || b == 52) {
                return false;
            }
            return true;
        }
        if (a % 13 == rank) {
            if (b == 53 || b == 52 || (b == (suit - 1) * 13 + rank)) {
                return false;
            }
            return true;
        }
        if (b == (suit - 1) * 13 + rank) {
            if (a == 53 || a == 52) {
                return true;
            }
            return false;
        }
        if (b % 13 == rank) {
            if (a == 53 || a == 52 || (a == (suit - 1) * 13 + rank)) {
                return true;
            }
            return false;
        }
        if ((suit1 == suit) && (suit2 != suit)) {
            return true;
        }
        if ((suit1 != suit) && (suit2 == suit)) {
            return false;
        }
        if (suit1 == suit2) {
            return (a - b >= 0);
        }
        return true;
    }

    /// <summary>
    ///     得到一张牌的花色，如果是主，则返回主的花色
    /// </summary>
    /// <param name="a">牌值</param>
    /// <param name="suit">主花色</param>
    /// <param name="rank">主Rank</param>
    /// <returns>花色</returns>
    public static GetSuitByTrumpAndRank(a: number, suit: number, rank: number): number {
        let firstSuit: number = 0;

        if (a == 53 || a == 52) {
            firstSuit = suit;
        }
        else if ((a % 13) == rank) {
            firstSuit = suit;
        }
        else {
            firstSuit = CommonMethods.GetSuitByCardNumber(a);
        }

        return firstSuit;
    }

    /// <summary>
    ///     得到一个牌的花色
    /// </summary>
    /// <param name="a">牌值</param>
    /// <returns>花色</returns>
    public static GetSuitByCardNumber(a: number): number {
        if (a >= 0 && a < 13) {
            return 1;
        }
        if (a >= 13 && a < 26) {
            return 2;
        }
        if (a >= 26 && a < 39) {
            return 3;
        }

        if (a >= 39 && a < 52) {
            return 4;
        }

        return 5;
    }

    public static GetMaxCard(cards: number[], trump: number, rank: number): number {
        var cp = new CurrentPoker();
        cp.Trump = trump;
        cp.Rank = rank;
        cards.forEach(card => {
            cp.AddCard(card);
        })
        //cp.Sort();

        if (cp.IsMixed()) {
            return -1;
        }

        if (cp.RedJoker() > 0)
            return 53;
        if (cp.BlackJoker() > 0)
            return 52;
        if (cp.MasterRank() > 0)
            return rank + (trump - 1) * 13;

        if (cp.HeartsRankTotal() > 0)
            return rank;
        if (cp.SpadesRankTotal() > 0)
            return rank + 13;
        if (cp.DiamondsRankTotal() > 0)
            return rank + 26;
        if (cp.ClubsRankTotal() > 0)
            return rank + 39;

        for (let i = 51; i > -1; i--) {
            if (cards.includes(i))
                return i;
        }

        return -1;
    }

    public static GetRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    public static IsNumber(str: string) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    public static RotateArray(arr: any[], pivot: number): any[] {
        pivot = pivot % arr.length;
        return arr.slice(pivot, arr.length).concat(arr.slice(0, pivot));
    }

    public static getNumOfSuits(currentPoker: CurrentPoker): number {
        let num = 0;
        if (currentPoker == null) return num;
        for (let i = 1; i <= 4; i++) {
            if (currentPoker.HasSomeCards(i)) num++;
        }
        if (currentPoker.Trump == SuitEnums.Suit.Joker && currentPoker.HasSomeCards(5)) num++;
        return num;
    }

    public static isTouchDevice(): boolean {
        return ('ontouchstart' in window) || (window.matchMedia("(pointer: coarse)").matches);
    }

    public static GetCookieExpires() {
        var result = new Date();
        result.setDate(result.getDate() + CommonMethods.cookieExpireInDays);
        return result;
    }

    public static DateToISO8601(date: Date): string {
        // Get the timezone offset in minutes and convert it to hours and minutes
        let timezoneOffsetHours = Math.floor(date.getTimezoneOffset() / 60);
        var timezoneOffsetMinutes = date.getTimezoneOffset() % 60;

        // Format the date to ISO 8601 format with timezone
        return date.getFullYear() +
            '-' + CommonMethods.Pad(date.getMonth() + 1) +
            '-' + CommonMethods.Pad(date.getDate()) +
            'T' + CommonMethods.Pad(date.getHours()) +
            ':' + CommonMethods.Pad(date.getMinutes()) +
            ':' + CommonMethods.Pad(date.getSeconds()) +
            (date.getTimezoneOffset() < 0 ? '+' : '-') +
            CommonMethods.Pad(Math.abs(timezoneOffsetHours)) +
            ':' + CommonMethods.Pad(Math.abs(timezoneOffsetMinutes));
    }        // Function to add leading zeros to single-digit numbers

    public static Pad(number: number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }
}
