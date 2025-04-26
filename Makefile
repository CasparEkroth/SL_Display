# === Config ===
CLANG = /opt/homebrew/opt/llvm/bin/clang
SYSROOT = /opt/homebrew/opt/wasi-libc/share/wasi-sysroot

CFLAGS = --target=wasm32-wasi --sysroot=$(SYSROOT) -O3 -nostartfiles -nodefaultlibs -Wl,--no-entry -lc
SRC = search.c
OUT = search.wasm

# === Targets ===

all: $(OUT)

$(OUT): $(SRC)
	@echo "[Clang] Building $(OUT) from $(SRC)"
	$(CLANG) $(CFLAGS) -o $(OUT) $(SRC)

clean:
	@echo "[Clean] Removing build artifacts"
	rm -f *.o *.wasm
