/*

THREE.JS INTERACTIVE 3D MODEL

[x] anchor points
[x] retina support
[x] keyframes
[x] responsive HUD


mockup.dae: version 1.5
mockupB.dae: version 1.4.1

REFERENCES:
http://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
https://github.com/gamestdio/three-text2d

SIMPLE LABEL
Easy-to-read display

COMPLEX LABEL
<b>Conmfort modes</b>
Single-touch options to quickly
switch between setting

@author Vladimir V. KUCHINOV
@email  helloworld@vkuchinov.co.uk

*/

function simpleHUD(){
    
    
    
}

function setHighPPI(canvas_) {
    
   var PIXEL_RATIO = (function () {
         var ctx = document.createElement("canvas").getContext("2d"),
             dpr = window.devicePixelRatio || 1,
             bsr = ctx.webkitBackingStorePixelRatio ||
             ctx.mozBackingStorePixelRatio ||
             ctx.msBackingStorePixelRatio ||
             ctx.oBackingStorePixelRatio ||
             ctx.backingStorePixelRatio || 1;

       return dpr / bsr; 
   
   })();
    
  canvas_.style.width  = canvas_.width  + "px";
  canvas_.style.height = canvas_.height + "px";

  canvas_.width  *= PIXEL_RATIO;
  canvas_.height *= PIXEL_RATIO;

  var context = canvas_.getContext('2d');
  context.scale(PIXEL_RATIO, PIXEL_RATIO)
  
}

function getCoordinates(object_, camera_) {

    var screenVector = new THREE.Vector3();
    object_.localToWorld( screenVector );

    screenVector.project(camera_);

    var posx = Math.round(( screenVector.x + 1 ) * renderer.domElement.offsetWidth / 2 );
    var posy = Math.round(( 1 - screenVector.y ) * renderer.domElement.offsetHeight / 2 );
    
    return { x: posx, y: posy };
}

var hudBitmap, hudTexture, cameraHUD;
var container;

