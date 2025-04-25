# Makefile for compiling C to WebAssembly (WASM)

# Source, object, and output
SRC       := search.c
OBJ       := $(SRC:.c=.o)
OUT       := search.wasm

# Detect Emscripten
EMCC      := $(shell command -v emcc)

# Homebrew prefixes (used by clang)
LLVM_PREFIX  := $(shell brew --prefix llvm 2>/dev/null)
WASI_PREFIX  := $(shell brew --prefix wasi-libc 2>/dev/null)
SYSROOT      := $(WASI_PREFIX)/share/wasi-sysroot
CLANG        := $(LLVM_PREFIX)/bin/clang

# Detect available WASM linkers
WASM_LD      := $(shell command -v wasm-ld)
LD_LLD      := $(shell command -v ld.lld)

.PHONY: all clean check_tools

# Default target
all: check_tools $(OUT)

# Ensure we have either emcc or a standalone WASM linker
check_tools:
ifeq ($(EMCC),)
  ifeq ($(WASM_LD),)
    ifeq ($(LD_LLD),)
      $(error No 'emcc', 'wasm-ld', or 'ld.lld' found. Install Emscripten or lld via Homebrew.)
    endif
  endif
endif

# Compile source to object (only for clang path)
$(OBJ): $(SRC)
ifeq ($(EMCC),)
	@echo "[Clang] Compiling $< -> $@"
	$(CLANG) --target=wasm32-wasi --sysroot=$(SYSROOT) -O3 -nostdlib -c -o $@ $<
endif

# Link to WASM or use emcc directly
$(OUT): $(OBJ)
ifeq ($(EMCC),)
	@echo "[Linker] Generating $@ with standalone WASM linker"
	@if [ -n "$(WASM_LD)" ]; then \
		$(WASM_LD) $(OBJ) -o $(OUT) --no-entry --export-all; \
	elif [ -n "$(LD_LLD)" ]; then \
		$(LD_LLD) $(OBJ) -o $(OUT) --no-entry --export-all; \
	fi
else
	@echo "[EMCC] Building with emcc"
	emcc $(SRC) -O3 -s STANDALONE_WASM -o $(OUT)
endif

# Clean build artifacts
clean:
	rm -f $(OBJ) $(OUT)