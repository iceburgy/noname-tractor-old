import { RoomSetting } from './room_setting.js';
import { GameState } from './game_state.js';
var RoomState = /** @class */ (function () {
    function RoomState() {
        this.RoomID = 0;
        this.roomSetting = new RoomSetting();
        this.CurrentGameState = new GameState();
    }
    RoomState.prototype.CloneFrom = function (from) {
        this.RoomID = from.RoomID;
        this.roomSetting.CloneFrom(from.roomSetting);
        this.CurrentGameState.CloneFrom(from.CurrentGameState);
    };
    return RoomState;
}());
export { RoomState };
