var dgram = require('dgram');

function Strip(address, ledCount, inverted) {
    var me = new Object();
    me.address = address;
    me.ledCount = ledCount;
    me.lastConfiguration = [];
    me.isInverted = inverted ? true : false;
    me.socket = dgram.createSocket("udp4");
    
    for (var i = 0; i < me.ledCount; i++) {
        me.lastConfiguration[i] = [0, 0, 0];
    }
    
    this.getLedCount = function() {
        return me.ledCount;
    };

    this.getLastConfiguration = function() {
        return me.lastConfiguration;
    };
    
    this.getIsInverted = function() {
        return me.isInverted;
    };
    
    this.show = function(configuration) {
        if (configuration.length > me.ledCount) {
            console.log("Received too many lights for configuration, truncating.");
            configuration = configuration.slice(0, me.ledCount);
        } else if (configuration.length < me.ledCount) {
            console.log("Received too few lights for configuration, padding.");
            for(var i = configuration.length; i < me.ledCount; i++) {
                configuration[i] = [0, 0, 0];
            }
        }
        
        var sendFlag = false;
        
        if (me.lastConfiguration.length == configuration.length) {
            sendTest: for (var i = 0; i < configuration.length; i++) {
                for(var j = 0; j < 3; j++) {
                    if (me.lastConfiguration[i][j] != configuration[i][j]) {
                        sendFlag = true;
                        break sendTest;
                    }
                }
            }
        } else {
            sendFlag = true;
        }
        
        if (sendFlag) {
            if (me.isInverted) {
                configuration.reverse();
            }
            
            var buffer = new Buffer(3 * me.ledCount);
            
            configuration.forEach( function(color, index) {
                buffer[index*3 + 0] = color[1];
                buffer[index*3 + 1] = color[0];
                buffer[index*3 + 2] = color[2];
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
        //} else {
            //console.log(Date.now() + ": same configuration, skipping");
        }
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
        var totalFrames = 60.0;
        for (var frame = 1; frame < totalFrames + 1; frame++) {
            var configuration = [];
            for (var i = 0; i < me.ledCount; i++) {
                configuration[i] = [
                    Math.round(oldColors[i][0] + (color[0] - oldColors[i][0]) * frame/totalFrames),
                    Math.round(oldColors[i][1] + (color[1] - oldColors[i][1]) * frame/totalFrames),
                    Math.round(oldColors[i][2] + (color[2] - oldColors[i][2]) * frame/totalFrames)
                ];
            }
            this.show(configuration);
        }
    };
}

module.exports = Strip;
   