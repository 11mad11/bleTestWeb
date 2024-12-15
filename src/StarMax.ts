import { Crc16 } from "./Crc16";
import HeartRate from "./types/HeartRate";
import Pair from "./types/Pair";
import SetTime from "./types/SetTime";
import SportHistory from "./types/SportHistory";
import State from "./types/State";

export class StarMax {
    private listeners = new Map<string, EventCallback<any>[] | undefined>();

    constructor(
        private write: BluetoothRemoteGATTCharacteristic,
        private notify: BluetoothRemoteGATTCharacteristic
    ) {
        notify.addEventListener("characteristicvaluechanged", (ev) => {
            const array = (ev.target as any).value;
            if (!(array instanceof DataView))
                throw new Error("ds")
            let value = new Uint8Array(array.buffer);
            console.log("incoming", value.toString());
            this._notify(value)
        })
    }

    _notify(rawBuffer: Uint8Array) {
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

        const result = type.deserialize(data);
        
        this.listeners.get(type.name)?.forEach(f=>{
            f(result,data);
        });
        this.listeners.get("*")?.forEach(f=>{
            f(result,data);
        });
    }

    on<T extends keyof TypeByName>(type: T | "*", callback: EventCallback<TypeByName[T]>): () => void {
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

    once<T extends keyof TypeByName>(type: T, callback: EventCallback<TypeByName[T]>): () => void {
        const remove = this.on(type, (...args) => {
            callback(...args);
            remove();
        });
        return remove;
    }

    onceAsync<T extends keyof TypeByName>(type: T): Promise<TypeByName[T]> {
        return new Promise((resolve)=>{
            const remove = this.on(type, (...args) => {
                resolve(args[0]);
                remove();
            });
        })
    }

    private sendRequest(reqId: number, data: number[] = []) {
        const length = data?.length;
        const input = new Uint8Array([218, reqId, length & 255, length >> 8 & 255, ...data]);
        const req =  StarMax.merge(input, StarMax.int2byte(Crc16.calculate(input), 2));
        return this.write.writeValueWithoutResponse(req);
    }

    //// Request section
    //Look in StarMaxSend.java for reference

    /**
     * Optional, will show a pairing screen
     * @returns 
     */
    pair(){
        this.sendRequest(1,[1]);
        return this.onceAsync("Pair")
    }

    getState(){
        this.sendRequest(2);
        return this.onceAsync("State")
    }

    setTime(date = new Date()){
        const year = date.getFullYear();
        const values = [
            year & 0xFF,           // Lower byte of the year
            (year >> 8) & 0xFF,    // Upper byte of the year
            date.getMonth() + 1, // Month (0-based in JS, so +1 for 1-based)
            date.getDate(),    // Day of the month
            date.getHours(),   // Hours (24-hour format)
            date.getMinutes(), // Minutes
            date.getSeconds(), // Seconds
            date.getTimezoneOffset() / -60 // Timezone offset in hours (negated)
        ];
        this.sendRequest(8, values);
        return this.onceAsync("SetTime")
    }

    getSportHistory(){
        this.sendRequest(97,[0]);
        return this.onceAsync("SportHistory")
    }

    //// Helper section

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

////

const TypeDefs = [
    State,Pair,SetTime,SportHistory,HeartRate
] as const
type TypeDefs = typeof TypeDefs;

const TypeById = TypeDefs.reduce((a,v)=>{
    a[v.opId] = v
    return a;
},{} as Record<number,TypeDefs[number]>)

////

type Types = ReturnType<TypeDefs[number]["deserialize"]>;

type NumericKeys<T> = Exclude<keyof T, keyof any[]>;
type TypeByName = {
    [key in NumericKeys<TypeDefs> as TypeDefs[key]["name"]]: ReturnType<TypeDefs[key]["deserialize"]>
};

type EventCallback<T extends Types> = (obj: T, data: Uint8Array) => void;

type Requests = Record<string, (this: StarMax) => Promise<any>>;
type TypeDef<N extends string, R extends Requests, T> = {
    name: N,
    opId: number,
    deserialize(data: Uint8Array): T
};
export function createType<N extends string, R extends Requests, T>(config: TypeDef<N, R, T>) {
    return config;
}

/*
case 69:
    return this.notifyNfcCardStatusInfo(data);
case 70:
    return this.notifyNfcM1Info(data);
case -127:
    return this.notifyPair(data);
case -126:
    return this.notifySetState(data);
case 3:
    return this.notifyFindPhone(data);
case -125:
    return this.notifyFindDevice(data);
case 4:
    return this.notifyCameraControl(data);
case -124:
    return this.notifyCameraControl(data);
case 5:
    return this.notifyPhoneControl(data);
case -123:
    return this.notifyPhoneControl(data);
case -122:
    return this.notifyPower(data);
case -121:
    return this.notifyVersion(data);
case -120:
    return this.notifySetTime(data);
case -119:
    return this.notifySetUserInfo(data);
case -118:
    return this.notifyGoals(data);
case -115:
    return this.notifyHealth(data);
case -114:
    return this.notifyHealthOpen(data);
case -112:
    return this.notifyCloseDevice(data);
case -110:
    return this.notifyShippingMode(data);
case -109:
    return this.notifyTimeOffset(data);
case -107:
    return this.notifyBtStatus(data);
case -106:
    return this.notifyCustomOnOff(data);
case -79:
    return this.notifyHeartRate(data);
case -78:
    return this.notifyContact(data);
case -77:
    return this.notifySos(data);
case -76:
    return this.notifyNotDisturb(data);
case -75:
    return this.notifySetClock(data);
case -74:
    return this.notifySetLongSit(data);
case -73:
    return this.notifySetDrinkWater(data);
case -72:
    return this.notifySendMessage(data);
case -71:
    return this.notifySetWeather(data);
case 58:
    return this.notifyMusicControl(data);
case -69:
    return this.notifyEventReminder(data);
case -68:
    return this.notifySportMode(data);
case -67:
    return this.notifySetWeatherSeven(data);
case -66:
    return this.notifyApps(data);
case -65:
    return this.notifyWorldClocks(data);
case -64:
    return this.notifyPassword(data);
case -63:
    return this.notifyFemaleHealth(data);
case -62:
    return this.notifyHealthMeasure(data);
case 67:
    return this.notifyHealthCalibrationStatus(data);
case -61:
    return this.notifyHealthCalibration(data);
case -60:
    return this.notifySummerWorldClock(data);
case -59:
    return this.notifyNfcCardInfo(data);
case -31:
    return this.notifySportHistory(data);
case -30:
    return this.notifyStepHistory(data);
case -29:
    return this.notifyHeartRateHistory(data);
case -28:
    return this.notifyBloodPressureHistory(data);
case -27:
    return this.notifyBloodOxygenHistory(data);
case -26:
    return this.notifyPressureHistory(data);
case -25:
    return this.notifyMetHistory(data);
case -24:
    return this.notifyTempHistory(data);
case -14:
    return this.notifyBloodSugarHistory(data);
case -23:
    return this.notifyValidHistoryDates(data);
case -22:
    return this.notifyFileInfo(data);
case -21:
    return this.notifyFile(data);
case -20:
    return this.notifyDialInfo(data);
case -19:
    return this.notifySwitchDial(data);
case -18:
    return this.notifyMai(data);
case -16:
    return this.notifyRealTimeOpen(data);
case -13:
    return this.notifyDiff(data);
case -12:
    return this.notifySleepHistory(data);
case -11:
    return this.notifyOriginSleepHistory(data);
case -10:
    return this.notifyRealTimeMeasure(data);
case -9:
    return this.notifyDebugInfo(data);
case -8:
    return this.notifyClearLogo(data);
case 113:
    return this.notifyRealTime(data);
case 117:
    return this.notifyOriginSleepHistory(data);
case 17:
    return this.notifyWristDetachment(data);
case 127:
    return this.notifyLog(data);
case -1:
    return this.notifyLog(data);
default:
    return this.notifyFailure();
*/