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

    this.getLedCount = function() {
        return me.ledCount;
    };

    this.getLastConfiguration = function() {
        var configuration = [];
        for (var i in me.ledStore) {
            configuration = configuration.concat(me.ledStore[i].getLastConfiguration());
        }
        return configuration;
    };
    
    this.addStrip = function(strip) {
        me.ledStore.push(strip);
        me.ledCount += strip.getLedCount();
    };
    
    this.addStrips = function(strips) {
        for (var i in strips) {
            this.addStrip(strips[i]);
        }
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
            me.ledStore[i].show(currentConfiguration);
            count += me.ledStore[i].getLedCount();
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
        var configuration = [];
        for (var i = 0; i < me.ledCount; i++) {
            configuration[i] = color;
        }
        this.transitionConfiguration(configuration);
    };
    
    this.transitionConfiguration = function(configuration, frame) {
        if (!frame) frame = 1;

        var oldColors = this.getLastConfiguration();
        var totalFrames = 30.0;
        
        var newConfiguration = [];
        for (var i = 0; i < me.ledCount; i++) {
            newConfiguration[i] = [
                Math.round(oldColors[i][0] + (configuration[i][0] - oldColors[i][0]) * frame/totalFrames),
                Math.round(oldColors[i][1] + (configuration[i][1] - oldColors[i][1]) * frame/totalFrames),
                Math.round(oldColors[i][2] + (configuration[i][2] - oldColors[i][2]) * frame/totalFrames)
            ];
        }
        this.show(newConfiguration);
        
        if (frame <= totalFrames)
            setTimeout(this.transitionConfiguration.bind(this), 30, configuration, frame + 1);
    }
    
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
    
    this.test = function(frame) {
        if (!frame) frame = 0;
        
        var configuration = [];
        for (var i = 0; i < me.ledCount; i++) {
            //var hex = HSVtoHEX( i*.001 - frame*.001, 1,  ((((i%256) - ((frame>>1)%256)+256)%256) ) /256.0*1.5-0.1);
            if( frame == i ) {
                hex = [ 255, 255, 255 ];
            } else {
                hex = [ 0, 0, 0 ];
            }
            configuration[i] = [hex[0], hex[1], hex[2]];
        }
        this.show(configuration);
        
        if (frame < me.ledCount) {
            setTimeout(this.test.bind(this), 60, frame + 1);
        }
    };
}

module.exports = StripMapper;
   