const server = "ws://127.0.0.1:1111"

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, server);
  chrome.tabs.create({ url: chrome.extension.getURL('mirror.html?tabId=' + tab.id) });
});
