# ExplainAI

A lightweight Chrome extension that explains selected text on any webpage using the Gemini API. Select text, press `Ctrl+Enter`, and get a styled inline explanation instantly.

## Features

- Inline popup modes: ELI5, Technical, Bullets, Analogy, Translate, Custom
- Saved mode + inputs: once setup is done, shortcut reuses it automatically
- Custom instruction in Settings to override AI behavior
- Styled result box with markdown-like rendering (bullets, bold, headers)
- Result scrolls with the page; closes on outside click or `Esc`

## Files

```text
extension/
  manifest.json
  background.js
  popup.html / popup.css / popup.js
  content.js / content.css
README.md
```

## Requirements

- Chrome (Manifest V3)
- A Google API key with access to the Generative Language API
- Model: `gemini-3.1-flash-lite` by default

## Setup

1. Open **Chrome** → **Extensions** (`chrome://extensions/`)
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension` folder
4. Click the **ExplainAI** extension icon
5. Open **Settings (⚙️)** inside the popup
6. Paste your Gemini API key
7. Optionally set a custom instruction and model, then **Save**

## Usage

1. Open the extension popup and choose a mode:
   - **ELI5**
   - **Technical**
   - **Bullets**
   - **Analogy**
   - **Translate**
   - **Custom**
2. For **Translate**, enter a target language and click **Save**
3. For **Custom**, enter your question and click **Save**
4. On any webpage, highlight the text you want explained
5. Press **Ctrl+Enter**
6. A styled result box appears just below the selected text

The result box scrolls with the page. Click outside it or press `Esc` to close it.

## Settings

| Field | Purpose |
|-------|---------|
| **Gemini API Key** | Your Google Generative Language API key |
| **Model** | LLM model name (default: `gemini-3.1-flash-lite`) |
| **Custom Instruction** | Optional system prompt to override default behaviors |

## Notes

- The extension sends only the selected text to the API — not the full page.
- All configuration is stored via `chrome.storage.sync`.
- If `Ctrl+Enter` conflicts with another extension or site shortcut, use `Ctrl+Shift+Enter`.

## License

MIT
