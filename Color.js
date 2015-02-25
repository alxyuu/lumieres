var self = new Object();
self.colorCache = [];

function Color(red, green, blue) {
    this.getRed = function() {
        return red;
    };
    this.getGreen = function() {
        return green;
    };
    this.getBlue = function() {
        return blue;
    }
}

self.isColorValue = function(value) {
    return value === +value
        && value === (value|0)
        && value >= 0
        && value <= 255;
}

Color.getColor = function(red, green, blue) {
    if (!self.isColorValue(red)) {
        throw "Invalid value provided for red";
    }
    if (!self.isColorValue(green)) {
        throw "Invalid value provided for green";
    }
    if (!self.isColorValue(red)) {
        throw "Invalid value provided for blue";
    }
    
    if (!self.colorCache[red]) {
        self.colorCache[red] = [];
    }
    if (!self.colorCache[red][green]) {
        self.colorCache[red][green] = [];
    }
    if (!self.colorCache[red][green][blue]) {
        self.colorCache[red][green][blue] = new Color(red, green, blue);
    }
    return self.colorCache[red][green][blue];
}

module.exports = Color;