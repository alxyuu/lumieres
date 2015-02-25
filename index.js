var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Strip = require("./Strip.js");
var Color = require("./Color.js");

var myLight = new Strip("192.168.2.107", 59);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  socket.on('selectColor', function(color){
    myLight.fillColor(Color.getColor(color[0], color[1], color[2]));
  });
});

http.listen(80, function() {
    console.log("listening on *:80");
});