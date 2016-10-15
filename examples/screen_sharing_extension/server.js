// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import WebSocket from 'faye-websocket';

import http from 'http';
import fs from 'fs';

var server = http.createServer();

fs.readFile('mirror.html', (err, mirrorHTML) => {
  fs.readFile('mirror.js', (err, mirrorJS) => {
    fs.readFile('tree-mirror.js', (err, treeMirrorJS) => {

      server.addListener('request', (request, response) => {
        if (request.url == '/mirror.html' || request.url == '/' || request.url == '/index.html') {
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.end(mirrorHTML);
          return;
        }

        if (request.url == '/mirror.js') {
          response.writeHead(200, {'Content-Type': 'text/javascript'});
          response.end(mirrorJS);
          return;
        }

        if (request.url == '/tree-mirror.js') {
          response.writeHead(200, {'Content-Type': 'text/javascript'});
          response.end(treeMirrorJS);
          return;
        }

        console.error('unknown resource: ' + request.url);
      });
    });
  });
});

var messages = [];
var receivers = [];
var projector;

server.addListener('upgrade', (request, rawsocket, head) => {
  var socket = new WebSocket(request, rawsocket, head);

  // Projector.
  if (request.url == '/projector') {
    console.log('projector connection initiating.');

    if (projector) {
      console.log('closing existing projector. setting messages to 0');
      projector.close();
      messages.length = 0;
    }

    projector = socket;

    messages.push(JSON.stringify({ clear: true }));

    receivers.forEach(socket => {
      socket.send(messages[0]);
    });


    socket.onmessage = event => {
      console.log('message received. now at ' + messages.length + ' . sending to ' + receivers.length);
      receivers.forEach(receiver => {
        receiver.send(event.data);
      });

      messages.push(event.data);
    };

    socket.onclose = () => {
      console.log('projector closing, clearing messages');
      messages.length = 0;
      receivers.forEach(socket => {
        socket.send(JSON.stringify({ clear: true }));
      });

      projector = undefined;
    }

    console.log('projector open completed.')
    return;
  }

  // Receivers.
  if (request.url == '/receiver') {
    receivers.push(socket);

    console.log('receiver opened. now at ' + receivers.length + ' sending ' + messages.length + ' messages');
    socket.send(JSON.stringify(messages));


    socket.onclose = () => {
      var index = receivers.indexOf(socket);
      receivers.splice(index, 1);
      console.log('receiver closed. now at ' + receivers.length);
    }
  }
});

server.listen(8080);
