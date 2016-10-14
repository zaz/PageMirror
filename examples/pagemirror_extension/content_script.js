WebSocket.prototype.sendJSON = function(m) { this.send(JSON.stringify(m)) }

var observer;

if (typeof WebKitMutationObserver != 'function') {
  throw Error('PageMirror requires MutationObserver.');
}

chrome.runtime.onMessage.addListener( server => {

  if (document.getElementsByTagName("base").length < 1) {
    fh = document.head.firstChild
    if (fh) {
      base = document.head.insertBefore(document.createElement("base"), fh)
    } else {
      base = document.head.appendChild(document.createElement("base"))
    }
    base.href = location.href.match(/^(.*\/)[^\/]*$/)[1]
    console.log(base.href)
  }

  sock = new WebSocket(server);
  sock.onopen = () => {
    sock.sendJSON({id: "bob"})
  }
  sock.onmessage = (m) => {
    // XXX check this area of code
    try { d = JSON.parse(m.data) }
    catch (err) { return; }
    console.log(d)
    if (! d.begin) { return; }

    sock.sendJSON({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] });
    // sock.send( location.href.match(/^(.*\/)[^\/]*$/)[1] );  // XXX DEBUG

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


chrome.extension.onConnect.addListener(port => {
  port.postMessage({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] });

  var mirrorClient = new TreeMirrorClient(document, {
    initialize: (rootId, children) => {
      port.postMessage({
        f: 'initialize',
        args: [rootId, children]
      });
    },

    applyChanged: (removed, addedOrMoved, attributes, text) => {
      port.postMessage({
        f: 'applyChanged',
        args: [removed, addedOrMoved, attributes, text]
      });
    }
  });

  port.onDisconnect.addListener(() => {
    mirrorClient.disconnect();
  });
});
