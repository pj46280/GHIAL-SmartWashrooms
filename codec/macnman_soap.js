function Decode(fPort, bytes) {
    try {
        var result = {};

        if (!bytes || bytes.length < 8) {
            return { error: "Invalid payload" };
        }

        if (bytes[1] !== 16) {
            return { error: "Unsupported device type" };
        }

        var i = 1;

        var nameMap = ["level", "temperature", "humidity", "pressure", "windspeed"];

        while (i < bytes.length - 6) {
            var b = bytes[++i];

            var numRegisters = (b >> 5) & 0x07;
            var dataType = b & 0x1F;

            var name = nameMap[numRegisters] || ("sensor_" + numRegisters);

            if (dataType === 1) {
                var value = ((bytes[++i] << 8) | bytes[++i]) / 100;

                // ✅ REMOVE PRESSURE FIELD
                // if (name !== "pressure") {
                //     result[name] = value;
                // }
                if (name === "level") {
                    result[name] = value;
                }
                if (name === "battery_voltage") {
                    result["battery"] = value;
                }

            } 
            // else {
            //     var raw = (bytes[++i] << 8) | bytes[++i];

            //     // Also skip raw pressure if present
            //     if (name !== "pressure") {
            //         result[name + "_raw"] = raw;
            //     }
            // }
        }

        // ✅ Battery → Voltage
        var idx = bytes.length - 6;
        var rawBattery = (bytes[idx] << 8) | bytes[idx + 1];
        result.battery_voltage = rawBattery / 1000;

        return result;

    } catch (e) {
        return { error: e.message };
    }
}