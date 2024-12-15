import { HeartRate } from "./HeartRate";
import { Pair } from "./Pair";
import { SetTime } from "./SetTime";
import { SportHistory } from "./SportHistory";
import { State } from "./State"

interface Def {
    type: new () => Type<unknown>
    name: string
}

export const DefById = {
    [-127]: {
        type: Pair,
        name: "Pair"
    },
    [-126]: {
        type: State,
        name: "State"
    },
    [-120]: {
        type: SetTime,
        name: "SetTime"
    },
    [-79]: {
        type: HeartRate,
        name: "HeartRate"
    },
    [-31]: {
        type: SportHistory,
        name: "SportHistory"
    },
} as const satisfies Record<number, Def>;
export type DefById = typeof DefById;

export const TypeById: Record<number, new () => Type<unknown>> = Object.fromEntries(
    Object.entries(DefById).map(e=>[e[0],e[1].type])
);
export type TypeById = typeof TypeById;

export const TypeByName:{
    [key in keyof DefById as DefById[key]["name"]]: DefById[key]["type"]
} = Object.fromEntries(
    Object.entries(DefById).map(e=>[e[1].name,e[1].type])
) as any;
export type TypeByName = typeof TypeByName;

export interface Type<T> {

    /**
     * TODO
     */
    serialize?(): void;

    /**
     * unpack data in this object and return itself
     * @param data data to unpack
     */
    deserialize?(data: Uint8Array): T;
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