import type { Type } from ".";
import { StarMax } from "../StarMax";

export class Pair implements Type<Pair> {
    status: number;
    pairStatus: number;

    deserialize(data: Uint8Array): Pair {
        this.status = data[0];
        this.pairStatus = data[1];
        return this;
    }

    static requestPair() {
        return StarMax.createRequest(1,[1]);
    }
}