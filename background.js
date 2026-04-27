const api = typeof browser !== "undefined" ? browser : chrome;

api.action.onClicked.addListener((tab) => {
  if (!tab?.id || !tab.url?.startsWith("https://www.notion.so/")) {
    return;
  }

  api.tabs.sendMessage(tab.id, { action: "convert" }, () => {
    if (api.runtime.lastError) {
      console.warn("Failed to send convert message:", api.runtime.lastError.message);
    }
  });
});
