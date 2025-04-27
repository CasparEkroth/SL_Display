let _wasm = null;
export async function getWasm() {
  if (_wasm) return _wasm;
  const res      = await fetch("search.wasm");
  const { instance } = await WebAssembly.instantiateStreaming(res);
  _wasm = { exports: instance.exports, memory: instance.exports.memory };
  return _wasm;
}

export function readCString(mem, ptr) {
  const bytes = new Uint8Array(mem.buffer, ptr);
  let len = 0;
  while (bytes[len]) len++;
  return new TextDecoder().decode(bytes.subarray(0, len));
}

export function readPointerArray(mem, ptr, count) {
  const view = new DataView(mem.buffer, ptr, count * 4);
  const out  = [];
  for (let i = 0; i < count; i++) {
    const strPtr = view.getUint32(i * 4, true);
    out.push(readCString(mem, strPtr));
  }
  return out;
}

export function allocString(mem, malloc, str) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(str + "\0");
  const ptr     = malloc(data.length);
  new Uint8Array(mem.buffer, ptr, data.length).set(data);
  return ptr;
}

export function allocStringArray(mem, malloc, list) {
  const ptrs = list.map(s => allocString(mem, malloc, s));
  const arrayPtr = malloc(ptrs.length * 4);
  const dv       = new DataView(mem.buffer, arrayPtr, ptrs.length * 4);
  ptrs.forEach((p, i) => dv.setUint32(i * 4, p, true));
  return { arrayPtr, stringPtrs: ptrs };
}
