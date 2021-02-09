# pixelizer
Script that pixelize a picture
# Usage

## HTML
Has to exists this html structure. (Could be created by code or static)
```html
<!-- In this div, the image will be copied and readed -->
<div id="container" style="width:auto;height: auto;"></div>

<!-- In this div, the image will be loaded as pixelized SVG  -->
<div id="canvas-container">
  <img id="image" 
  src="./images/grito.jpg"
  alt="The Scream" 
  width="auto" 
  height="auto" 
  style="display:none;"/>
</div>
```

## Javascript
```javascript
$(document).ready(function(){
    //Creates the SVG Canvas
    var s = SVG("container")
    
    //Listen when image is ready
    $img = $('#image')
    $img.on('load', function(){
        console.log('LOADED')
        var r = new Reader("#image") //Reads the image and return the "map" of pixels
        var arr = r.read()
        var b = new Board(s, arr) //Load the map into the SVG
    })
    .each(function(){
        if(this.complete) {
          $(this).trigger('load');
        }
    });
    
})
```
