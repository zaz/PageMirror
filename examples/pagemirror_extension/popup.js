const bg = chrome.extension.getBackgroundPage()
// normalize ID
const nz = id => id.toLowerCase().replace(" ", "_")

bg.id   = localStorage.id   || ""
bg.peer = localStorage.peer || ""

const current_tab = new Promise( res => {
	chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
		res(tabs[0])
	})
})

const toggle_up = () => { current_tab.then( tab => {
		bg.up = !bg.up
		if (bg.up) {
			chrome.tabs.sendMessage(tab.id, {id: nz(bg.id), peer: nz(bg.peer)})
		} else {
			chrome.tabs.sendMessage(tab.id, false)
		}
})}
const toggle_down = () => { current_tab.then( tab => {
		bg.down = !bg.down
		if (bg.down) {
			let url = chrome.extension.getURL('mirror.html?from=' + nz(bg.peer))
			chrome.tabs.create({ url }, t => bg.t_id = t.id)
		} else {
			chrome.tabs.remove(bg.t_id)
		}
})}

$( () => {
	if (bg.up)
		$("#up").attr("checked", true)
	if (bg.down)
		$("#down").attr("checked", true)
	$("#id").val(bg.id)
	$("#peer").val(bg.peer)

	$("#up")  .change( toggle_up )
	$("#down").change( toggle_down )
	$("#id").change( () => {
		bg.id   = $("#id").val()
		if (bg.id) { localStorage.id = bg.id }
	})
	$("#peer").change( () => {
		bg.peer = $("#peer").val()
		if (bg.peer) { localStorage.peer = bg.peer }
	})
	$("input[type=text]").keypress( function(e) {
		new_text = $(this).val() + String.fromCharCode(e.which).toLowerCase()
		pattern = $(this).attr("pattern")
		if (new_text.match(pattern)) {
			$(this).val(new_text)
			       .change()
		}
		return false  // Cancel keypress (to avoid double entry)
	})
})
