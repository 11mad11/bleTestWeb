import type { Type } from ".";
import { StarMax } from "../StarMax";

export class State implements Type<State> {
    status: number;
    timeFormat: number;
    unitFormat: number;
    tempFormat: number;
    language: number;
    backlighting: number;
    screen: number;
    wristUp: boolean;

    deserialize(data: Uint8Array): State {
        this.status = data[0];
        this.timeFormat = data[1];
        this.unitFormat = data[2];
        this.tempFormat = data[3];
        this.language = data[4];
        this.backlighting = data[5];
        this.screen = data[6];
        this.wristUp = data[7]==1;
        return this;
    }

    static requestGet() {
        return StarMax.createRequest(2);
    }
}