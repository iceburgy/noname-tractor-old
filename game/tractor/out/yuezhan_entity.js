var YuezhanEntity = /** @class */ (function () {
    function YuezhanEntity() {
        this.owner = "";
        this.dueDate = "";
        this.participants = [];
    }
    YuezhanEntity.prototype.CloneFrom = function (from) {
        this.owner = from.owner;
        this.dueDate = from.dueDate;
        this.participants = from.participants;
    };
    return YuezhanEntity;
}());
export { YuezhanEntity };
