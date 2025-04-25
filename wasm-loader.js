//######### web assembly #######

let _exportsPromise = null;

export function getWasmExports(){
    if (!_exportsPromise) {
    _exportsPromise = (async () => {
        const resp = await fetch('search.wasm');
        let instance;
        if ('instantiateStreaming' in WebAssembly) {
            ({ instance } = await WebAssembly.instantiateStreaming(resp));
        } else {
            const bytes = await resp.arrayBuffer();
            ({ instance } = await WebAssembly.instantiate(bytes));
        }
        return instance.exports;
    })();
    }
    return _exportsPromise;
}