document.addEventListener("keydown", async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    console.log("[AI Explain] Ctrl+Enter detected");
    await handleExplainShortcut();
  }
}, true);

async function handleExplainShortcut() {
  try {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    console.log("[AI Explain] Selected text length:", text.length);

    if (!text || text.length < 2) {
      console.log("[AI Explain] No text selected");
      return;
    }

    const storage = await getStorage(["mode", "apiKey", "model", "customInstruction", "customQuestion", "targetLanguage"]);
    const mode = storage.mode || "eli5";
    const apiKey = storage.apiKey;
    const model = storage.model || "gemini-3.1-flash-lite";
    const customInstruction = (storage.customInstruction || "").trim();

    console.log("[AI Explain] Mode:", mode, "Has key:", !!apiKey, "Has custom instruction:", !!customInstruction);

    if (!apiKey) {
      showFloatingResult("Missing API key. Open extension settings to add it.");
      return;
    }

    let finalCustomQuestion = (storage.customQuestion || "").trim();
    let finalTargetLanguage = (storage.targetLanguage || "").trim();

    if (mode === "custom" && !finalCustomQuestion) {
      const q = prompt("Ask your question about the selected text:");
      if (q === null) return;
      finalCustomQuestion = q.trim();
    } else if (mode === "translate" && !finalTargetLanguage) {
      const lang = prompt("Translate to which language?");
      if (lang === null) return;
      finalTargetLanguage = lang.trim();
    }

    const systemPrompt = customInstruction || getDefaultSystemPrompt(mode);
    const userPrompt = buildPrompt(text, mode, finalCustomQuestion, finalTargetLanguage);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const box = showFloatingResult("");
    box.innerHTML = '<div class="ai-explain-spinner"></div><span>Thinking...</span>';

    let rect;
    try {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    } catch (err) {
      rect = { left: 20, top: 20, bottom: 40, width: 200 };
    }
    positionResult(box, rect);
    console.log("[AI Explain] Box positioned, fetching from Gemini...");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });

    console.log("[AI Explain] API response status:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[AI Explain] API error:", response.status, errorBody);
      box.textContent = `API Error ${response.status}: ${errorBody}`;
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("[AI Explain] Reply length:", reply.length);

    if (!reply) {
      box.textContent = "Empty response from model.";
      return;
    }

    renderFormattedResult(box, reply);
  } catch (error) {
    console.error("[AI Explain] Shortcut error:", error);
    alert("[AI Explain Error] " + error.message);
  }
}

function getDefaultSystemPrompt(mode) {
  const map = {
    eli5: "You are a gentle teacher. Explain like the user is 5. Simple words, short sentences.",
    technical: "You are a senior engineer. Explain in precise technical terms. Be concise.",
    bullets: "You are a sharp analyst. Summarize in 3-6 bullet points.",
    analogy: "You are a creative storyteller. Explain with a relatable real-world analogy.",
    translate: "You are a professional translator. Translate preserving tone.",
    custom: "You are a knowledgeable tutor. Answer using only the provided text.",
  };
  return map[mode] || "You are a helpful AI tutor.";
}

function buildPrompt(selectedText, mode, customQuestion, targetLanguage) {
  if (mode === "translate")
    return `Original:\n${selectedText}\n\nTarget language: ${targetLanguage || "English"}`;
  if (mode === "custom")
    return `Text:\n${selectedText}\n\nQuestion: ${customQuestion || ""}`;
  return selectedText;
}

function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, (result) => resolve(result));
  });
}

function renderFormattedResult(box, rawText) {
  const escaped = (rawText || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const formatted = escaped
    .replace(/^### (.+)$/gm, '<div style="font-weight:700;font-size:12px;margin:8px 0 4px;">$1</div>')
    .replace(/^## (.+)$/gm, '<div style="font-weight:700;font-size:13px;margin:8px 0 4px;">$1</div>')
    .replace(/^# (.+)$/gm, '<div style="font-weight:700;font-size:14px;margin:8px 0 4px;">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\.\s+(.+)$/gm, (_, n, text) => `<div style="margin:2px 0;padding-left:18px;position:relative;line-height:1.6;"><span style="position:absolute;left:0;font-weight:600;">${n}.</span>${text}</div>`)
    .replace(/^[-•]\s+(.+)$/gm, (_, text) => `<div style="margin:2px 0;padding-left:16px;position:relative;line-height:1.6;"><span style="position:absolute;left:0;font-weight:700;">•</span>${text}</div>`);

  const html = formatted
    .split("\n")
    .map((line) => {
      if (line.startsWith("<div")) return line;
      if (line.trim() === "") return `<div style="height:4px;"></div>`;
      return `<div style="margin:2px 0;line-height:1.6;">${line}</div>`;
    })
    .join("");

  box.innerHTML = html;
}

function showFloatingResult(rawText) {
  let box = document.getElementById("ai-explain-floating-result");
  if (!box) {
    box = document.createElement("div");
    box.id = "ai-explain-floating-result";
    document.body.appendChild(box);
  }
  renderFormattedResult(box, rawText);
  Object.assign(box.style, {
    position: "absolute",
    zIndex: "2147483647",
    maxWidth: "420px",
    background: "#ffffff",
    border: "2px solid #4f46e5",
    borderRadius: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "13px",
    color: "#1f2937",
    padding: "14px 16px",
    maxHeight: "320px",
    overflowY: "auto",
    wordWrap: "break-word",
    lineHeight: "1.6",
  });
  return box;
}

function positionResult(box, rect) {
  const left = Math.max(10, rect.left);
  const maxWidth = Math.min(420, window.innerWidth - left - 16);
  box.style.left = `${window.scrollX + left}px`;
  box.style.top = `${window.scrollY + rect.bottom + 8}px`;
  box.style.maxWidth = `${maxWidth}px`;
}

function hideFloatingResult() {
  const box = document.getElementById("ai-explain-floating-result");
  if (box) box.remove();
}

document.addEventListener("click", hideFloatingResultOnOutsideClick);
function hideFloatingResultOnOutsideClick(e) {
  const box = document.getElementById("ai-explain-floating-result");
  if (box && !box.contains(e.target)) hideFloatingResult();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideFloatingResult();
});
