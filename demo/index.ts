import { StarMax } from "../src/StarMax";

{
    const btn = document.createElement("button");
    document.querySelector("#btns").append(btn);

    btn.textContent = "Pair";

    btn.addEventListener("click", async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9d"]
            });
            new Device(device);
        } catch (e) {
            log(e?.message ?? e)
        }
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
        document.querySelector("#btns").append(btn);

        btn.textContent = "Connect " + (device.name ?? device.id);

        btn.addEventListener("click", this.onClick.bind(this))
    }

    private async onClick() {
        try {
            log("Connecting...")
            const { write, notify } = await this.connect();
            notify.startNotifications();
            log("Connected")

            const starmax = new StarMax((data) => write.writeValueWithoutResponse(data));
            notify.addEventListener("characteristicvaluechanged", (ev) => {
                const array = (ev.target as any).value;
                if (!(array instanceof DataView))
                    throw new Error("Should have happened")
                let value = new Uint8Array(array.buffer);
                console.log("incoming", value.toString());
                starmax.notify(array);
            });

            (window as any).starmax = starmax;
            starmax.on("*", (o, d, opId) => {
                console.log(o, d, opId);
                log(JSON.stringify(o, undefined, 2));
                log(d.toString())
                if (o.status === 0)
                    log("Success")
            });

            const btns = document.querySelector("#btns");
            btns.innerHTML = "";

            btn("pair", () => {
                log("Sending pair request");
                starmax.pair();
            })
            btn("setTime", () => {
                log("Sending time data");
                starmax.setTime();
            })
            btn("getSportHistory", async () => {
                log("Sending rquest");
                const result = await starmax.getSportHistory();
                if ("currentSportId" in result) {
                    log(`You have done ${result.sportSecond} second of sport`);
                } else {
                    log("No sport hystory to fetch")
                }
            })
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

function btn(txt: string, cb: () => void) {
    const btn = document.createElement("button");
    document.querySelector("#btns").append(btn);
    btn.textContent = txt;
    btn.addEventListener("click", cb);
}

function log(txt: string) {
    document.querySelector("#log").append(txt + "\n");
}

function isWebBluetoothSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

if (isWebBluetoothSupported()) {
    log("Web Bluetooth may be supported!");
} else {
    log("Web Bluetooth is not supported in this browser.");
}