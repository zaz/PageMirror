WebSocket.prototype.sendJSON = function(m) { this.send(JSON.stringify(m)) }

var observer;

if (typeof WebKitMutationObserver != 'function') {
  throw Error('PageMirror requires MutationObserver.');
}

chrome.runtime.onMessage.addListener( server => {

  // Add <base> so the recipient can download necessary CSS, images, &c.
  if ($("base").length < 1) {
    base = location.href.match(/^(.*\/)[^\/]*$/)[1]
    $("head").prepend($("<base>").attr("href", base))
    console.log('Added <base href="' + base + '">')
  }

  sock = new WebSocket(server);
  sock.onopen = () => {
    sock.sendJSON({id: "bob"})
  }
  sock.onmessage = m => {
    try { d = JSON.parse(m.data) }
    catch (err) { return; }
    if (! d.begin) { return; }

    var mirrorClient = new TreeMirrorClient(document, {
      initialize: (rootId, children) => {
        sock.sendJSON({
          to: 'joe',
          f: 'initialize',
          args: [rootId, children]
        });
      },

      applyChanged: (removed, addedOrMoved, attributes, text) => {
        sock.sendJSON({
          to: 'joe',
          f: 'applyChanged',
          args: [removed, addedOrMoved, attributes, text]
        });
      }
    });

    sock.onclose = mirrorClient.disconnect;
  };
});
