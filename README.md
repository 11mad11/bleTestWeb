# StarMax SDK

The **StarMax SDK** is a JavaScript/TypeScript library designed for seamless communication with Bluetooth devices implementing the StarMax protocol. It provides a structured and efficient way to manage device interactions, send custom requests, and handle events such as pairing, fetching device states, and accessing sports history.

## Features

- **Device Interaction**: Supports pairing, setting time, and retrieving state or sports history.
- **Custom Requests**: Easily send tailored requests to StarMax devices.
- **Event Handling**: Subscribe to specific events or catch-all notifications.
- **Web Bluetooth API**: Integrates with the Web Bluetooth API for device discovery and communication.

## Getting Started

### Installation

You can add this SDK to your project via npm:

```bash
npm install @11mad11/starmax
```

### Usage

#### Pairing with a Device

```typescript
import { StarMax } from "@11mad11/starmax";

(async () => {
    const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9d"]
    });

    const gatt = await device.gatt.connect();
    const service = await gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9d");
    const write = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9d");
    const notify = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9d");

    const starmax = new StarMax(data => write.writeValueWithoutResponse(data));

    notify.addEventListener("characteristicvaluechanged", event => {
        const value = new Uint8Array((event.target as BluetoothRemoteGATTCharacteristic).value.buffer);
        starmax.notify(value);
    });
    await notify.startNotifications();

    // This is optional and only for UX
    await starmax.pair();
})();
```

#### Fetching Sport History

```typescript
const sportHistory = await starmax.getSportHistory();
if (sportHistory.currentSportId) {
    console.log(`You have done ${sportHistory.sportSecond} seconds of sport.`);
} else {
    console.log("No sport history available.");
}
```

### Event Handling

Listen to specific events or all notifications:

```typescript
starmax.on("State", (state, data) => {
    console.log("Device state:", state);
});

starmax.on("*", (data, raw, type) => {
    console.log(`Received data for type ${type}:`, data);
});
```

## API Documentation

### Core Class: `StarMax`

#### Constructor

```typescript
new StarMax(writeCallback: (data: Uint8Array) => void)
```

- `writeCallback`: Function to send data to the device.

#### Methods

- `pair(): Promise<Pair>`  
  Initiates the pairing process with the device.

- `getState(): Promise<State>`  
  Retrieves the current state of the device.

- `setTime(date: Date = new Date()): Promise<SetTime>`  
  Sets the device's time to the specified date.

- `getSportHistory(): Promise<SportHistory>`  
  Fetches the sport history from the device.

- `on(type: string, callback: EventCallback): () => void`  
  Subscribes to specific events.

- `on(type: string, callback: EventCallback): () => void`  
  Subscribes for a single specific events.

- `onceAsync(type: string): Promise<any>`  
  Waits for a single event asynchronously.

#### Static Utilities

- `StarMax.int2byte(number, size): Uint8Array`  
  Converts an integer to a byte array.

- `StarMax.merge(...arrays): Uint8Array`  
  Merges multiple byte arrays.

## Demo Application

A demo implementation using this SDK is provided in `demo/index.ts` and `index.html`. It includes functionality for pairing with a device, connecting, and sending commands via a web interface.

### Running the Demo

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/starmax-sdk.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start a local development server to serve the demo files:
   ```bash
   npm run start
   ```

### Web Interface

The demo includes buttons for pairing, setting time, and retrieving sport history, along with a log display for device responses.

## Browser Support

The library relies on the Web Bluetooth API, which is supported in most modern browsers like Chrome and Edge. Ensure Bluetooth permissions are enabled in your browser.

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue to suggest features or report bugs.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.