var dgram = require('dgram');
var Color = require('./Color.js');

function Strip(address, ledCount) {
    var me = new Object();
    me.address = address;
    me.ledCount = ledCount;
    me.lastConfiguration = [];
    me.socket = dgram.createSocket("udp4");
    
    for (var i = 0; i < me.ledCount; i++) {
        me.lastConfiguration[i] = Color.getColor(0, 0, 0);
    }
    
    this.getLastConfiguration = function() {
        return me.lastConfiguration;
    };
    
    this.show = function(configuration) {
        if (configuration.length > me.ledCount) {
            console.log("Received too many lights for configuration, truncating.");
            configuration = configuration.slice(0, me.ledCount);
        } else if (configuration.length < me.ledCount) {
            console.log("Received too few lights for configuration, padding.");
            for(var i = configuration.length; i < me.ledCount; i++) {
                configuration[i] = Color.getColor(0, 0, 0);
            }
        }
        
        var buffer = new Buffer(3 * me.ledCount);
        
        configuration.forEach( function(color, index) {
            buffer[index*3 + 0] = color.getGreen();
            buffer[index*3 + 1] = color.getRed();
            buffer[index*3 + 2] = color.getBlue();
        } );
            
        me.socket.send(
            buffer,
            0,
            buffer.length,
            7777, //replace with config
            me.address,
            function(err) {
                me.lastConfiguration = configuration;
            }
        );
    };
    
    this.fillColor = function(color) {
        var configuration = [];
        for (var i = 0; i < me.ledCount; i++) {
            configuration[i] = color;
        }
        this.show(configuration);
    };
    
    this.fillColorWithTransition = function(color) {
        var oldColors = this.getLastConfiguration();
        var totalFrames = 100.0;
        for (var frame = 1; frame < totalFrames + 1; frame++) {
            var configuration = [];
            for (var i = 0; i < me.ledCount; i++) {
                configuration[i] = Color.getColor(
                    Math.round(oldColors[i].getRed() + (color.getRed() - oldColors[i].getRed()) * frame/totalFrames),
                    Math.round(oldColors[i].getGreen() + (color.getGreen() - oldColors[i].getGreen()) * frame/totalFrames),
                    Math.round(oldColors[i].getBlue() + (color.getBlue() - oldColors[i].getBlue()) * frame/totalFrames)
                );
            }
            this.show(configuration);
        }
    };
}

module.exports = Strip;
   