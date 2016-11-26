const server = "wss://jsonecho.herokuapp.com"
const bg = chrome.extension.getBackgroundPage()
// normalize ID
const nz = id => id.toLowerCase().replace(" ", "_")
var initiated = false

WebSocket.prototype.sendJSON = function(m) { this.send(JSON.stringify(m)) }

$( () => {
  if (typeof WebKitMutationObserver !== 'function') {
    $("body").append($("<h3>").text("PageMirror requires MutationObserver."))
    throw Error('PageMirror requires MutationObserver.');
  }

  let peer = location.href.match(/[?&]from=([^&]*)$/)[1];

  while (document.firstChild) {
    document.removeChild(document.firstChild);
  }

  var mirror = new TreeMirror(document, {
    createElement: tagName => {
      if (tagName == 'SCRIPT') {
        return $("<no-script>").css("display", "none")[0]
      }
    }
  });

  sock = new WebSocket(server);
  sock.onopen = () => {
    sock.sendJSON({id: nz(bg.id)})
    if (! initiated) {
      initiated = true
      sock.sendJSON({to: peer, begin: true})
    }
    sock.onmessage = (m) => {
      try { d = JSON.parse(m.data) }
      catch (err) { return }
      if (d.f)
        mirror[d.f].apply(mirror, d.args);
    };

    // sock.onclose = window.close
  }
});
