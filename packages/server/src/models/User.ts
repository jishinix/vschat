import { RawUserData } from "../services/UserLoader";


export class User {
    username: string; // muss extra angegeben sein um im cache als pointer zu fungieren.
    constructor(public data: RawUserData) {
        this.username = data.username;

    }
}