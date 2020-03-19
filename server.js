const fs = require('fs');
const path = require('path');
const http = require('http');
const mime = require('mime');

const chatServer = require('./lib/chat-server');

const server = http.createServer();
const cache = {};

const send404 = res => {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.write('Error 404: resource not found.');
  res.end();
};

const sendFile = (res, filePath, fileContent) => {
  res.writeHead(200, { 'Content-Type': mime.getType(path.basename(filePath))});
  res.end(fileContent);
};

server.on('request', (req, res) => {
  const filePath = req.url === '/' ? './public/index.html' : `./public${req.url}`;
  
  if (cache[filePath]) {
    sendFile(res, filePath, cache[filePath]);
  } else {
    fs.exists(filePath, exist => {
      if (!exist) {
        return send404(res);
      }
      fs.readFile(filePath, (err, fileContent) => {
        if (err) {
          return send404(res);
        }
        cache[filePath] = fileContent;
        sendFile(res, filePath, fileContent);
      });
    });
  }
});

server.listen('3000', () => console.log('Server is running on http://localhost:3000.'));

chatServer.listen(server);

