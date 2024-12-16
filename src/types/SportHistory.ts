import { createType, StarMax } from "../StarMax";

export default createType({
    name: "SportHistory",
    opId: -31,
    deserialize(data) {
        const length = data[1];
        if (length == 0)
            return { status: data[0] }

        // Not used here. In the sdk, they use that and more to check if all the data are received,
        // but that seems redondent with the implemention of Starmax._notify and I wasn't sure how
        // to implement this here, so I removed it.
        //const currentSportDataLength = StarMax.byteArray2Sum(data.slice(3, 6));
        
        const currentSportId = data[2];
        const sliceData = data.slice(7);

        const heartRateLength = StarMax.byteArray2Sum(sliceData.slice(42, 44));
        const heartRateList: number[] = [];

        for (let i = 0; i < heartRateLength; i++) {
            heartRateList.push(sliceData[44 + i] & 255);
        }

        return {
            status: data[0],
            currentSportId,
            year: sliceData[0] + 2000,
            month: sliceData[1],
            day: sliceData[2],
            hour: sliceData[3],
            minute: sliceData[4],
            second: sliceData[5],
            sportSecond: StarMax.byteArray2Sum(sliceData.slice(6, 8)),
            type: sliceData[8],
            step: StarMax.byteArray2Sum(sliceData.slice(9, 13)),
            distance: StarMax.byteArray2Sum(sliceData.slice(13, 17)),
            speed: StarMax.byteArray2Sum(sliceData.slice(17, 19)),
            calorie: StarMax.byteArray2Sum(sliceData.slice(19, 23)),
            paceTime: StarMax.byteArray2Sum(sliceData.slice(23, 25)),
            stepFreqency: sliceData[25],
            heartRateAvg: sliceData[26],
            heartRateList
        }
    },
});