const REMOVE_NAL_TYPES = new Set([6, 9]); // SEI, AUD
const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'udta', 'meta', 'ilst', 'dinf', 'avc1', 'mp4a']);

function be32(buf, o) { return new DataView(buf.buffer, buf.byteOffset + o, 4).getUint32(0, false); }
function wr32(buf, o, v) { new DataView(buf.buffer, buf.byteOffset + o, 4).setUint32(0, v >>> 0, false); }
function be64(buf, o) { return Number(new DataView(buf.buffer, buf.byteOffset + o, 8).getBigUint64(0, false)); }
function wr64(buf, o, v) { new DataView(buf.buffer, buf.byteOffset + o, 8).setBigUint64(0, BigInt(v), false); }
function ascii(buf, start, end) { let s = ''; for (let i = start; i < end; i += 1) s += String.fromCharCode(buf[i]); return s; }
function bytesOfAscii(value) { return Uint8Array.from(String(value).split('').map(c => c.charCodeAt(0) & 255)); }
function indexOfBytes(data, needle, from = 0) {
  outer: for (let i = Math.max(0, from); i <= data.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) if (data[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

function parseBoxes(data, start = 0, end = data.length) {
  const out = [];
  let p = start;
  while (p + 8 <= end) {
    let size = be32(data, p);
    const type = ascii(data, p + 4, p + 8);
    let header = 8;
    if (size === 1) {
      if (p + 16 > end) break;
      size = be64(data, p + 8);
      header = 16;
    } else if (size === 0) size = end - p;
    if (size < header || p + size > end) break;
    const box = { type, start: p, header, end: p + size, children: [] };
    let childStart = p + header;
    if (type === 'meta') childStart += 4;
    else if (type === 'avc1' || type === 'mp4a') childStart = p + header + (type === 'avc1' ? 78 : 28);
    if (CONTAINERS.has(type) && childStart < p + size) box.children = parseBoxes(data, childStart, p + size);
    out.push(box);
    p += size;
  }
  return out;
}

function walk(boxes, fn) { for (const b of boxes) { fn(b); walk(b.children, fn); } }
function findPath(root, pathTypes) {
  let cur = [root];
  for (const t of pathTypes) {
    const nxt = [];
    for (const c of cur) nxt.push(...c.children.filter(x => x.type === t));
    cur = nxt;
  }
  return cur;
}
function parseStsz(data, box) {
  const p = box.start + box.header;
  const sampleSize = be32(data, p + 4);
  const count = be32(data, p + 8);
  if (sampleSize) return { sizes: Array(count).fill(sampleSize), tablePos: p + 12, fixed: true };
  const sizes = [];
  const q = p + 12;
  for (let i = 0; i < count; i += 1) sizes.push(be32(data, q + i * 4));
  return { sizes, tablePos: q, fixed: false };
}
function parseStco(data, box) {
  const p = box.start + box.header;
  const count = be32(data, p + 4);
  const q = p + 8;
  const arr = [];
  for (let i = 0; i < count; i += 1) arr.push(be32(data, q + i * 4));
  return { offsets: arr, tablePos: q };
}
function parseCo64(data, box) {
  const p = box.start + box.header;
  const count = be32(data, p + 4);
  const q = p + 8;
  const arr = [];
  for (let i = 0; i < count; i += 1) arr.push(be64(data, q + i * 8));
  return { offsets: arr, tablePos: q };
}
function parseStsc(data, box) {
  const p = box.start + box.header;
  const count = be32(data, p + 4);
  const q = p + 8;
  const entries = [];
  for (let i = 0; i < count; i += 1) entries.push([be32(data, q + i * 12), be32(data, q + i * 12 + 4), be32(data, q + i * 12 + 8)]);
  return entries;
}
function sampleOffsets(sizes, chunkOffsets, stsc) {
  const offs = [];
  let idx = 0;
  for (let ci = 1; ci <= chunkOffsets.length; ci += 1) {
    const co = chunkOffsets[ci - 1];
    let active = stsc[0];
    for (const e of stsc) { if (e[0] <= ci) active = e; else break; }
    let o = co;
    for (let k = 0; k < active[1]; k += 1) {
      if (idx >= sizes.length) break;
      offs.push(o);
      o += sizes[idx];
      idx += 1;
    }
  }
  return offs;
}
function avccRepackSample(sample) {
  const out = [];
  let p = 0;
  let removed = 0;
  while (p + 4 <= sample.length) {
    const sz = be32(sample, p);
    p += 4;
    if (sz === 0) { out.push(new Uint8Array([0, 0, 0, 0])); continue; }
    if (p + sz > sample.length) return { sample, delta: 0, removed, ok: false };
    const nal = sample.subarray(p, p + sz);
    p += sz;
    const typ = nal.length ? nal[0] & 0x1f : -1;
    if (REMOVE_NAL_TYPES.has(typ)) { removed += 1; continue; }
    const hdr = new Uint8Array(4);
    wr32(hdr, 0, nal.length);
    out.push(hdr, nal);
  }
  if (p < sample.length) out.push(sample.subarray(p));
  const packed = concatBytes(out);
  return { sample: packed, delta: sample.length - packed.length, removed, ok: true };
}
function concatBytes(parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
function patchTkhdMatrix(data) {
  const pos = indexOfBytes(data, bytesOfAscii('tkhd'));
  if (pos < 4) return;
  const start = pos - 4;
  if (be32(data, start) < 84 || data[start + 8] !== 0) return;
  const matrixStart = start + 48;
  if (matrixStart + 36 <= start + be32(data, start)) data.set(new Uint8Array([0, 0, 0, 1]), matrixStart + 4);
}
function shiftBefore(events, offset) {
  let s = 0;
  for (const [pos, delta] of events) { if (pos <= offset) s += delta; else break; }
  return s;
}
function hasH264SampleEntry(videoTrak) {
  return findPath(videoTrak, ['mdia', 'minf', 'stbl', 'stsd'])[0]?.children?.some(b => b.type === 'avc1') || false;
}

export async function runV5MobilePatcher(file, { onProgress } = {}) {
  if (!file) throw new Error('No selected video.');
  const buffer = await file.arrayBuffer();
  const mut = new Uint8Array(buffer.slice(0));
  const boxes = parseBoxes(mut);
  const moov = boxes.find(b => b.type === 'moov');
  const mdat = boxes.find(b => b.type === 'mdat');
  if (!moov || !mdat) throw new Error('moov/mdat was not found');
  onProgress?.(15);

  let videoTrak = null;
  for (const t of moov.children.filter(x => x.type === 'trak')) {
    const h = findPath(t, ['mdia', 'hdlr'])[0];
    if (!h) continue;
    const handler = ascii(mut, h.start + h.header + 8, h.start + h.header + 12);
    if (handler === 'vide') { videoTrak = t; break; }
  }
  if (!videoTrak) throw new Error('video track was not found');
  if (!hasH264SampleEntry(videoTrak)) throw new Error('V5 supports only H.264/AVC.');

  const stszBox = findPath(videoTrak, ['mdia', 'minf', 'stbl', 'stsz'])[0];
  const stscBox = findPath(videoTrak, ['mdia', 'minf', 'stbl', 'stsc'])[0];
  const stcoBox = findPath(videoTrak, ['mdia', 'minf', 'stbl', 'stco'])[0] || findPath(videoTrak, ['mdia', 'minf', 'stbl', 'co64'])[0];
  if (!stszBox || !stscBox || !stcoBox) throw new Error('video stsz/stsc/stco was not found');
  const stsz = parseStsz(mut, stszBox);
  if (stsz.fixed) throw new Error('Fixed-size sample table is not supported by V5 mobile patcher.');
  const { sizes, tablePos } = stsz;
  const chunk = stcoBox.type === 'stco' ? parseStco(mut, stcoBox) : parseCo64(mut, stcoBox);
  const stsc = parseStsc(mut, stscBox);
  const voffs = sampleOffsets(sizes, chunk.offsets, stsc);
  onProgress?.(35);

  const videoMap = new Map();
  const events = [];
  let totalDelta = 0;
  let removedNalCount = 0;
  const total = Math.min(voffs.length, sizes.length);
  for (let i = 0; i < total; i += 1) {
    const off = voffs[i];
    const sz = sizes[i];
    if (off < 0 || off + sz > mut.length) continue;
    const r = avccRepackSample(mut.subarray(off, off + sz));
    removedNalCount += r.removed || 0;
    if (!r.ok || !r.delta) continue;
    videoMap.set(off, { oldSize: sz, sample: r.sample });
    sizes[i] = r.sample.length;
    events.push([off + sz, r.delta]);
    totalDelta += r.delta;
    if ((i & 63) === 0) onProgress?.(35 + Math.round((i / Math.max(1, total)) * 35));
  }

  if (totalDelta > 0) {
    for (let i = 0; i < sizes.length; i += 1) wr32(mut, tablePos + i * 4, sizes[i]);
    events.sort((a, b) => a[0] - b[0]);
    walk([moov], b => {
      if (b.type === 'stco') {
        const x = parseStco(mut, b);
        x.offsets.forEach((o, i) => wr32(mut, x.tablePos + i * 4, o - shiftBefore(events, o)));
      } else if (b.type === 'co64') {
        const x = parseCo64(mut, b);
        x.offsets.forEach((o, i) => wr64(mut, x.tablePos + i * 8, o - shiftBefore(events, o)));
      }
    });
  }
  onProgress?.(80);

  const payloadStart = mdat.start + mdat.header;
  const payloadEnd = mdat.end;
  const out = [mut.subarray(0, payloadStart)];
  let p = payloadStart;
  for (const off of Array.from(videoMap.keys()).sort((a, b) => a - b)) {
    const { oldSize, sample } = videoMap.get(off);
    if (off < p) continue;
    out.push(mut.subarray(p, off), sample);
    p = off + oldSize;
  }
  out.push(mut.subarray(p, payloadEnd), mut.subarray(payloadEnd));
  const packed = concatBytes(out);
  if (totalDelta > 0) {
    const newMdatSize = (mdat.end - mdat.start) - totalDelta;
    if (mdat.header === 8) wr32(packed, mdat.start, newMdatSize);
    else wr64(packed, mdat.start + 8, newMdatSize);
  }
  patchTkhdMatrix(packed);
  onProgress?.(95);
  return new Blob([packed], { type: file.type || 'video/mp4' });
}
