var Strip = require("./Strip.js");

function HSVtoHEX(hue, sat, value) {
    var pr = 0.0
    var pg = 0.0
    var pb = 0.0
    
    var ora = 0
    var og = 0
    var ob = 0
    
    var ro = (hue * 6) % 6.0;
    
    var avg = 0.0
    
    ro = (ro + 6 + 1) % 6
    
    if (ro < 1) {
        pr = 1;
        pg = 1.0 - ro;
    } else if (ro < 2) {
        pr = 1;
        pb = ro - 1.0;
    } else if (ro < 3) {
        pr = 3.0 - ro;
        pb = 1;
    } else if (ro < 4) {
        pb = 1;
        pg = ro  - 3;
    } else if (ro < 5) {
        pb = 5 - ro;
        pg = 1;
    } else {
        pg = 1;
        pr = ro - 5;
    }
    
    pr *= value;
    pg *= value;
    pb *= value;
    
    avg += pr;
    avg += pg;
    avg += pb;
    
    pr = pr * sat + avg * (1.0-sat);
    pg = pg * sat + avg * (1.0-sat);
    pb = pb * sat + avg * (1.0-sat);
    
    ora = pr * 255;
    og = pb * 255;
    ob = pg * 255;
    
    if (ora < 0)
        ora = 0;
    if (ora > 255)
        ora = 255;
    if (og < 0)
        og = 0;
    if (og > 255)
        og = 255;
    if (ob < 0)
        ob = 0;
    if (ob > 255)
        ob = 255;
    
    return [Math.floor(ob), Math.floor(og), Math.floor(ora)];
}


function StripMapper() {
    var me = new Object();
    me.ledStore = [];
    me.ledCount = 0;
    me.lastConfiguration = [];
    me.frame = 0;

    this.getLedCount = function() {
        return me.ledCount;
    };

    this.getLastConfiguration = function() {
        return me.lastConfiguration;
    };
    
    this.addStrip = function(strip) {
        me.ledStore.push(strip);
        me.ledCount += strip.getLedCount();
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
        
        var count = 0;
        for (var i in me.ledStore) {
            var currentConfiguration = configuration.slice(count, count + me.ledStore[i].getLedCount());
            if (me.ledStore[i].getIsInverted()) {
                currentConfiguration.reverse();
            }
            me.ledStore[i].show(currentConfiguration);
            count += me.ledStore[i].getLedCount();
        }
        
        me.lastConfiguration = configuration;
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
    
    this.effect = function(frame, context, _me) {
        if (!context) context = this;
        if (!_me) _me = me;
        
        var configuration = [];
        for (var i = 0; i < _me.ledCount; i++) {
            var hex;// = HSVtoHEX( i*.001 - frame*.001, 1,  ((((i%256) - ((frame>>1)%256)+256)%256) ) /256.0*1.5-0.1);
            if( frame % _me.ledCount == i ) {
                hex = [ 255, 255, 255 ];
            } else {
                hex = [ 0, 0, 0 ];
            }
            configuration[i] = [hex[0], hex[1], hex[2]];
        }
        context.show(configuration);
        setTimeout(context.effect, 40, frame+1, context, _me);
    };
    
    this.test = function() {
        var configuration = [];
        for (var i = 0; i < me.ledCount; i++) {
            //var hex = HSVtoHEX( i*.001 - frame*.001, 1,  ((((i%256) - ((frame>>1)%256)+256)%256) ) /256.0*1.5-0.1);
            if( me.frame % me.ledCount == i ) {
                hex = [ 255, 255, 255 ];
            } else {
                hex = [ 0, 0, 0 ];
            }
            configuration[i] = [hex[0], hex[1], hex[2]];
        }
        this.show(configuration);
        me.frame++;
    };
}

module.exports = StripMapper;
   