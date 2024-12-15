import { createType } from "../StarMax";

export default createType({
    name: "Pair",
    opId: -127,
    deserialize(data) {
        return {
            status: data[0],
            pairStatus: data[1]
        }
    },
});