// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const promisify = require('util').promisify;
const WebSocket = require('ws');
const WebSocketServer = require('ws').Server;
const CDP = require('chrome-remote-interface');
const { start } = require('repl');

const requestedPort = 8090;
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

const server = http.createServer(requestHandler);
server.once('error', error => {
  if (process.send) {
    process.send('ERROR');
  }
  throw error;
});

server.once('listening', () => {
  // If port 0 was used, then requested and actual port will be different.
  const actualPort = server.address().port;
  if (process.send) {
    process.send(actualPort);
  }
  console.log(`Started hosted mode server at http://localhost:${actualPort}\n`);
});

// const sessions = new Map();
const wss = new WebSocketServer({server});


let extension = undefined;
let peers = new Map();

wss.on('connection', ws => {
  console.log('connected!');

  ws.on('message', (message) => {
    console.log(`received message: ${message}`);
    var data = JSON.parse(message);
    if (data.method === 'join') {
      console.log(`join!`);
      handleJoin(ws, data);
    } else if (data.method === 'cursor') {
      console.log(`cursor!`);
      handleCursor(ws, data);
    } else if (data.method === 'click') {
      console.log(`click!`);
      extension.send(JSON.stringify(data));
    }
    else {
      handleUnknown(ws, data);
    }
  });

  ws.on('close', () => {
    console.log('disconnected!');
    peers.delete(ws);
  });
});
  
server.listen(requestedPort);
startScreencast();

// ws handlers
function handleJoin(ws, data) {
  var params = data.params;
  if (params.role === 'extension') {
    extension = ws;
    console.log(`extension connected`);
    for (const [key, peer] of peers)  {
      extension.send(JSON.stringify({
        method: 'join',
        params: {
          role: peer.role,
          name: peer.name,
          color: peer.color || 'red',
        }
      }));
    }
  }
  else {
    peers.set(ws, {
      socket: ws,
      role: params.role,
      name: params.name,
      color: params.color || 'red',
    });

    if (!extension) {
      console.log('extension not connected');
      return;
    }

    extension.send(JSON.stringify({
      method: 'join',
      params: {
        role: params.role,
        name: params.name,
        color: params.color || 'red',
      }
    }));
  }
}

function handleCursor(ws, data) {
  var peer = peers.get(ws)
  if (peer && extension) {
    extension.send(JSON.stringify({
      method: 'cursor',
      params: {
        name: peer.name,
        x: data.params.x,
        y: data.params.y,
        color: peer.color,
      }}));
  } else {
    ws.send(JSON.stringify({
      error: 'unknown peer, please join the session first',
    }));
  }  
}

function handleUnknown(ws, data) {
  ws.send(JSON.stringify({
    error: 'unknown method',
  }));
}


// http handlers
async function requestHandler(req, resp) {
  console.log(`requestHandler: ${req.url}`);
  const parsedUrl = url.parse(req.url);

  console.log(`parsedUrl: ${parsedUrl.pathname}`);

  if (parsedUrl.pathname === "/discovery") {
    handleDiscovery(req, resp);
  } else if (parsedUrl.pathname === "/connect") {     
    handleLocalFile(resp, "/page.html");
  } else {
    handleLocalFile(resp, parsedUrl.pathname)
  }
}

async function startScreencast() {
  let client;
  try {
      // connect to endpoint
      client = await CDP();
      // extract domains
      const {Page} = client;
      await Page.enable();
      await Page.startScreencast({
          format: 'jpeg',
          quality: 80,
          everyNthFrame: 1,
      });
      Page.screencastFrame(async (params) => {
          // console.log(`Received screencast frame: ${params.data.length}`);
          Page.screencastFrameAck({sessionId: params.sessionId});
          for (const [key, peer] of peers) {
            peer.socket.send(JSON.stringify({
              method: 'Page.screencastFrame',
              params: params,
            }));
          }
      });
  } catch (err) {
      console.error(err);
  }
}


function handleDiscovery(req, resp) {
  http.get(`http://localhost:9222/json`, (response) => {
    try {
        resp.writeHead(200, { 'Content-Type': "application/json" });
        
        // Handle data chunks as they come in
        response.on('data', (chunk) => {
            resp.write(chunk);
        });
        
        // Handle the end of the response
        response.on('end', () => {
            resp.end();
        });
    } catch (err) {
        resp.write(`failed to get more response ${err}`);
        resp.end();
    }
  });
}

function handleLocalFile(resp, pathname) {
  const filePath = path.join(__dirname, 'static', pathname);
  fs.readFile(filePath, (err, data) => {
      if (err) {
        // Handle file not found or other errors
        resp.writeHead(404, { 'Content-Type': 'text/plain' });
        resp.end(`Got connected! But ${filePath} not found`);
      } else {
        // Determine the content type based on file extension
        const extname = path.extname(filePath);
        let contentType = 'text/html';
  
        switch (extname) {
          case '.js':
            contentType = 'text/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
        }
  
        // Set the appropriate content type header
        resp.writeHead(200, { 'Content-Type': contentType });
  
        // Send the file data as the response
        resp.end(data);
      }
    });    
}