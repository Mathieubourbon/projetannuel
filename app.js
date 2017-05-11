var fs = require('fs'),
    net = require('net'),
    buffer = require('buffer'),
    stream = require('stream'),
    argv = require('yargs').argv,
    dgram = require('dgram'),
    http = require('http');

var HOST = '0.0.0.0';
var PORT = 6969;
var FILEPATH = "/home/mathieu/Documents/"
var CLIENTS = [];

//Listen for broadcast
var PORTBT = 6024;
var client = dgram.createSocket('udp4');
client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    client.setBroadcast(true);
});
client.on('message', function (message, rinfo) {
    console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ' + message);
    if(message == 'discovery'){
      CLIENTS.push(rinfo.address);
      broadcastResponse(rinfo.address);
    }
});
client.bind(PORTBT);

function broadcastResponse(ip){
  var client = new net.Socket();
  client.connect(PORT, ip, function() {
      console.log('CONNECTED TO: ' + ip + ':' + PORT);
      // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
      client.write('discovered');
      client.destroy();
  });
  // Add a 'close' event handler for the client socket
  client.on('close', function() {
      console.log('Connection closed');
  });
}

//
net.createServer(function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sock.on('data', function(data) {
      console.log('DATA: ' + data);
      if(data == 'Discovery'){
        CLIENTS.push(sock.remoteAddress);
      }
      sock.destroy();
    });
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

//Interface web
var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Salut tout le monde !');
});
server.listen(8080);
