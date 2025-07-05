import { PlayerEntity } from './player_entity.js';
import { CommonMethods } from './common_methods.js';
var GameState = /** @class */ (function () {
    function GameState() {
        this.Players = [];
        this.PlayerToIP = {};
        this.startNextHandStarter = new PlayerEntity();
    }
    GameState.prototype.CloneFrom = function (from) {
        this.Players = new Array(4);
        for (var i = 0; i < from.Players.length; i++) {
            var p = from.Players[i];
            if (p == undefined || p == null)
                continue;
            this.Players[i] = new PlayerEntity();
            this.Players[i].CloneFrom(p);
        }
        this.PlayerToIP = CommonMethods.deepCopy(from.PlayerToIP);
        this.startNextHandStarter = new PlayerEntity();
        if (from.startNextHandStarter != undefined)
            this.startNextHandStarter.CloneFrom(from.startNextHandStarter);
    };
    GameState.prototype.ArePlayersInSameTeam = function (playerId1, playerId2) {
        var index1 = -1;
        var index2 = -1;
        for (var i = 0; i < this.Players.length; i++) {
            var p = this.Players[i];
            if (p) {
                if (p.PlayerId == playerId1)
                    index1 = i;
                if (p.PlayerId == playerId2)
                    index2 = i;
            }
        }
        return index1 >= 0 && index2 >= 0 && index1 % 2 == index2 % 2;
    };
    return GameState;
}());
export { GameState };
