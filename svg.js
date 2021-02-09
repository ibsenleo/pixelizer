
// var grpHalo;

// var arrPoints = new Array();
// var pointRadius = 3;
// var pointGap = 5;
// var marginTop = 20;
// var marginLeft = 20;
// var pointsColor = "#555"

// var matrixRes = {
//     width : 61,
//     height: 53
// }
// Lets create big circle in the middle:

$(document).ready(function(){
    // s = Snap("#mapa");
    // s =  Snap(800, 600);
    var s = SVG("container")
    // grpHalo = s.group();
    // createPoints();
    $img = $('#image')
    $img.on('load', function(){
        console.log('LOADED')
        var r = new Reader("#image")
        var arr = r.read()
        var b = new Board(s, arr)
    })
    .each(function(){
        if(this.complete) {
          $(this).trigger('load');
        }
    });
    
})
// function loadMap() {
//     // s = Snap("#mapa");
//     // s =  Snap(800, 600);
//     s = SVG("container")
//     grpHalo = s.group();
//     // createPoints();
// }

//----------------------------------------
//  READER 
//----------------------------------------

function Reader (image, options) {
    var img = $(image);

    // Copy bitmap to canvas and read its content
    var canvasID = "canvas-drawing"

    this.container = $("#canvas-container");
    this.container.append('<canvas id="'+canvasID+'" width="'+Math.floor(img.width())+'" height="'+Math.floor(img.height())+'" style="border:0px solid #d3d3d3;"/>')
    this.canv = $("#"+canvasID);
    this.ctx = this.canv.get(0).getContext("2d");
    this.ctx.drawImage(img.get(0), 0, 0);


    //variables
    this.imageMap = [];
    var pixelSize = 8 //NOTE: this value has to be the >= Board.pointRadius + Board.pointGap

    //options
    var defaults = {
        pixelSize : pixelSize,
        width : Math.floor(img.width()/ pixelSize),
        height : Math.floor(img.height()/ pixelSize),
    }
    $.extend(this, defaults, options);

    // this.read();
}

/**
* Loop over image pixels and return an array with colored points
*/
Reader.prototype.read = function () {
    var self = this
    // var test = ctx.getImageData(61 * pixelSize, 22 * pixelSize, pixelSize, pixelSize);
    // var test = ctx.getImageData(210, 60, 10, 10);
    // var test = ctx.getImageData(250, 20, 10, 10);

    // ctx.putImageData(test, 0, 0)
    // console.log(checkPoint(test));
    var readPixelDimension = 10

    for (var h = 0; h < self.height; h++) {
        self.imageMap[h] = []
        for (var w = 0; w < self.width; w++) {
            var element = self.ctx.getImageData(w * self.pixelSize, h * self.pixelSize, readPixelDimension, readPixelDimension);
            self.imageMap[h][w] = self.checkPoint(element)
            // console.log(imageMap[h][w]);
        }
    }
    this.container.remove();
    return self.imageMap
    // console.log(JSON.stringify(self.imageMap));
}

/**
* Check current pixel (section - multiple real pixels) 
* and get average color of current section.
* 
* @param pixel
* @param tolerance
* 
* @return String HEX color
*/
Reader.prototype.checkPoint = function (pixel, tolerance) {
    var background = [255, 255, 255, 255];
    var colorTolerance = 10
    var _errorTolerance = (!tolerance) ? 2 : tolerance;
    var limit = Math.ceil((pixel.data.length * _errorTolerance) / 100);
    var _different = 0;

    var rgba = {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    }
        
    for (i = 0; i < pixel.data.length; i += 4) {

        rgba.r += pixel.data[i]
        rgba.g += pixel.data[i+1]
        rgba.b += pixel.data[i+2]
        rgba.a += pixel.data[i+3]
        // //different color
        // if (pixel.data[i] < background[0] - colorTolerance ||
        //     pixel.data[i + 1] < background[1] - colorTolerance ||
        //     pixel.data[i + 2] < background[2] - colorTolerance ||
        //     pixel.data[i + 3] < background[3] - colorTolerance) {

        //     _different += 1;

        //     //exceed tolerance
        //     if (_different > limit) {
        //         // console.log("1");
        //         // console.log("Hay "+ _different+ " diferencias de color.");
        //         return true;
        //     }
        // }
    } //for

    rgba = this.getPixelColor(rgba, pixel.data.length)

    if( (rgba.r < background[0] - colorTolerance || rgba.r > background[0] + colorTolerance) ||
        (rgba.g < background[1] - colorTolerance || rgba.g > background[1] + colorTolerance) ||
        (rgba.b < background[2] - colorTolerance || rgba.b > background[2] + colorTolerance) ||
        (rgba.a < background[3] - colorTolerance || rgba.a > background[3] + colorTolerance)  ) 
    {
        var Hex = "#"+this.componentToHex(rgba.r) + this.componentToHex(rgba.g) + this.componentToHex(rgba.b) //+ this.componentToHex(rgba.a)
        return Hex;
    }
    // console.log("0");
    // console.log("Hay "+ _different+ " diferencias de color.");
    return false
}

/**
 * Format color from pixel
 */
