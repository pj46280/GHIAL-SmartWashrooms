function Decode(fPort, bytes) { 
  if (bytes.length < 6) { 
    return { errors: ["Invalid payload length"] }; 
  } 

  // Convert 4 bytes to float (little endian) 
  var bits = (bytes[3]<<24 | bytes[2]<<16 | bytes[1]<<8 | bytes[0]) >>> 0; 
  var sign = bits >> 31 ? -1 : 1; 
  var exp = (bits >> 23 & 0xFF) - 127; 
  var mant = bits & 0x7FFFFF | 0x800000; 
  var coverage = sign * mant * Math.pow(2, exp - 23); 

  return { 
    coverage: parseFloat(coverage.toFixed(2)), 
    detections: bytes[4], 
    wetness: bytes[5] 
  }; 
}
 