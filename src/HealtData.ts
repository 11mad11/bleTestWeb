export class HealthDetail {
    status: number = 0;
    totalSteps: number = 0;
    totalHeat: number = 0;
    totalDistance: number = 0;
    totalSleep: number = 0;
    totalDeepSleep: number = 0;
    totalLightSleep: number = 0;
    currentHeartRate: number = 0;
    currentFz: number = 0;
    currentSs: number = 0;
    currentBloodOxygen: number = 0;
    currentPressure: number = 0;
    currentMet: number = 0;
    currentMai: number = 0;
    currentTemp: number = 0;
    currentBloodSugar: number = 0;
    isWear: number = 0;
  
    static decode(buffer: Uint8Array): HealthDetail {
      const instance = new HealthDetail();
      let offset = 0;
  
      while (offset < buffer.length) {
        const key = decodeVarint(buffer, offset);
        offset += key.bytes;
  
        const fieldNumber = key.value >> 3;
        const wireType = key.value & 0x07;

        console.log(offset - key.bytes,fieldNumber,wireType)
  
        switch (fieldNumber) {
          case 1:
            if (wireType === 0) {
              instance.status = decodeVarint(buffer, offset).value;
              offset += decodeVarint(buffer, offset).bytes;
            }
            break;
          case 2:
            if (wireType === 0) {
              instance.totalSteps = decodeVarint(buffer, offset).value;
              offset += decodeVarint(buffer, offset).bytes;
            }
            break;
          // Add cases for other fields following the same pattern
          case 17:
            if (wireType === 0) {
              instance.isWear = decodeVarint(buffer, offset).value;
              offset += decodeVarint(buffer, offset).bytes;
            }
            break;
          default:
            // Skip unknown field
            offset += skipField(buffer, offset, wireType);
            break;
        }
      }
  
      return instance;
    }
  }
  
  // Helper functions for decoding Protobuf wire format
  function decodeVarint(buffer: Uint8Array, offset: number): { value: number; bytes: number } {
    let result = 0;
    let shift = 0;
    let bytes = 0;
  
    while (offset + bytes < buffer.length) {
      const byte = buffer[offset + bytes];
      result |= (byte & 0x7f) << shift;
      shift += 7;
      bytes++;
  
      if ((byte & 0x80) === 0) {
        return { value: result, bytes };
      }
    }
  
    throw new Error("Invalid varint encoding");
  }
  
  function skipField(buffer: Uint8Array, offset: number, wireType: number): number {
    switch (wireType) {
      case 0: // Varint
        return decodeVarint(buffer, offset).bytes;
      case 1: // Fixed64
        return 8;
      case 2: // Length-delimited
        const length = decodeVarint(buffer, offset).value;
        return decodeVarint(buffer, offset).bytes + length;
      case 5: // Fixed32
        return 4;
      default:
        throw new Error(`Unknown wire type: ${wireType}`);
    }
  }