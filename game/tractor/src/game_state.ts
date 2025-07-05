
import { PlayerEntity } from './player_entity.js';
import { CommonMethods } from './common_methods.js';
export class GameState {
    public Players: PlayerEntity[]
    public PlayerToIP: {}
    public startNextHandStarter: PlayerEntity
    constructor() {
        this.Players = []
        this.PlayerToIP = {}
        this.startNextHandStarter = new PlayerEntity()
    }

    public CloneFrom(from: GameState) {
        this.Players = new Array(4)
        for (let i = 0; i < from.Players.length; i++) {
            var p = from.Players[i]
            if (p == undefined || p == null) continue
            this.Players[i] = new PlayerEntity()
            this.Players[i].CloneFrom(p)
        }
        this.PlayerToIP = CommonMethods.deepCopy<any>(from.PlayerToIP)
        this.startNextHandStarter = new PlayerEntity()
        if (from.startNextHandStarter != undefined) this.startNextHandStarter.CloneFrom(from.startNextHandStarter)
    }

    public ArePlayersInSameTeam(playerId1: string, playerId2: string): boolean {
        let index1 = -1;
        let index2 = -1;
        for (let i = 0; i < this.Players.length; i++) {
            let p: PlayerEntity = this.Players[i];
            if (p) {
                if (p.PlayerId == playerId1) index1 = i;
                if (p.PlayerId == playerId2) index2 = i;
            }
        }
        return index1 >= 0 && index2 >= 0 && index1 % 2 == index2 % 2;
    }
}