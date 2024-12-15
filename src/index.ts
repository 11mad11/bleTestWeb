
import { Crc16 } from "./Crc16";
import { HealthDetail } from "./HealtData";
import { StarMax } from "./StarMax";

{
    const btn = document.createElement("button");
    document.body.append(btn);

    btn.textContent = "Pair";

    btn.addEventListener("click", async () => {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9d"]
        });
        new Device(device);
    });
}

(async () => {
    const devices = await navigator.bluetooth.getDevices()
    devices.forEach((device) => {
        new Device(device);
    });

    navigator.bluetooth.addEventListener("advertisementreceived", (ev) => { console.log("adv:", ev); })
})();

class Device {
    constructor(
        public device: BluetoothDevice
    ) {
        const btn = document.createElement("button");
        document.body.append(btn);

        btn.textContent = "Connect " + (device.name ?? device.id);

        btn.addEventListener("click", this.onClick.bind(this))
    }

    private async onClick() {
        try {
            const { write, notify } = await this.connect();

            notify.addEventListener("characteristicvaluechanged", (ev) => {
                const array = (ev.target as any).value;
                if (!(array instanceof DataView))
                    throw new Error("ds")
                let value = new Uint8Array(array.buffer);
                console.log(value);
                console.log(value.toString());
                console.log('> ', new StarMax().notify(value));
            })
            await notify.startNotifications();
            console.log("started notification");

            await write.writeValueWithoutResponse(StarMax.types.Pair.requestPair());
            console.log("sent request", StarMax.types.Pair.requestPair());

            await write.writeValueWithoutResponse(StarMax.types.SetTime.request());
            console.log("sent request setTime", StarMax.types.SetTime.request());
        } catch (e) {
            console.error(e)
            throw e;
        }
    }

    async connect() {
        let cnt = 10;
        while (cnt-- > 0) {
            try {
                if (!this.device.gatt.connected) {
                    console.log("connecting...");
                    await this.device.gatt.connect();
                    console.log("connected", this.device.gatt);
                }

                const s = await this.device.gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9d");
                console.log("service", s);

                const write = await s.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9d");
                const notify = await s.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9d");
                console.log("Characteristics", { write, notify });
                return { write, notify };
            } catch (e) {
                console.error(e);
            }
        }
        throw new Error("Could not connect")
    }
}

class GeneratedMessageLite {
    private fields: Record<number, any>;

    constructor() {
        this.fields = {};
    }

    // Set a field by number
    setField(fieldNumber: number, value: any): void {
        this.fields[fieldNumber] = value;
    }

    // Get a field by number
    getField(fieldNumber: number): any {
        return this.fields[fieldNumber];
    }

    // Serialize fields into a Uint8Array (simplified, not full protobuf encoding)
    encode(): Uint8Array {
        const buffer: number[] = [];
        for (const [key, value] of Object.entries(this.fields)) {
            const fieldNumber = parseInt(key, 10);
            buffer.push(fieldNumber << 3 | this.getWireType(value)); // Field number and wire type
            if (typeof value === 'number') {
                buffer.push(...this.encodeVarint(value));
            } else if (typeof value === 'string') {
                const encoded = new TextEncoder().encode(value);
                buffer.push(...this.encodeVarint(encoded.length));
                buffer.push(...encoded);
            } else if (value instanceof Uint8Array) {
                buffer.push(...this.encodeVarint(value.length));
                buffer.push(...value);
            }
        }
        return new Uint8Array(buffer);
    }

    // Decode fields from a Uint8Array (simplified)
    static decode(data: Uint8Array): GeneratedMessageLite {
        const message = new GeneratedMessageLite();
        let index = 0;

        while (index < data.byteLength) {
            const key = data[index++];
            const fieldNumber = key >> 3;
            const wireType = key & 0x07;

            if (wireType === 0) { // Varint
                const [value, bytesRead] = GeneratedMessageLite.decodeVarint(data, index);
                message.setField(fieldNumber, value);
                index += bytesRead;
            } else if (wireType === 2) { // Length-delimited (string/bytes)
                const [length, lengthBytes] = GeneratedMessageLite.decodeVarint(data, index);
                index += lengthBytes;
                const value = data.slice(index, index + length);
                message.setField(fieldNumber, value);
                index += length;
            } else {
                throw new Error(`Unsupported wire type: ${wireType}`);
            }
        }

        return message;
    }

    // Get wire type based on value type
    private getWireType(value: any): number {
        if (typeof value === 'number') {
            return 0; // Varint
        } else if (typeof value === 'string' || value instanceof Uint8Array) {
            return 2; // Length-delimited
        }
        throw new Error("Unsupported field type");
    }

    // Encode a varint (simplified)
    private encodeVarint(value: number): number[] {
        const buffer: number[] = [];
        while (value > 0x7F) {
            buffer.push((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        buffer.push(value);
        return buffer;
    }

    // Decode a varint
    private static decodeVarint(data: Uint8Array, startIndex: number): [number, number] {
        let value = 0;
        let shift = 0;
        let bytesRead = 0;

        while (true) {
            const byte = data[startIndex + bytesRead];
            value |= (byte & 0x7F) << shift;
            bytesRead++;
            if ((byte & 0x80) === 0) {
                break;
            }
            shift += 7;
        }

        return [value, bytesRead];
    }
}

////
/*
const data = new Uint8Array([218, 225, 1, 0, 3, 126, 46]); // Example data

let a = [];
// Convert raw data bytes to hex values just for the sake of showing something.
// In the "real" world, you'd use data.getUint8, data.getUint16 or even
// TextDecoder to process raw data bytes.
for (let i = 0; i < data.byteLength; i++) {
    a.push('0x' + ('00' + data[i].toString(16)).slice(-2));
}
console.log('> ' + a.join(' '));

console.log(new Reader().notify(data));
*/
