function SpacerStrip(ledCount) {
    var me = new Object();
    me.ledCount = ledCount;
    me.lastConfiguration = [];
    
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
        return false;
    };
    
    this.show = function(configuration) {
        return;
    };
}

module.exports = SpacerStrip;
   