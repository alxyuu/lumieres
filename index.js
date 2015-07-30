var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Strip = require("./Strip.js");
var SpacerStrip = require("./SpacerStrip.js");
var StripMapper = require("./StripMapper.js");

var strips = [
    new Strip("192.168.2.128", 45),
    new Strip("192.168.2.107", 50),
    new Strip("192.168.2.126", 59, true),
    new Strip("192.168.2.132", 41),
    new Strip("192.168.2.146", 104)
];

var map = new StripMapper();
map.addStrips(strips);

var mainLights = new StripMapper();
mainLights.addStrip(strips[2]);
mainLights.addStrip(strips[4]);

var sideLights = new StripMapper();
sideLights.addStrip(strips[0]);
sideLights.addStrip(strips[1]);
sideLights.addStrip(strips[3]);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  var lastRequest = 0;
  socket.on('selectColor', function(color){
    var requestTime = new Date().getTime();
    if (requestTime - lastRequest < 20) {
        //console.log(requestTime + ": too many requests, dropping");
    } else {
        lastRequest = requestTime;
        try {
            map.fillColor(color);
        } catch(err) {
            console.log(err);
        }
    }
  });
  socket.on('transitionColor', function(color) {
    map.fillColorWithTransition(color);
  });
  socket.on('lightsOn', function() {
    sideLights.fillColor([0, 0, 0]);
    mainLights.fillColorWithTransition([255, 205, 156]);
  });
  socket.on('lightsOff', function() {
    map.fillColorWithTransition([0, 0, 0]);
  });
  socket.on('transitionConfiguration', function(configuration) {
    map.transitionConfiguration(configuration);
  });
  socket.on('setMappedConfiguration', function(configuration) {
    map.show(configuration);
  });
  socket.on('effect', function() {
    map.effect(0);
  });
  socket.on('test', function() {
    map.test();
  });
});

http.listen(1337, function() {
    console.log("listening on *:1337");
});