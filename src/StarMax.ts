import { BufferReader } from "protobufjs";
import { Crc16 } from "./Crc16";
import { Type, TypeById, TypeByName } from "./types";

type Types = TypeById[keyof TypeById];
type EventCallback<T extends Types> = (obj: T, data: Uint8Array) => void;

export class StarMax {

    static types = TypeByName

    private listeners = new Map<Types, EventCallback<any>[] | undefined>();

    public notify(rawBuffer: Uint8Array) {
        if (rawBuffer[0] != 218)
            throw new Error("not the start or garbage");//TODO merge data, see: AbstractStarmaxNotify.notify

        const checkedData = rawBuffer.slice(0, rawBuffer.length - 2);
        const calculatedCrc = StarMax.int2byte(Crc16.calculate(checkedData), 2);
        const correctCrc = rawBuffer.slice(rawBuffer.length - 2);

        if (calculatedCrc[0] != correctCrc[0] || calculatedCrc[1] != correctCrc[1])
            throw new Error("CRC do not match")

        const length: number = StarMax.byteArray2Sum(checkedData.slice(2, 4));
        const data: Uint8Array = checkedData.slice(4, Math.min(length + 4, checkedData.length));
        const opId: number = checkedData[1] >= 128 ? checkedData[1] - 256 : checkedData[1];//convert to signed byte

        //tmp
        console.log("received", opId, data)
        const type = TypeById[opId];
        if (!type) {
            throw new Error("No type");
        }

        const instance = new type();
        if (!instance.deserialize) {
            throw new Error("Cannot deserialize");
        }

        console.log(instance.deserialize(data));
        //TODO send event
    }

    on<T extends Types>(type: T, callback: EventCallback<T>): () => void {
        let array = this.listeners.get(type);
        if (array) {
            array.push(callback);
        } else {
            array = [callback];
            this.listeners.set(type, array);
        }
        return () => {
            const i = array.findIndex(v => v === callback);
            if (i == -1)
                return;
            array.splice(i, 1);
        }
    }

    once<T extends Types>(type: T, callback: EventCallback<T>): () => void {
        const remove = this.on(type, (...args) => {
            callback(...args);
            remove();
        });
        return remove;
    }

    static createRequest(reqId: number, data?: number[]) {
        const length = data?.length ?? 0;
        const input = new Uint8Array([218, reqId, length & 255, length >> 8 & 255, ...data]);
        return StarMax.merge(input, StarMax.int2byte(Crc16.calculate(input), 2))
    }

    static byteArray2Sum(b: Uint8Array): number {
        let sum = 0;
        for (let i = 0; i < b.length; i++) {
            sum += (b[i] & 255) << (i * 8);
        }

        return sum;
    }

    static int2byte(s: number, size: number): Uint8Array {
        const targets = new Uint8Array(size);

        for (let i = 0; i < size; i++) {
            targets[i] = (s >> (8 * i)) & 255;
        }

        return targets;
    }

    static merge(...args: (Uint8Array | number)[]): Uint8Array {
        // Calculate the total length of the resulting Uint8Array
        const totalLength = args.reduce<number>((sum, arg) => {
            return sum + (arg instanceof Uint8Array ? arg.length : 1);
        }, 0);

        const result = new Uint8Array(totalLength);
        let offset = 0;

        for (const arg of args) {
            if (arg instanceof Uint8Array) {
                result.set(arg, offset);
                offset += arg.length;
            } else if (typeof arg === "number") {
                result[offset] = arg;
                offset++;
            } else {
                throw new TypeError("Invalid argument: only Uint8Array or number are allowed.");
            }
        }

        return result;
    }
}



