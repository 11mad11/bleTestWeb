import { createType } from "../StarMax";

export default createType({
    name: "SetTime",
    opId: -120,
    deserialize(data) {
        return {
            status: data[0]
        }
    },
});