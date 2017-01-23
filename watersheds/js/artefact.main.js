/*

WATERSHEDS
fluid-like data visualization based on D3.js and LiquidFun.js libraries.

REFERENCES:
https://codepen.io/hossman/pen/aFBfg

@author Vladimir V. KUCHINOV
@email  helloworld@vkuchinov.co.uk

XML LINK
http://research.tigweb.org/wishes/raw.html?limit=5120

*/

var gui, s0, s1;

var Interface = function() {
 
  this.update = 20;

  this.generator = 3.5;
  this.transition = 15;
    
  this.rest = 0.132;
  this.angle = 0.6;
  this.increment = 0.0038;
  this.scale = 150;
  //this.neighbours = 8;
    
};

window.onload = function() {
    
  var controls = new Interface();
  gui = new dat.GUI();
  var g0 = gui.addFolder("GENERAL PARAMETERS");
  g0.add(controls, "update", 10, 30);
    
  s0 = gui.addFolder("RIPPLING SYSTEM");
  s0.add(controls, "generator", 2.0, 6.0).onChange(function(value){ system.theta = parseInt(value * 1000); });
  s0.add(controls, "transition", 5.0, 30.0).onChange(function(value){ TRANSITION_INTERVAL = parseInt(value * 1000); });
    
  s1 = gui.addFolder("TIDAL SYSTEM");
  s1.add(controls, "rest", 0.025, 0.25).onChange(function(value){ REST_DISTANCE = value; });
  //s1.add(controls, "neighbours", 3, 12).onChange(function(value){ NUM_OF_NEIGHBOURS = value; });
  s1.add(controls, "angle", 0.1, 0.9).onChange(function(value){ MAX_ANGLE = value; });
  s1.add(controls, "increment", 0.001, 0.005).onChange(function(value){ ang_inc = value; });
  s1.add(controls, "scale", 128, 256).onChange(function(value){ SCALE_RATIO = value; });
    
      if(system == ripplingSystem) {
          s1.domElement.style.pointerEvents = "none";
          s1.domElement.style.opacity = .5; 
      }
      else if(system == tidalSystem) {
          s0.domElement.style.pointerEvents = "none";
          s0.domElement.style.opacity = .5; 
      }
    
};

function gup(name) {
    
    url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

inits();

function inits(){
    
    D3Renderer.init();

    //rippling/tidal
    system = (gup("type") == "rippling") ? ripplingSystem:tidalSystem;
    
    mode = (gup("type") == "automous") ? 0:1;
    system.inits();
    
    window.onresize = D3Renderer.resize;
    render();
    //document.addEventListener( 'mousemove', onMouseMove, false );
    
}

function render(){

    if(currentFrame % 5 == 0) system.update();
    
    D3Renderer.render(scene);
    window.requestAnimationFrame(render);

    //    ripples.update(); 

    //    if(currentFrame % 30 == 0) {  ripples.addRipple(); }
    //    //console.log(ripples.getValues());

    currentFrame++;
    
}

function onMouseMove( event ) {
        

        
}

function printValue(value_){ console.log("value: " + value_ + " | " + typeof value_); }
