const server = "ws://127.0.0.1:1111"

let up   = JSON.parse( localStorage.getItem("up")   )
let down = JSON.parse( localStorage.getItem("down") )
let id   = JSON.parse( localStorage.getItem("id")   )
let to   = JSON.parse( localStorage.getItem("to")   )

current_tab = new Promise( (res) => {
	chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
		res(tabs[0])
	})
})
const toggle_up = () => { current_tab.then( tab => {
		up = !up
		localStorage.setItem("up", up)
		if (!up) { return false }
		chrome.tabs.sendMessage(tab.id, server);
})}
const toggle_down = () => { current_tab.then( tab => {
		down = !down
		localStorage.setItem("down", down)
		if (!down) { return false }
		url = chrome.extension.getURL('mirror.html?tabId=' + tab.id)
		chrome.tabs.create({ url });
})}

$( () => {
	if (up)
		$("#up").attr("checked", true)
	if (down)
		$("#down").attr("checked", true)
	$("#up")  .click( toggle_up )
	$("#down").click( toggle_down )
})
