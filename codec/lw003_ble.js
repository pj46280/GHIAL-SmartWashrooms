function Decode(fPort, bytes, variables) {

    var devices = {};
    var i = 0;
    var currentRssi = null;

    // -------------------------------------------------
    // Helper: convert signed RSSI
    // -------------------------------------------------
    function toSigned(val) {
        return val > 127 ? val - 256 : val;
    }

    // -------------------------------------------------
    // Main TLV scan loop
    // -------------------------------------------------
    while (i < bytes.length - 1) {

        var channel = bytes[i];
        var type = bytes[i + 1];

        // -------------------------------------------------
        // 1) RSSI block → channel 03/05/06/07 + type 69
        // -------------------------------------------------
        if ((channel === 0x03 || channel === 0x05 || channel === 0x06 || channel === 0x07) && type === 0x69) {

            // ensure enough bytes remain
            if (i + 4 >= bytes.length) break;

            currentRssi = toSigned(bytes[i + 2]);

            // move past TLV (channel + type + 3 bytes data)
            i += 5;
            continue;
        }

        // -------------------------------------------------
        // 2) MAC block → 0E 08 + 6 bytes MAC
        // -------------------------------------------------
        if (channel === 0x0E && type === 0x08) {

            // ensure full MAC exists
            if (i + 7 >= bytes.length) break;

            var macBytes = bytes.slice(i + 2, i + 8);

            var mac = macBytes
                .map(b => ('0' + b.toString(16)).slice(-2))
                .reverse()
                .join(':');

            // attach RSSI if available
            if (currentRssi !== null) {

                // keep strongest RSSI per MAC
                if (!devices[mac] || currentRssi > devices[mac].rssi) {
                    devices[mac] = {
                        mac: mac,
                        rssi: currentRssi,
                        tag_present: true
                    };
                }
            }

            currentRssi = null;

            // move index past MAC TLV
            i += 8;
            continue;
        }

        // -------------------------------------------------
        // 3) Unknown / misaligned byte → shift by 1
        // -------------------------------------------------
        i += 1;
    }
    // -------------------------------------------------
    // Final output
    // -------------------------------------------------
    return {
        devices: Object.values(devices)
    };
}