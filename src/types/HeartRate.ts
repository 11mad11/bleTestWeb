import { createType } from "../StarMax";

export default createType({
    name: "HeartRate",
    opId: -79,
    deserialize(data) {
        return {
            status: data[0],
            startHour: data[1],
            startMinute: data[2],
            endHour: data[3],
            endMinute: data[4],
            period: data[5],
            alarmThreshold: data[6]& 255
        }
    },
});