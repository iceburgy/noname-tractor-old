import { CommonMethods } from "./common_methods.js";
export var PlayerEntity = /** @class */ (function () {
    function PlayerEntity() {
        this.OfflineSince = "";
        this.PlayerId = "";
        this.PlayingSG = "";
        this.Rank = 0;
        this.Team = 0;
        this.IsReadyToStart = false;
        this.IsRobot = false;
        this.IsQiangliang = false;
        this.IsOffline = false;
        this.Observers = [];
    }
    PlayerEntity.prototype.CloneFrom = function (from) {
        this.OfflineSince = from.OfflineSince;
        this.PlayerId = from.PlayerId;
        this.PlayingSG = from.PlayingSG;
        this.Rank = from.Rank;
        this.Team = from.Team;
        this.IsReadyToStart = from.IsReadyToStart;
        this.IsRobot = from.IsRobot;
        this.IsQiangliang = from.IsQiangliang;
        this.IsOffline = from.IsOffline;
        this.Observers = CommonMethods.deepCopy(from.Observers);
    };
    PlayerEntity.GameTeam = [
        "None",
        "VerticalTeam",
        "HorizonTeam",
    ];
    return PlayerEntity;
}());
