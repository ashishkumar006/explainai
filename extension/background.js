chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "explain") {
    handleExplain(message.payload, sendResponse);
    return true;
  }
});

async function handleExplain(payload, sendResponse) {
  const { selectedText, mode, customQuestion, targetLanguage, customInstruction } = payload;

  try {
    const config = await chrome.storage.sync.get(["apiKey", "model"]);

    if (!config.apiKey) {
      sendResponse({ ok: false, error: "Add your Gemini API key in extension settings." });
      return;
    }

    const model = config.model || "gemini-3.1-flash-lite";
    const systemPrompt = customInstruction || getDefaultSystemPrompt(mode);
    const userPrompt = buildPrompt(selectedText, mode, customQuestion, targetLanguage);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[AI Explain] API error:", response.status, errorBody);
      sendResponse({ ok: false, error: errorBody || `API error ${response.status}` });
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!reply) {
      sendResponse({ ok: false, error: "Empty response from model." });
      return;
    }

    sendResponse({ ok: true, text: reply });
  } catch (error) {
    console.error("[AI Explain] Request failed:", error);
    sendResponse({ ok: false, error: error.message || "Request failed." });
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
