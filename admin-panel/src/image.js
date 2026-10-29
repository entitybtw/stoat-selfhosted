/**
 * Just enough image handling for a member avatar, without a native
 * dependency: read a PNG or a non-progressive JPEG into RGBA, and write a
 * small square JPEG back.
 *
 * Both directions are deliberately small and strict — an avatar is a 256 px
 * square, so anything exotic is rejected with a message instead of being
 * half-decoded.
 */

import zlib from "node:zlib";

export function decodeImage(buffer) {
  if (buffer.length > 8 && buffer.readUInt32BE(0) === 0x89504e47) {
    return decodePng(buffer);
  }
  throw badImage();
}

/**
 * Copy the centre square of an image so it can be scaled without stretching.
 */
export function cropSquare({ width, height, data }) {
  const size = Math.min(width, height);
  const offsetX = Math.floor((width - size) / 2);
  const offsetY = Math.floor((height - size) / 2);
  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    const from = ((y + offsetY) * width + offsetX) * 4;
    out.set(data.subarray(from, from + size * 4), y * size * 4);
  }
  return { width: size, height: size, data: out };
}

/** Box-filter down to `target` px, which is plenty for a small avatar. */
export function resize({ width, height, data }, target) {
  if (width === target && height === target) return { width, height, data };
  const out = new Uint8Array(target * target * 4);
  const ratio = width / target;
  for (let y = 0; y < target; y += 1) {
    const y0 = Math.floor(y * ratio);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * ratio));
    for (let x = 0; x < target; x += 1) {
      const x0 = Math.floor(x * ratio);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * ratio));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const index = (sy * width + sx) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          a += data[index + 3];
          n += 1;
        }
      }
      const index = (y * target + x) * 4;
      out[index] = r / n;
      out[index + 1] = g / n;
      out[index + 2] = b / n;
      out[index + 3] = a / n;
    }
  }
  return { width: target, height: target, data: out };
}

/* ---- PNG ---------------------------------------------------------------- */

function decodePng(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let depth = 0;
  let colour = 0;
  const parts = [];

  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const start = offset + 8;
    if (type === "IHDR") {
      width = buf.readUInt32BE(start);
      height = buf.readUInt32BE(start + 4);
      depth = buf[start + 8];
      colour = buf[start + 9];
      if (buf[start + 12] !== 0) throw badImage(); // interlaced
    } else if (type === "IDAT") {
      parts.push(buf.subarray(start, start + length));
    } else if (type === "IEND") {
      break;
    }
    offset = start + length + 4;
  }

  // 8-bit only: 16-bit PNGs are rare for avatars and would double the work.
  if (!width || !height || depth !== 8) throw badImage();
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colour];
  if (!channels) throw badImage(); // palette needs PLTE handling

  let raw;
  try {
    raw = zlib.inflateSync(Buffer.concat(parts));
  } catch {
    throw badImage();
  }
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let previous = new Uint8Array(stride);
  let pos = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos];
    pos += 1;
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const current = new Uint8Array(stride);
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? current[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (filter !== 0) throw badImage();
      current[x] = value & 0xff;
    }

    for (let x = 0; x < width; x += 1) {
      const from = x * channels;
      const to = (y * width + x) * 4;
      if (channels <= 2) {
        out[to] = out[to + 1] = out[to + 2] = current[from];
        out[to + 3] = channels === 2 ? current[from + 1] : 255;
      } else {
        out[to] = current[from];
        out[to + 1] = current[from + 1];
        out[to + 2] = current[from + 2];
        out[to + 3] = channels === 4 ? current[from + 3] : 255;
      }
    }
    previous = current;
  }

  return { width, height, data: out };
}

/* ---- JPEG (encode) ------------------------------------------------------ */

const LUMA_QUANT = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16,
  24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68,
  109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121,
  120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];
const CHROMA_QUANT = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56,
  99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