var modelScale = 0.125;

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        
			var stats;
			var scene;
			var pointLight;
			var camera;
			var renderer;
			var model;
			var animations;
			var kfAnimations = [ ];
			var kfAnimationsLength = 0;
			var loader = new THREE.ColladaLoader();
			var lastTimestamp = 0;
			var progress = 0;
			loader.load( 'assets/mockupB.dae', function ( collada ) {
				model = collada.scene;
				animations = collada.animations;
				kfAnimationsLength = animations.length;
				model.scale.x = model.scale.y = model.scale.z = modelScale;
				init();
				start();
				animate( lastTimestamp );
                
			} );

			function init() {
                
				container = document.createElement( 'div' );
				document.body.appendChild( container );
	
				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.01, 1000 );
				camera.position.set( -5.00181875, 3.42631375, 11.3102925 );
				camera.lookAt( new THREE.Vector3( -1.224774125, 2.18410625, 4.57969125 ) );
	
				scene = new THREE.Scene();
		
				for ( var i = 0; i < kfAnimationsLength; ++i ) {
					var animation = animations[ i ];
					var kfAnimation = new THREE.KeyFrameAnimation( animation );
					kfAnimation.timeScale = 1;
					kfAnimations.push( kfAnimation );
				}
				//grid
				var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
				var geometry = new THREE.Geometry();
				var floor = -0.04, step = 1, size = 4;
				for ( var i = 0; i <= size / step * 2; i ++ ) {
					geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
					geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
					geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
					geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );
				}
				var line = new THREE.LineSegments( geometry, material );
				scene.add( line );

				model.getObjectByName( 'eyePoint', true ).visible = false;
				model.getObjectByName( 'targetPoint', true ).visible = false;
                
                //anchors
                model.getObjectByName( 'AnchorA', true ).visible = false;
                
				scene.add( model );

				pointLight = new THREE.PointLight( 0xffffff, 1.75 );
				scene.add( pointLight );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
                renderer.setClearColor( 0x494949, 1.0 );
                renderer.autoClear = false;
				container.appendChild( renderer.domElement );
                
				stats = new Stats();

                var hudCanvas = document.createElement('canvas');
  
                hudCanvas.width =  window.innerWidth;
                hudCanvas.height =  window.innerHeight;
                
                // Get 2D context and draw something supercool.
                hudBitmap = hudCanvas.getContext('2d');
                
                setHighPPI(hudCanvas);

                hudBitmap.beginPath();
                hudBitmap.arc(0, 0, 16, 0, 2 * Math.PI, false);
                //hudBitmap.lineWidth = 4;
                //hudBitmap.strokeStyle = '#FFFFFF';
                //hudBitmap.stroke();
                hudBitmap.fillStyle = '#FFFFFF';
                hudBitmap.fill();
                hudBitmap.font = "Normal 14px Arial";
                hudBitmap.textAlign = 'left';
                hudBitmap.fillStyle = "rgba(255, 255, 255, 0.75)";
                //hudBitmap.fillText('',  0, 0);
  
                // Create the camera and set the viewport to match the screen dimensions.
                cameraHUD = new THREE.OrthographicCamera(- window.innerWidth/2,  window.innerWidth/2,  window.innerHeight/2, - window.innerHeight/2, 0, 30 );

                // Create also a custom scene for HUD.
                sceneHUD = new THREE.Scene();
 
                // Create texture from rendered graphics.
                hudTexture = new THREE.Texture(hudCanvas) 
                hudTexture.needsUpdate = true;
                hudTexture.minFilter = THREE.LinearFilter
  
  // Create HUD material.
  var material = new THREE.MeshBasicMaterial( {map: hudTexture} );
  material.transparent = true;

  // Create plane to render the HUD. This plane fill the whole screen.
  var planeGeometry = new THREE.PlaneGeometry(  window.innerWidth,  window.innerHeight );
  var plane = new THREE.Mesh( planeGeometry, material );
  sceneHUD.add( plane );
                
            window.addEventListener( 'resize', onWindowResize, false );
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function start() {
				for ( var i = 0; i < kfAnimationsLength; ++i ) {
					var animation = kfAnimations[i];
					for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {
						var keys = animation.data.hierarchy[ h ].keys;
						var sids = animation.data.hierarchy[ h ].sids;
						var obj = animation.hierarchy[ h ];
						if ( keys.length && sids ) {
							for ( var s = 0; s < sids.length; s++ ) {
								var sid = sids[ s ];
								var next = animation.getNextKeyWith( sid, h, 0 );
								if ( next ) next.apply( sid );
							}
                            
                            
							obj.matrixAutoUpdate = false;
							animation.data.hierarchy[ h ].node.updateMatrix();
							obj.matrixWorldNeedsUpdate = true;
						}
					}
					animation.loop = false;
					animation.play();
				}
			}
			function animate( timestamp ) {

                 var object = model.getObjectByName( 'AnchorA', true );
                 var xy = getCoordinates(object, camera);

                
                               
                 var hor = 1;
                 var ver = 1;
                
                 if(xy.x < window.innerWidth / 2) hor = -1;
                 if(xy.y < window.innerHeight / 2) ver = -1;
                 //console.log(window.innerWidth);
                 hudBitmap.clearRect(0, 0,  window.innerWidth,  window.innerHeight);
                
                 hudBitmap.beginPath();
                 hudBitmap.arc(xy.x, xy.y, 8, 0, 2 * Math.PI, false);
                 hudBitmap.fillStyle = '#FFFFFF';
                 hudBitmap.fill();
  
                 hudBitmap.strokeStyle = '#FFFFFF';
                 hudBitmap.moveTo(xy.x, xy.y);
                 hudBitmap.lineTo(xy.x + 32  * hor, xy.y - 32 * ver);
                 hudBitmap.lineTo(xy.x + 192 * hor, xy.y - 32  * ver);
                 hudBitmap.lineWidth = 2;
                 hudBitmap.stroke();
                
                 //hudBitmap.lineWidth = 5;
                 //hudBitmap.strokeStyle = '#FFFFFF49';
                 //hudBitmap.stroke();
                 if(hor == 1 ) { hudBitmap.textAlign = 'right'; } else { hudBitmap.textAlign = 'left'; };
                 hudBitmap.fillText("Easy-to-read display", xy.x + 192 * hor, xy.y - 32 * ver - 6);
  	             hudTexture.needsUpdate = true;

                //number of keyframes
				var frameTime = ( timestamp - lastTimestamp ) * 0.002;
				if ( progress >= 0 && progress < 36 ) {
					for ( var i = 0; i < kfAnimationsLength; ++i ) {
						kfAnimations[ i ].update( frameTime );
					}
				} else if ( progress >= 36 ) {
					for ( var i = 0; i < kfAnimationsLength; ++i ) {
						kfAnimations[ i ].stop();
					}
					progress = 0;
					start();
				}
				pointLight.position.copy( camera.position );
				progress += frameTime;
				lastTimestamp = timestamp;
                renderer.clear();
				renderer.render( scene, camera );
                renderer.render(sceneHUD, cameraHUD);
				stats.update();
				requestAnimationFrame( animate );
			}