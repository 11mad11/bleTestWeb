import type { Type } from ".";
import { StarMax } from "../StarMax";


export class SportHistory implements Type<SportHistory> {
    status = NaN;
    length = 0;

    deserialize(data: Uint8Array) {
        this.status = data[0];
        this.length = 0;
        if (this.status == 0 && data.length > 1) {
            this.length = data[1];
            if (this.length > 0) {
                const currentSportDataLength = StarMax.byteArray2Sum(data.slice(3, 6));
                /*builder.setCurrentSportId(data[2]);
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
                }*/
            }
        }

        return this;
    }

}