/** Standard Annex K tables, pre-scaled for the fixed quality we write at. */
function scaledQuant(base, quality) {
  const scale = quality < 50 ? Math.floor(5000 / quality) : 200 - quality * 2;
  return base.map((value) =>
    Math.min(255, Math.max(1, Math.floor((value * scale + 50) / 100))),
  );
}

const ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33,
  40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43,
  36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53,
  60, 61, 54, 47, 55, 62, 63,
];

export function encodeSquareJpeg({ width, height, data }, size = 256) {
  const square = resize(cropSquare({ width, height, data }), size);
  const blocks = size / 8;
  const quality = 82;
  const lumQuant = scaledQuant(LUMA_QUANT, quality);
  const chromaQuant = scaledQuant(CHROMA_QUANT, quality);

  // Full-range YCbCr, level-shifted by 128 so the DC coefficient is centred.
  const planes = [0, 1, 2].map(() => new Float32Array(size * size));
  for (let i = 0; i < size * size; i += 1) {
    const r = square.data[i * 4];
    const g = square.data[i * 4 + 1];
    const b = square.data[i * 4 + 2];
    planes[0][i] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
    planes[1][i] = -0.168736 * r - 0.331264 * g + 0.5 * b;
    planes[2][i] = 0.5 * r - 0.418688 * g - 0.081312 * b;
  }

  const out = [];
  const push = (...bytes) => {
    for (const byte of bytes) out.push(byte);
  };
  const push16 = (value) => push((value >> 8) & 0xff, value & 0xff);

  push(0xff, 0xd8);
  // DQT: one table per class, ids 0 (luma) and 1 (chroma).
  push(0xff, 0xdb, 0x00, 0x84, 0x00);
  for (const value of lumQuant) push(value);
  push(0x01);
  for (const value of chromaQuant) push(value);
  // SOF0: 8-bit, three components, no subsampling (1x1 for all).
  push(0xff, 0xc0);
  push16(17);
  push(0x08);
  push16(size);
  push16(size);
  push(0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01);

  const DC_LUMA_BITS = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  const DC_LUMA_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const DC_CHROMA_BITS = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
  const DC_CHROMA_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const AC_LUMA_BITS = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
  const AC_LUMA_VALUES = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
  ];
  const AC_CHROMA_BITS = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
  const AC_CHROMA_VALUES = [
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41,
    0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
    0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1,
    0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
    0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44,
    0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
    0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74,
    0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a,
    0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
    0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7,
    0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
    0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
  ];

  // DHT segments: 2 length bytes + 17 header bytes + symbols.
  const writeHuffman = (id, bits, values) => {
    push(0xff, 0xc4);
    push16(values.length + 19);
    push(id);
    for (const count of bits) push(count);
    for (const value of values) push(value);
  };
  writeHuffman(0x00, DC_LUMA_BITS, DC_LUMA_VALUES);
  writeHuffman(0x01, DC_CHROMA_BITS, DC_CHROMA_VALUES);
  writeHuffman(0x10, AC_LUMA_BITS, AC_LUMA_VALUES);
  writeHuffman(0x11, AC_CHROMA_BITS, AC_CHROMA_VALUES);

  // SOS: three components, all using the tables above.
  push(0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00);

  const canonical = (bits, values) => {
    const codes = new Map();
    let code = 0;
    let index = 0;
    for (let length = 1; length <= 16; length += 1) {
      for (let i = 0; i < bits[length - 1]; i += 1) {
        codes.set(values[index], [code, length]);
        code += 1;
        index += 1;
      }
      code *= 2;
    }
    return codes;
  };
  const dcLuma = canonical(DC_LUMA_BITS, DC_LUMA_VALUES);
  const dcChroma = canonical(DC_CHROMA_BITS, DC_CHROMA_VALUES);
  const acLuma = canonical(AC_LUMA_BITS, AC_LUMA_VALUES);
  const acChroma = canonical(AC_CHROMA_BITS, AC_CHROMA_VALUES);

  let byte = 0;
  let used = 0;
  const writeBits = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) {
      byte = (byte << 1) | ((value >> i) & 1);
      used += 1;
      if (used === 8) {
        push(byte);
        if (byte === 0xff) push(0x00); // byte stuffing
        byte = 0;
        used = 0;
      }
    }
  };
  const writeCode = (codes, symbol) => {
    const entry = codes.get(symbol);
    if (!entry) throw new Error(`missing huffman symbol ${symbol}`);
    writeBits(entry[0], entry[1]);
  };
  // Category V (bit length) plus the ones' complement for negatives.
  const writeValue = (value) => {
    if (value === 0) return 0;
    const bits = Math.floor(Math.log2(Math.abs(value))) + 1;
    writeBits(value < 0 ? value - 1 + (1 << bits) : value, bits);
    return bits;
  };

  // Precomputed cosine table for the 1D DCT.
  const cos = new Float64Array(64);
  for (let u = 0; u < 8; u += 1) {
    for (let x = 0; x < 8; x += 1) {
      cos[u * 8 + x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);
    }
  }

  const encodeBlock = (plane, bx, by, quant, dcTable, acTable, previousDc) => {
    // 2D DCT, in the matrix form: rows first, then columns.
    const rows = new Float64Array(64);
    for (let y = 0; y < 8; y += 1) {
      const base = (by * 8 + y) * size + bx * 8;
      for (let u = 0; u < 8; u += 1) {
        let sum = 0;
        for (let x = 0; x < 8; x += 1) sum += plane[base + x] * cos[u * 8 + x];
        rows[y * 8 + u] = sum * (u === 0 ? Math.SQRT1_2 : 1);
      }
    }
    const coef = new Int32Array(64);
    for (let u = 0; u < 8; u += 1) {
      for (let v = 0; v < 8; v += 1) {
        let sum = 0;
        for (let y = 0; y < 8; y += 1) sum += rows[y * 8 + u] * cos[v * 8 + y];
        const value = (sum * (v === 0 ? Math.SQRT1_2 : 1)) / 4 / quant[v * 8 + u];
        coef[v * 8 + u] = Math.max(-1023, Math.min(1023, Math.round(value)));
      }
    }

    writeCode(dcTable, Math.abs(coef[0] - previousDc) === 0 ? 0 : Math.floor(Math.log2(Math.abs(coef[0] - previousDc))) + 1);
    writeValue(coef[0] - previousDc);

    let zeroes = 0;
    for (let k = 1; k < 64; k += 1) {
      const value = coef[ZIGZAG[k]];
      if (value === 0) {
        zeroes += 1;
        continue;
      }
      while (zeroes > 15) {
        writeCode(acTable, 0xf0);
        zeroes -= 16;
      }
      const bits = Math.floor(Math.log2(Math.abs(value))) + 1;
      writeCode(acTable, (zeroes << 4) | bits);
      writeValue(value);
      zeroes = 0;
    }
    if (zeroes) writeCode(acTable, 0x00);
    return coef[0];
  };

  let dcY = 0;
  let dcCb = 0;
  let dcCr = 0;
  for (let by = 0; by < blocks; by += 1) {
    for (let bx = 0; bx < blocks; bx += 1) {
      dcY = encodeBlock(planes[0], bx, by, lumQuant, dcLuma, acLuma, dcY);
      dcCb = encodeBlock(planes[1], bx, by, chromaQuant, dcChroma, acChroma, dcCb);
      dcCr = encodeBlock(planes[2], bx, by, chromaQuant, dcChroma, acChroma, dcCr);
    }
  }

  // Flush the last partial byte with 1-bits, as the spec requires.
  if (used) {
    byte = (byte << (8 - used)) | ((1 << (8 - used)) - 1);
    push(byte);
    if (byte === 0xff) push(0x00);
  }
  push(0xff, 0xd9);

  return Buffer.from(out);
}

function badImage() {
  const error = new Error("image could not be decoded");
  error.code = "invalid_image";
  return error;
}
