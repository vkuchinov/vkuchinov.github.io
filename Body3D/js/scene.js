/*

PLUS SIGN
[-] place a small plus sign on each of the areas above
    no need to write “waist”, “hip”, etc. anywhere. 
    It’s just there for you as a reference
    
HOVERING
[-] When the user hovers over the plus sign, (1) the area 
    is colored and (2) a tooltip appears
    
COLOURING
[x] color to use when the delta is POSITIVE #FD8D3C
    Example: If I hover over the waist, the coloring will be #FD8D3C
             See attachment for the approximate area to be colored. 
             (This is just a way to show the coloring area, the actual coloring 
             could look better)

    color to use when the delta is NEGATIVE #A1D99B
    
    How to color the area?
    regular colored area (no lines or other motives)
    
TOOLTIP
See attached
    
REFERENCES:
http://jsfiddle.net/shivasaxena/6gryajd6/3/

*/

            var POSITIVE = 0xFD8D3C;
            var NEGATIVE = 0xA1D99B;

            var texture, positiveTexture, negativeTexture;

            var OBJ_URL = "assets/female.obj";
			var container;
			var camera, scene, renderer;
			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

            var mouse = new THREE.Vector2(), INTERSECTED;
            var raycaster;

            var body;
            var json, parts;

            var gradientMaterial;

			init();
			animate();

            $(document).ready(function() {

                $.ajax({
                    url: "data/data.json",
                    dataType: "text",
                    success: function(data_) { json = $.parseJSON(data_); parts = json.body.list; }
                });
      
            });

			function init() {
                
                     var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                
                 var x = 150,
        y = 75,
        // Radii of the black glow.
        innerRadius = 0,
        outerRadius = 200,
        // Radius of the entire circle.
        radius = 200;

                    var gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
                    gradient.addColorStop(0, 'black');
                    gradient.addColorStop(1, 'white');

                    ctx.arc(x, y, radius, 0, 2 * Math.PI);

                    ctx.fillStyle = gradient;
                    ctx.fill();

                    var shadowTexture = new THREE.Texture(canvas);
                    shadowTexture.needsUpdate = true;

                    gradientMaterial = new THREE.MeshBasicMaterial({
                        map: shadowTexture,
                        side: THREE.DoubleSide
                    });
                
                    
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.z = 250;
				// scene
				scene = new THREE.Scene();
				var ambient = new THREE.AmbientLight( 0x101030 );
				scene.add( ambient );
				var directionalLight = new THREE.DirectionalLight( 0xFFEEDD );
				directionalLight.position.set( 0, 0, 1 );
				scene.add( directionalLight );
				// texture
				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					console.log( item, loaded, total );
				};
                
				texture = new THREE.Texture();
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};
				var onError = function ( xhr ) {
				};
                
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'assets/UV2.jpg', function ( image ) {
					texture.image = image;
					texture.needsUpdate = true;
				} );
 
				// model
                positiveTexture = new THREE.Texture();
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};
                
				var onError = function ( xhr ) {
				};
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'assets/positive.jpg', function ( image ) {
					positiveTexture.image = image;
					positiveTexture.needsUpdate = true;
				} );
                
                negativeTexture = new THREE.Texture();
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};
                
				var onError = function ( xhr ) {
				};
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'assets/negative.jpg', function ( image ) {
					negativeTexture.image = image;
					negativeTexture.needsUpdate = true;
				} );
                
				var loader = new THREE.OBJLoader( manager );
				loader.load( OBJ_URL, function ( object ) {
					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material.map = texture;
						}
					} );
					object.position.y = - 95;
                    object.name = "body";
					scene.add( object );
				}, onProgress, onError );
				
                
                //the grid
                var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
				var geometry = new THREE.Geometry();

                var floor = -94.0, step = 16.0, size = 64.0;
				for ( var i = 0; i <= size / step * 2; i ++ ) {
					geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
					geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
					geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
					geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );
				}
                
				var grid = new THREE.LineSegments( geometry, material );
				scene.add( grid );
                
                raycaster = new THREE.Raycaster();
                
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
                renderer.setClearColor(0x494949, 1.0);
				container.appendChild( renderer.domElement );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				//
				window.addEventListener( 'resize', onWindowResize, false );
                document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    
			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

            function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                mouseX = ( event.clientX - windowHalfX ) / 2;
				mouseY = ( event.clientY - windowHalfY ) / 2;
			}

			//
			function animate() {
				requestAnimationFrame( animate );
				render();
			}
			function render() {
                
				camera.position.x += ( mouseX - camera.position.x ) * .2;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;
				camera.lookAt( scene.position );
        
                raycaster.setFromCamera( mouse, camera );
                
                if(scene.getObjectByName( "body" ) != null) {
                var intersects = raycaster.intersectObjects( scene.getObjectByName( "body" ).children );
				if ( intersects.length > 0 ) {
					if ( INTERSECTED != intersects[ 0 ].object ) {
                        for(var i = 0; i < parts.length; i++){
                            
                                if ( INTERSECTED ) INTERSECTED.material.map = texture;
                                INTERSECTED = intersects[ 0 ].object;
                                if(INTERSECTED.name == parts[i]){
                                if(json.body[parts[i]].delta < 0){ 
                                //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                                INTERSECTED.material.map = negativeTexture;
                                }
                                else {
                                INTERSECTED.material.map = positiveTexture;  
                                }
                                break;
                                }

                        }
					}
				} else {
					if ( INTERSECTED ) INTERSECTED.material.map = texture;
					INTERSECTED = null;
				}

                }
                
				renderer.render( scene, camera );
			}
