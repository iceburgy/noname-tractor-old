export class YuezhanEntity {
    public owner: string;
    public dueDate: string;
    public participants: string[];
    constructor() {
        this.owner = "";
        this.dueDate = "";
        this.participants = [];
    }
    public CloneFrom(from: YuezhanEntity) {
        this.owner = from.owner;
        this.dueDate = from.dueDate;
        this.participants = from.participants;
    }
}
