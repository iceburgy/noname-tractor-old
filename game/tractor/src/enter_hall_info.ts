export class EnterHallInfo {
    public password: string
    public email: string
    public clientType: string
    constructor(pw: string, em: string, ct: string) {
        this.password = pw;
        this.email = em;
        this.clientType = ct;
    }
}
