import type { Type } from ".";
import { StarMax } from "../StarMax";

export class SetTime implements Type<SetTime> {
    status: number;

    deserialize(data: Uint8Array): SetTime {
        this.status = data[0];
        return this;
    }

    static request(date: Date = new Date()) {
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
        return StarMax.createRequest(8, values);
    }
}