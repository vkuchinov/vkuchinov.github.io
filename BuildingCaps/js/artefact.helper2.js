            var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

            var geom;
            var points = [];
            var vertices_array = [];

            var groups = [];
            var defaultMat = new THREE.MeshPhongMaterial( { color: 0x71A5D2, specular: 0xA0CFF7, shininess: 1.5, side: THREE.DoubleSide } );
            var transMat =  new THREE.MeshPhongMaterial( { color: 0xFF00FF, specular: 0xFF0000, shininess: 1.5, transparent: true, opacity: 0.5, side: THREE.DoubleSide } );
            var faceMat = new THREE.MeshBasicMaterial( { color: 0x00FFFF, vertexColors: THREE.VertexColors, wireframe: true, side: THREE.DoubleSide } );

            var offsetAmount = 0.02;

			init();
			animate();

            function setOrigins(object_, groups_){
                
                for(var i = 0; i < object_.geometry.vertices.length; i++){
                    
                    groups.push({origin: new THREE.Vector3( object_.geometry.vertices[i].x,  object_.geometry.vertices[i].y, object_.geometry.vertices[i].z).multiplyScalar(64), helpers: [], mean: null} );

                }
                
            }

            function sortHelpers(groups_, vertices_){
                
                var EPSILON = 1E-6;
                
                console.log(vertices_[1]);

                for(var i = 0; i < vertices_.length; i += 2){
                    
                    for(var j = 0; j < groups_.length; j++){
 
                    if(vertices_[i].distanceTo ( groups_[j].origin ) < EPSILON) { groups_[j].helpers.push(vertices_[i + 1]); console.log("bazara net");}
                    
                    }
                                                                          
                }
                
            }

            function calculateMeans(groups_){
                
                for(var i = 0; i < groups_.length; i++){
                    groups_[i].mean = meanForVs(groups_[i].helpers);
                }
                
            }

            function meanForVs(vectors_){
 
                if(vectors_.length > 0){
                    
                var mean = new THREE.Vector3(vectors_[0].x, vectors_[0].y, vectors_[0].z);
                for(var i = 1; i < vectors_.length; i++){
                 mean.add(vectors_[i]);   
                }
                
                return mean.multiplyScalar( 1 / vectors_.length);
                    
                }
                
                return new THREE.Vector3(0, 0, 0);
            }

            function renderMeans(groups_){
                
                var material = new THREE.LineBasicMaterial({ color: 0x00FF00 });

                for(var i = 0; i < groups_.length; i++){
                    
                var geometry = new THREE.Geometry();
                    
                geometry.vertices.push(
                new THREE.Vector3(groups_[i].origin.x, groups_[i].origin.y, groups_[i].origin.z),
                new THREE.Vector3(groups_[i].mean.x, groups_[i].mean.y, groups_[i].mean.z)
                );

                var line = new THREE.Line( geometry, material );
                scene.add( line );
                    
                }
                
            }

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.z = 250;

				// scene

				scene = new THREE.Scene();

				var ambient = new THREE.AmbientLight( 0x101030 );
				scene.add( ambient );

				var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0, 0, 1 );
				scene.add( directionalLight );

				// texture

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};

				var texture = new THREE.Texture();

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};


				var loader = new THREE.ImageLoader( manager );
				loader.load( 'assets/UV_Grid_Sm.jpg', function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );

				var loader = new THREE.OBJLoader( manager );
				loader.load( 'assets/waist.obj', function ( object ) {

                    var mergeGeometry = new THREE.Geometry();
                    var originalGeometry = new THREE.Geometry();
                    
					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {

                            child.material = defaultMat;
							child.geometry = new THREE.Geometry().fromBufferGeometry( child.geometry );
                            mergeGeometry.merge( child.geometry, child.geometry.matrix );
                            originalGeometry.merge( child.geometry, child.geometry.matrix );

						}

					} );
                    
                mergeGeometry.mergeVertices();
                mergeGeometry.computeVertexNormals();
                    
                originalGeometry.mergeVertices();
                originalGeometry.computeVertexNormals();           
     
                var geometry = offsetGeometry(mergeGeometry, offsetAmount);
                var mesh = new THREE.Mesh(geometry, defaultMat);
                    
                mesh.scale.set(640, 640, 640);
                object.scale.set(640, 640, 640);
                    
                var original = new THREE.Mesh(originalGeometry, defaultMat);
                original.scale.set(640, 640, 640);
                    
                var edges = [];

                for(var i = 0, l = originalGeometry.faces.length; i < l; i++) {
 
                    findAdjacentFaces(i, edges, originalGeometry);
                    
                }
                    
                edges = resolveChains(edges);
                console.log(edges);
                    
                renderBuoys(edges, originalGeometry, geometry);
                stitchingCaps(edges, originalGeometry, geometry);

                scene.add(mesh);
                scene.add(original);

                });
                
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
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
				render();

			}

			function render() {

				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}

            function offsetGeometry(geometry_, offset_){
                
                var geo = geometry_;
                var verts = geo.vertices;
                var faces = geo.faces;

                for(var i=0; i<faces.length; i++) {

                    var va = verts[faces[i].a];
                    if(va.normals) va.normals.push( faces[i].vertexNormals[0] ); 
                    else va.normals = [ faces[i].vertexNormals[0] ];             

                    var vb = verts[faces[i].b];
                    if(vb.normals) vb.normals.push( faces[i].vertexNormals[1] );
                    else vb.normals = [ faces[i].vertexNormals[1] ];
                    // vertex c
                    var vc = verts[faces[i].c];
                    if(vc.normals) vc.normals.push( faces[i].vertexNormals[2] );
                    else vc.normals = [ faces[i].vertexNormals[2] ];
                    
                }


                for(i=0; i<verts.length; i++) {
                    
                    var v = verts[i];
                    var normal = computeAverageNormal( v.normals );
                    normal.multiplyScalar( offsetAmount );
                    v.add( normal );
                    
                }

                geo.verticesNeedUpdate = true;
                
                return geo;
            }

            function computeAverageNormal(normals_) {
                    
                    var n = new THREE.Vector3();
                    for(var i = 0, l = normals_.length; i < l; i++) { n.add( normals_[i] ); }
                    n.normalize();
                    return n;
                    
            }

            function renderBuoys(chains_, geometry0_, geometry1_){

                for(var j = 0, ll = chains_.length; j < ll; j++){
                    
                    for(var i = 0, l = chains_[j].length; i < l; i++){

                        var g = new THREE.SphereGeometry( 1, 8, 8 );
                        var m = new THREE.MeshBasicMaterial( {color: 0xFF00FF} );
                        var s = new THREE.Mesh( g, m );
                        s.position.x = geometry0_.vertices[chains_[j][i]].x * 640;
                        s.position.y = geometry0_.vertices[chains_[j][i]].y * 640;
                        s.position.z = geometry0_.vertices[chains_[j][i]].z * 640;
                        scene.add( s );
                        
                        var g = new THREE.SphereGeometry( 1, 8, 8 );
                        var m = new THREE.MeshBasicMaterial( {color: 0xFF00FF} );
                        var s = new THREE.Mesh( g, m );
                        s.position.x = geometry1_.vertices[chains_[j][i]].x * 640;
                        s.position.y = geometry1_.vertices[chains_[j][i]].y * 640;
                        s.position.z = geometry1_.vertices[chains_[j][i]].z * 640;
                        scene.add( s );

                    }
  
                }
  
            }

            function stitchingCaps(chains_, geometry0_, geometry1_){

                var output = new THREE.Geometry();

                var index = 0;
                
                console.log("# of chains: " + chains_.length);
                
                for(var j = 0, ll = chains_.length; j < ll; j++){
                    
                output.vertices.push(geometry0_.vertices[chains_[j][0]]);
                output.vertices.push(geometry1_.vertices[chains_[j][0]]);
                output.vertices.push(geometry0_.vertices[chains_[j][1]]);
                output.vertices.push(geometry1_.vertices[chains_[j][1]]);
                                     
                output.faces.push( new THREE.Face3(index, index + 1, index + 2) );
                output.faces.push( new THREE.Face3(index + 2, index + 1, index + 3) );
                    
                for(var i = 1, l = chains_[j].length - 1; i < l; i++){
                    
                    output.vertices.push(geometry0_.vertices[chains_[j][i + 1]]);
                    output.vertices.push(geometry1_.vertices[chains_[j][i + 1]]);

                    var inc = index + i * 2;
                    output.faces.push( new THREE.Face3( inc, inc + 1, inc + 2  ) );
                    output.faces.push( new THREE.Face3( inc + 2, inc + 1, inc + 3 ) );

                }
                    
                index += output.vertices.length;
                    
                }
                
                output.mergeVertices();
                output.computeFaceNormals();
                
                console.log(output);
                
                var m = new THREE.Mesh(output, defaultMat);
                m.scale.set(640, 640, 640);
                scene.add(m);
                
            }

            function setVertex(vertex_){ return new THREE.Vector3( vertex_.x, vertex_.y, vertex_.z ); }

            function findAdjacentFaces(face_, edges_, geometry_){ 
                
                var adjacentFaces = [];
                
                if(face_ >= 0 && face_ < geometry_.faces.length){
                    
                        for(var i = 0, l = geometry_.faces.length; i < l; i++){
                            
                            if(i != face_){
                                
                                if(checkAdjacent(geometry_.faces[face_], geometry_.faces[i]) == true ){
                                    
                                        adjacentFaces.push(i);
                                    
                                }
        
                            }
                            
                            if(adjacentFaces.length > 2) { break; }
                            
                        }
    
                }

                if(adjacentFaces.length == 2){
                 
                    edges_.push(setEdge(face_, adjacentFaces[0], adjacentFaces[1], geometry_));

                }
                
            }

            function setEdge(faceA_, faceB_, faceC_, geometry_){
                  
                var vertices = [], peak, tmpA, tmpB;
                var values =  [ geometry_.faces[faceA_].a, geometry_.faces[faceA_].b, geometry_.faces[faceA_].c, 
                                geometry_.faces[faceB_].a, geometry_.faces[faceB_].b, geometry_.faces[faceB_].c, 
                                geometry_.faces[faceC_].a, geometry_.faces[faceC_].b, geometry_.faces[faceC_].c ].sort();
                
                var sideA = [geometry_.faces[faceA_].a, geometry_.faces[faceA_].b, geometry_.faces[faceA_].c];
                var sideB = [geometry_.faces[faceB_].a, geometry_.faces[faceB_].b, geometry_.faces[faceB_].c];
                var sideC = [geometry_.faces[faceC_].a, geometry_.faces[faceC_].b, geometry_.faces[faceC_].c];
                
                var counter = 0;
                var duplicates = {}; 
        
                values.forEach(function(x) { duplicates[x] = (duplicates[x] || 0) + 1; });

                for (const key of Object.keys(duplicates)) { 
                    
                    if(duplicates[key] == 2) { vertices.push(key); } 
                    else if(duplicates[key] == 3) { peak = key; } 
                    
                }
                
                delete sideA[peak];
                delete sideB[peak];
                delete sideC[peak];
   
                return  [ Number(vertices[0]), Number(vertices[1]) ];
                                                                              
            }

            function resolveChains(input_){
                
                var chains = [];
                var back = {};
                var used = {};
                var counter = 0;

                for(var i = 0; i < input_.length; i++){

                    var a = input_[i][0]; var b = input_[i][1];

                    if (back[a] == undefined) { back[a] = [b, 0]; }
                    else { back[a] = [ back[a][0],  b]; }

                    if(back[b] == undefined) { back[b] = [a , 0]; }
                    else { back[b] = [ back[b][0],  a]; }

                    }

                    Object.keys(back).forEach(function(key) {

                        used[key] = false;

                    });

                    chains.push([]);
                    Object.keys(back).forEach(function(key) {

                        var R = back[key][0];
                        while (used[R] == false){

                            used[R] = true;
                            chains[counter].push(R);

                            if (used[back[R][0]] == false) { R = back[R][0]; }
                            else { R = back[R][1]; }

                        }

                        chains.push([]);
                        counter++;

                    });
        
            chains.clean();
            chains.createLoop();
            
            return chains;
                
            }

            function checkAdjacent(faceA_, faceB_){
                
                var values = [faceA_.a, faceA_.b, faceA_.c, faceB_.a, faceB_.b, faceB_.c].sort();
                
                var counter = 0;
                var duplicates = {}; 
        
                values.forEach(function(x) { duplicates[x] = (duplicates[x] || 0) + 1; if(duplicates[x] > 1) { counter++; } });
 
                if(counter == 2) { return true; } else { return false; }
                
            }

            THREE.Face3.prototype.edge = null;
            Array.prototype.createLoop = function() {
            
            for (var i = 0; i < this.length; i++) {
                
                this[i].push(this[i][0]);
            
            }
            
            return this;

            };
        
            Array.prototype.clean = function() {

                for (var i = 0; i < this.length; i++) {

                if (this[i].length == 0) { this.splice(i, 1); i--; } }

                return this;

            };