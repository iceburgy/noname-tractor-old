
import { RoomSetting } from './room_setting.js';
import { GameState } from './game_state.js';
export class RoomState {
    public RoomID: number
    public roomSetting: RoomSetting
    public CurrentGameState: GameState
    constructor() {
        this.RoomID = 0
        this.roomSetting = new RoomSetting()
        this.CurrentGameState = new GameState()
    }
    public CloneFrom(from: RoomState) {
        this.RoomID = from.RoomID
        this.roomSetting.CloneFrom(from.roomSetting)
        this.CurrentGameState.CloneFrom(from.CurrentGameState)
    }
}