Reader.prototype.getPixelColor = function (color, samples) {
    samples /= 4;
    color.r = Math.ceil(color.r/samples)
    color.g = Math.ceil(color.g/samples)
    color.b = Math.ceil(color.b/samples)
    color.a = Math.ceil(color.a/samples)

    return color;
}

Reader.prototype.componentToHex = function (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

Reader.prototype.rgbToHex = function(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

Reader.prototype.invertColor = function (pixel) {
    imgData.data[i] = 255 - imgData.data[i];
    imgData.data[i + 1] = 255 - imgData.data[i + 1];
    imgData.data[i + 2] = 255 - imgData.data[i + 2];
    imgData.data[i + 3] = 255;
}


//----------------------------------------
//  Board
//----------------------------------------

var Board = function (svgContext, imageArray, options) {
    console.log(imageArray);
    this.s = svgContext
    this.imgArray = imageArray
    this.grpHalo = svgContext.group();

    this.arrPoints = new Array();
    this.pointRadius =8;
    this.pointGap =  0;
    this.marginTop = 0;
    this.marginLeft = 0;
    this.pointsColor = "#555"

    console.log(imageArray.length);
    this.matrixRes = {
        width : imageArray[0].length,
        height: imageArray.length
    }

    this.createPoints()

}

Board.prototype.createPoints = function () {
    var self = this;
    //Creation loop
    for (var i = 0; i < this.matrixRes.width ; i++) {
        for (var j = 0; j < this.matrixRes.height; j++) {

            if(self.imgArray && self.imgArray[j][i] != false)
            {
                // this.createSinglePoint(i,j, false ) 
                this.createSinglePoint(i,j, false, self.imgArray[j][i] ) 
                // var lucky = Math.ceil(Math.random()*100);

                // if(lucky == 1)
                //     this.createSinglePoint(i,j, true)
                // else
                //     this.createSinglePoint(i,j, false)            

            }
        }
    }
    this.grpHalo.front();
}

Board.prototype.createSinglePoint = function (x, y, active, color) {
    var self = this
        var colors = ["#053259","#30BA43","#65DEEE"]
        var rand = Math.floor(Math.random()*3)
    
        if(active)
            var dot = new Point( 
                self.s,
                x *((self.pointRadius*2)+self.pointGap)+self.pointRadius + self.marginTop ,
                y *((self.pointRadius*2)+self.pointGap)+self.pointRadius + self.marginLeft, 
                self.pointRadius, 
                {
                    color: colors[rand], 
                    halo: active,
                    haloColor: colors[rand],
                    haloOpacity: Math.random()
                }
            );
        else
            var dot = new Point( 
                self.s,
                x *((self.pointRadius*2)+self.pointGap)+self.pointRadius + self.marginTop ,
                y *((self.pointRadius*2)+self.pointGap)+self.pointRadius + self.marginLeft, 
                self.pointRadius,
                { color: color });

    dot.id = x+":"+y;
    dot.drawPoint()
    self.arrPoints.push(dot);
}

//----------------------------------------
//  POINT CLASS
//----------------------------------------

function Point (s, x,y, radius, properties ){ //color, halo, haloSize, haloOpacity, animate) {
    this.s = s
    this.x = x
    this.y = y
    this.radius = radius
    // this.color = color || "#555"
    // this.halo = halo;
    // this.haloSize = haloSize || 30
    // this.haloOpacity = haloOpacity || 0.2
    // this.haloColor = color
    // // this.expand = true
    // this.animate = animate || false;

    var defaults = {
        color       : "#DDD",
        halo        : false,
        haloSize    : 15,
        haloOpacity : 0.2,
        haloColor   : "#555",
        animate     : false
    }

    $.extend(this, defaults, properties)
}

Point.prototype.drawPoint = function () {
    var self = this;
    // var dot = s.circle(this.x, this.y, this.radius );
    self.dot = self.s.circle(self.radius).fill(self.color).center(self.x/2, self.y/2)
    // self.dot = self.s.rect(self.radius,self.radius).fill(self.color).center(self.x/2, self.y/2)

    if (self.halo == true)
       self.drawHalo();
}

Point.prototype.drawHalo = function() {
    var self = this;
    var diameter = self.haloSize * 2
    self.dotHalo = self.s.circle( diameter ).fill({color:self.haloColor, opacity: self.haloOpacity})
    .stroke({ width: 2, color: self.haloColor })
    .center(self.x, self.y)
    .addClass("clicable")

    if(self.animate)
        self.dotHalo.animate(2000, '<>').radius(self.haloSize).loop(null,true)
    else
    {
        self.dotHalo.animate(2000, '<>').radius(self.haloSize+10).loop(null,true).pause();
        self.dotHalo.on("mouseenter", function(){
            self.dotHalo.play();
            self.dotHalo.front();
        }.bind(this))
    }

    grpHalo.add(self.dotHalo);

}

// function animateLoop (el, halo) {
//     if(el.expand && el.animate)
//         halo.animate({r: 30}, 3000, mina.easeinout, animateLoop.bind(null, el,halo));
//     else
//         halo.animate({r: 20}, 3000, mina.easeinout, animateLoop.bind(null, el,halo));

//     el.expand = !el.expand
// }

