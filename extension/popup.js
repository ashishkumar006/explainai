document.addEventListener("DOMContentLoaded", () => {
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const mainPanel = document.getElementById("main-panel");
  const apiKeyInput = document.getElementById("apiKey");
  const modelInput = document.getElementById("model");
  const customInstructionInput = document.getElementById("custom-instruction");
  const saveBtn = document.getElementById("save-btn");
  const settingsStatus = document.getElementById("settings-status");
  const modeButtons = document.querySelectorAll(".mode-btn");
  const customRow = document.getElementById("custom-row");
  const customQuestion = document.getElementById("custom-question");
  const saveCustomBtn = document.getElementById("save-custom");
  const translateRow = document.getElementById("translate-row");
  const targetLanguage = document.getElementById("target-language");
  const saveLangBtn = document.getElementById("save-lang");

  let activeMode = "eli5";

  settingsToggle.addEventListener("click", () => {
    const showingSettings = !settingsPanel.classList.contains("hidden");
    if (showingSettings) {
      settingsPanel.classList.add("hidden");
      mainPanel.classList.remove("hidden");
    } else {
      chrome.storage.sync.get(["apiKey", "model", "customInstruction"], (data) => {
        if (data.apiKey) apiKeyInput.value = data.apiKey;
        if (data.model) modelInput.value = data.model;
        if (data.customInstruction) customInstructionInput.value = data.customInstruction;
      });
      settingsPanel.classList.remove("hidden");
      mainPanel.classList.add("hidden");
    }
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set(
      {
        apiKey: apiKeyInput.value.trim(),
        model: modelInput.value.trim() || "gemini-3.1-flash-lite",
        customInstruction: customInstructionInput.value.trim(),
      },
      () => {
        settingsStatus.textContent = "Saved";
        setTimeout(() => (settingsStatus.textContent = ""), 1500);
      }
    );
  });

  function updateUI() {
    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === activeMode);
    });
    customRow.classList.add("hidden");
    translateRow.classList.add("hidden");
    if (activeMode === "custom") customRow.classList.remove("hidden");
    if (activeMode === "translate") translateRow.classList.remove("hidden");
  }

  chrome.storage.sync.get(["mode", "customQuestion", "targetLanguage"], (data) => {
    if (data.mode) activeMode = data.mode;
    if (data.customQuestion) customQuestion.value = data.customQuestion;
    if (data.targetLanguage) targetLanguage.value = data.targetLanguage;
    updateUI();
  });

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeMode = btn.dataset.mode;
      chrome.storage.sync.set({ mode: activeMode });
      updateUI();
    });
  });

  saveCustomBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ customQuestion: customQuestion.value.trim() });
  });

  saveLangBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ targetLanguage: targetLanguage.value.trim() });
  });
});
