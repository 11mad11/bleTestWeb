import { createType, StarMax } from "../StarMax";

export default createType({
    name: "SportHistory",
    opId: -31,
    deserialize(data) {
        const length = data[1];
        if (length == 0)
            return { status: data[0] }

        const currentSportDataLength = StarMax.byteArray2Sum(data.slice(3, 6));
        const currentSportId = data[2];
        const sliceData = data.slice(7);

        const notValid = sliceData.length !== currentSportDataLength;
        if (notValid)
            throw new Error("");//TODO wait for more data?

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

        /*if (this.status == 0 && data.length > 1) {
            this.length = data[1];
            if (this.length > 0) {
                const currentSportDataLength = StarMax.byteArray2Sum(data.slice(3, 6));
               builder.setCurrentSportId(data[2]);
                builder.setCurrentSportDataLength(currentSportDataLength);
                byte[] sliceData = ArraysKt.sliceArray(data, RangesKt.until(7, data.length));
                builder.setHasNext(this.notify.getWaitStoreData().length + sliceData.length != currentSportDataLength);
                builder.setNotValid(this.notify.getWaitStoreData().length + sliceData.length > currentSportDataLength);
                if (builder.getNotValid()) {
                    this.notify.setWaitStoreData(sliceData);
                } else if (builder.getHasNext()) {
               AbstractStarmaxNotify var7 = this.notify;
                    var7.setWaitStoreData(ArraysKt.plus(var7.getWaitStoreData(), sliceData));
                } else {
                    sliceData = ArraysKt.plus(this.notify.getWaitStoreData(), sliceData);
                    this.notify.setWaitStoreData(new byte[0]);
                    builder.setYear(sliceData[0] + 2000);
                    builder.setMonth(sliceData[1]);
                    builder.setDay(sliceData[2]);
                    builder.setHour(sliceData[3]);
                    builder.setMinute(sliceData[4]);
                    builder.setSecond(sliceData[5]);
                    builder.setSportSeconds(Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(6, 7))));
                    builder.setType(sliceData[8]);
                    builder.setSteps(Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(9, 12))));
                    builder.setDistance(Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(13, 16))));
                    builder.setSpeed(Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(17, 18))));
                    builder.setCalorie(Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(19, 22))));
                    builder.setPaceTime(Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(23, 24))));
                    builder.setStepFrequency(sliceData[25]);
                    builder.setHeartRateAvg(sliceData[26]);
               int heartRateLength = Utils.Companion.byteArray2Sum(ArraysKt.slice(sliceData, new IntRange(42, 43)));
               ArrayList heartRateList = new ArrayList();
 
                    for (int i = 0; i < heartRateLength; ++i) {
                        heartRateList.add(sliceData[44 + i] & 255);
                    }
 
                    builder.addAllHeartRateList((Iterable)heartRateList);
                }
            }
        }*/
        return {
            status: data[0],
            length,

        }
    },
});