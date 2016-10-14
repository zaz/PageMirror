const server = "ws://127.0.0.1:1111"
var initiated = false

WebSocket.prototype.sendJSON = function(m) { this.send(JSON.stringify(m)) }

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded')
  if (typeof WebKitMutationObserver !== 'function') {
    var h3 = document.body.appendChild(document.createElement('h3'));
    h3.textContent = 'PageMirror requires MutationObserver.';
    throw Error('PageMirror requires MutationObserver.');
  }

  var tabId = Number(location.href.match(/\?tabId=([0-9]*$)/)[1]);
  if (isNaN(tabId))
    return;

  while (document.firstChild) {
    document.removeChild(document.firstChild);
  }

  var base;

  var mirror = new TreeMirror(document, {
    createElement: tagName => {
      if (tagName == 'SCRIPT') {
        var node = document.createElement('NO-SCRIPT');
        node.style.display = 'none';
        return node;
      }

      // if (tagName == 'HEAD') {
      //   var node = document.createElement('HEAD');
      //   node.appendChild(document.createElement('BASE'));
      //   node.firstChild.href = base;
      //   return node;
      // }
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
      console.log(d)
      // if (d.base)
        // base = document.head.appendChild(document.createElement('BASE'));
        // base.href = d.base
      if (d.f)
        mirror[d.f].apply(mirror, d.args);
    };

    // sock.onclose = window.close
  }

  var port = chrome.tabs.connect(tabId);

  // port.onMessage.addListener((msg) => {
  //   if (msg.base)
  //     base = msg.base;
  //   else
  //     mirror[msg.f].apply(mirror, msg.args);
  // });

  port.onDisconnect.addListener(msg => {
    // window.close();
  });
});
