

            var sceneBackground = 0x3F4144;

			var container, stats;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;


			init();
			animate();


			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.z = 250;

				// scene

				scene = new THREE.Scene();

				var ambient = new THREE.AmbientLight( 0x444444 );
				scene.add( ambient );

				var directionalLight = new THREE.DirectionalLight( 0xFFEEDD);
				directionalLight.position.set( 0, 0, 1 ).normalize();
				scene.add( directionalLight );

	            //smoke
                
                var loader = new THREE.TextureLoader();
                var smokeTexture = loader.load('images/smokeparticle.png');
                
                var settings = {
                    positionStyle  : Type.CUBE,
                    positionBase   : new THREE.Vector3( 0, 0,  0 ),
                    positionSpread : new THREE.Vector3(    0,  30, 20 ),

                    velocityStyle  : Type.CUBE,
                    velocityBase   : new THREE.Vector3( 0, 40, 0 ),
                    velocitySpread : new THREE.Vector3( 0, 20, 0 ), 

                    particleTexture : smokeTexture,

                    sizeBase     : 80.0,
                    sizeSpread   : 20.0,
                    colorBase    : new THREE.Vector3(0.0, 0.0, 1.0), // H,S,L
                    opacityTween : new Tween([0,1,4,5],[0,1,1,0]),

                    particlesPerSecond : 3,
                    particleDeathAge   : 10.0,		
                    emitterDeathAge    : 60

                 };
     
                engine = new ParticleEngine();
                engine.setValues( settings );
                engine.initialize();

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) { };

				
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );
                renderer.setClearColor( sceneBackground, 1 );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				mouseX = ( event.clientX - windowHalfX ) / 2;
				mouseY = ( event.clientY - windowHalfY ) / 2;

			}


			function animate() {

				requestAnimationFrame( animate );
				render();

			}

			function render() {

				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;

				camera.lookAt( scene.position );

                engine.update( 0.01 * 0.5 );
                
				renderer.render( scene, camera );
                

			}

