# SL_Display

Departure display for Stockholm's public transport (SL).

SL_Display is a static web application and CLI tool that shows upcoming departures for selected SL stations. It uses a fuzzy search algorithm compiled to WebAssembly and SL's public API.

## Features

- Fuzzy search implemented in C and compiled to WebAssembly
- Real-time departure information fetched from SL Integration API
- Static web frontend: HTML, CSS, JavaScript
- Command-line utility for quick station lookups

## Prerequisites

- Emscripten SDK
- `curl`, `jq`
- Node.js & npm (optional)
- GNU Make

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CasparEkroth/SL_Display.git
   cd SL_Display
   ```
2. Build the WebAssembly module:
   ```bash
   make
   ```
3. (Optional) Install `http-server` globally:
   ```bash
   npm install -g http-server
   ```

## Usage

### Web Application

Serve the files over HTTP:
```bash
http-server .
```
Open [http://localhost:8080](http://localhost:8080) in your browser, type a station name, and press Enter to view departures.

### Command-Line Script

```bash
./sl-deps.sh "<Station Name>"
```
Example:
```bash
./sl-deps.sh "T-Centralen"
```

## Project Structure

```
index.html       # Web frontend markup
styles.css       # Web frontend styles
index.js         # Frontend logic
wasm-loader.js   # WebAssembly loader helper
search.c         # C fuzzy search implementation
search.wasm      # Compiled WebAssembly module
sl-deps.sh       # CLI script for departures
Makefile         # Build rules
.gitignore       # Ignored files
```

## Contributing

Feel free to open issues or pull requests.

## Acknowledgments

- SL Integration API for departure data.
