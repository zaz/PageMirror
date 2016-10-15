const server = "ws://127.0.0.1:1111"
var initiated = false

WebSocket.prototype.sendJSON = function(m) { this.send(JSON.stringify(m)) }

$( () => {
  if (typeof WebKitMutationObserver !== 'function') {
    $("body").append($("<h3>").text("PageMirror requires MutationObserver."))
    throw Error('PageMirror requires MutationObserver.');
  }

  var tabId = Number(location.href.match(/\?tabId=([0-9]*$)/)[1]);
  if (isNaN(tabId))
    return;

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
    sock.sendJSON({id: "joe"})
    if (! initiated) {
      initiated = true
      sock.sendJSON({to: "bob", begin: true})
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
