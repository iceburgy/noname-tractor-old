import { CommonMethods } from "./common_methods.js";
import { CurrentHandState } from "./current_hand_state.js";
import { CurrentTrickState } from "./current_trick_state.js";
var ReplayEntity = /** @class */ (function () {
    function ReplayEntity() {
        this.ReplayId = "";
        this.CurrentHandState = new CurrentHandState();
        this.CurrentTrickStates = [];
        this.Players = [];
        this.PlayerRanks = [];
    }
    ReplayEntity.prototype.CloneFrom = function (from) {
        this.ReplayId = from.ReplayId;
        this.CurrentHandState = new CurrentHandState();
        this.CurrentHandState.CloneFrom(from.CurrentHandState);
        this.CurrentTrickStates = [];
        for (var i = 0; i < from.CurrentTrickStates.length; i++) {
            this.CurrentTrickStates[i] = new CurrentTrickState();
            this.CurrentTrickStates[i].CloneFrom(from.CurrentTrickStates[i]);
        }
        this.Players = CommonMethods.deepCopy(from.Players);
        this.PlayerRanks = CommonMethods.deepCopy(from.PlayerRanks);
    };
    return ReplayEntity;
}());
export { ReplayEntity };
