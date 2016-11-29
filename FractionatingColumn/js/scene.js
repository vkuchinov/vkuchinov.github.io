
            var modelPath = "assets/";
            var mtlURL = "kolonna.mtl";
            var objURL = "kolonna.obj";

            var modelRatio = 0.5;

            //smoke position (start)
            var smokeStartingPoint = new THREE.Vector3(0, -250, 0);
            var smokeHeight = new THREE.Vector3(0, -250, 0);

            var sceneBackground = 0x3F4144;

			var container, stats;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
        
            var clock = new THREE.Clock();

               function initParticles() {
                   
                   //smoke
                var spriteLoader = new THREE.TextureLoader();
                var smokeTexture = spriteLoader.load('images/smoke30Frames.png');
                   
        	particleGroup = new SPE.Group({
        		texture: {
                    value: smokeTexture,
                    frames: new THREE.Vector2(6, 5),
                    frameCount: 30
                }
        	});

        	emitter = new SPE.Emitter({
                maxAge: {
                    value: 2
                },
        		position: {
                    value: smokeStartingPoint,
                    spread: new THREE.Vector3( 16, 750, 16 ),
                },

        		acceleration: {
                    value: new THREE.Vector3(0, 2.5, 0),
                    spread: new THREE.Vector3( 0, 0, 0)
                },

        		velocity: {
                    value: new THREE.Vector3(0, 25, 0),
                    spread: new THREE.Vector3(5, 7.5, 5)
                },

                color: {
                    value: [ new THREE.Color(0xA78F69), new THREE.Color(0xB2B2E7) ]
                },
                
                 opacity: {
                    value: [ 0.09 , 0.025 ]
                },
                
                
                size: {
                    value: [ 64 , 128]
                },

        		particleCount: 9999,
  
        	});

        	particleGroup.addEmitter( emitter );
          
            
        	scene.add( particleGroup.mesh );

        }


            
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

				// model

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) { };

				THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.setPath( modelPath );
				mtlLoader.load( mtlURL, function( materials ) {

					materials.preload();

					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.setPath( modelPath );
					objLoader.load( objURL, function ( object ) {

						object.position.y = - 95;
                        object.scale.set(modelRatio, modelRatio, modelRatio);
						scene.add( object );

					}, onProgress, onError );

				});
                
                initParticles();

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

			//

			function animate() {

				requestAnimationFrame( animate );
				render( clock.getDelta() );

			}

			function render( dt ) {

                particleGroup.tick( dt );
                
				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}
