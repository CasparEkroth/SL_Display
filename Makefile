# Makefile for building search.wasm with standalone Emscripten

# === Configuration ===
EMSDK_HOME := $(HOME)/emsdk
CC         := $(EMSDK_HOME)/upstream/emscripten/emcc
SRC        := search.c
OUT        := search.wasm

# === Flags ===
# Build a standalone WASM module exporting fuzzySearch, malloc, free
# and specify no-entry so we don't need a main()
CFLAGS     := -O3 \
               -s STANDALONE_WASM \
               -s EXPORTED_FUNCTIONS="['_fuzzySearch','_freeFuzzyResults','_malloc','_free']" \
               -Wl,--no-entry

.PHONY: all clean

# Default target
all: $(OUT)

# Build with emcc from your EMSDK_HOME
$(OUT): $(SRC)
	@echo "[EMCC] Using $(CC) to build $(OUT) from $(SRC)"
	$(CC) $(SRC) $(CFLAGS) -o $(OUT)

# Clean artifacts
clean:
	@echo "[Clean] Removing WASM output"
	rm -f $(OUT)