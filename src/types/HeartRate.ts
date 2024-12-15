import type { Type } from ".";

export class HeartRate implements Type<HeartRate>{
    status = NaN;
    startHour = 0;
    startMinute = 0;
    endHour = 0;
    endMinute = 0;
    period = 0;
    alarmThreshold = 0;

    deserialize(data: Uint8Array) {
        this.status = (data[0]);
        this.startHour = (data[1]);
        this.startMinute = (data[2]);
        this.endHour = (data[3]);
        this.endMinute = (data[4]);
        this.period = (data[5]);
        this.alarmThreshold = (data[6] & 255);

        return this;
    }

}