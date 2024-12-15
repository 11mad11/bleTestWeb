import { createType } from "../StarMax";

export default createType({
    name: "State",
    opId: -126,
    deserialize(data) {
        return {
            status: data[0],
            timeFormat: data[1],
            unitFormat: data[2],
            tempFormat: data[3],
            language: data[4],
            backlighting: data[5],
            screen: data[6],
            wristUp: data[7] == 1,
        }
    },
});