# AI Explain Selected Text

A lightweight Chrome extension that explains highlighted text on any webpage using the Gemini API.

## Files

- `extension/` — Load this folder as an unpacked extension in Chrome.
- `background.js` — Handles API calls to the Gemini API.
- `popup.html` / `popup.css` / `popup.js` — Extension popup UI for mode selection and settings.
- `content.js` / `content.css` — Injected into every page to capture text selection and show styled results.

## Requirements

- Chrome (Manifest V3)
- A Google API key with access to the Generative Language API

## Setup

1. Open **Chrome** → **Extensions** (`chrome://extensions/`)
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension` folder
4. Click the extension icon
5. Open **Settings (⚙️)** inside the popup
6. Paste your Gemini API key and save

## Usage

1. Open the extension popup and choose a mode:
   - ELI5
   - Technical
   - Bullets
   - Analogy
   - Translate
   - Custom
2. For **Custom**, enter your question and click **Save**
3. For **Translate**, enter a target language and click **Save**
4. On any page, highlight the text you want explained
5. Press **Ctrl+Enter**
6. A styled result box appears under the selection

In Settings you can also set a custom instruction and the LLM model. The default model is `gemini-3.1-flash-lite`.

## Model

Default model: `gemini-3.1-flash-lite`.

## License

MIT
