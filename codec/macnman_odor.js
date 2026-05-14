/**
* Macnman Analog Node Decoder (NH3 + H2S + Battery Voltage)
* Final Clean Version (UG67)
*/

function Decode(fPort, bytes) {

    try {

        var result = {};

        // ✅ Device validation
        if (bytes[1] !== 1) {
            return { error: "Unsupported device type" };
        }

        // ================================
        // Parse Analog Data (NH3 + H2S)
        // ================================
        var fieldIndex = 0;
        var i = 2;

        while (i < bytes.length - 6) {

            var type = bytes[i];

            switch (type) {

                case 0: // disabled
                    break;

                case 1: // current (skip)
                    i += 2;
                    break;

                case 2: // voltage → gas sensors

                    var raw = (bytes[i + 1] << 8) | bytes[i + 2];
                    var voltage = raw / 1000;

                    if (fieldIndex === 0) {
                        result.NH3 = voltage;
                    }
                    else if (fieldIndex === 1) {
                        result.H2S = voltage;
                    }

                    i += 2;
                    break;

                case 3: // digital (skip)
                    i += 2;
                    break;

                default:
                    break;
            }

            fieldIndex++;
            i++;
        }

        // ================================
        // Battery Voltage (FINAL FIX)
        // ================================
        var idx = bytes.length - 6;
        var rawBattery = (bytes[idx] << 8) | bytes[idx + 1];

        // ✅ Correct scaling → gives 8.04V
        result.battery_voltage = rawBattery / 100;

        return result;

    } catch (e) {
        return { error: e.message };
    }
}