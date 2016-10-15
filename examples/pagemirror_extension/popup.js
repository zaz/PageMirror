const server = "ws://127.0.0.1:1111"

const to_tab = action => {
	chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
		console.log("tab ID: " + tabs[0].id)
		chrome.tabs.sendMessage(tabs[0].id, server);
		url = chrome.extension.getURL('mirror.html?tabId=' + tabs[0].id)
		chrome.tabs.create({ url });
	});
}

$( () => {
	$("#up")  .click( () => { to_tab("up")   } )
	$("#down").click( () => { to_tab("down") } )
})
