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

COMMENTS

I did textures as image files for possible reinforcing visual aestetics through making blury edges

*/

    //3D vs. Toolkit ratio
    var sceneWidth, sceneHeight, aspectRatio;

    //Wavefront OBJ URL
    var OBJ_URL = "assets/femaleWithAnchors.obj";
    var bodyOffsetY = -96.0;

    //THREE.JS parameters
    var container, camera, scene, renderer, raycaster;
    var mouse = new THREE.Vector2(), INTERSECTED;
    var mouseX = 0, mouseY = 0;
    var windowHalfX = sceneWidth / 2;
    var windowHalfY = sceneHeight / 2;

    var cameraRotation = { x: 0.2, y: 0.05 };

    //JSON [body data]
    var JSON_URL = "data/data.json";
    var json, currentPart, data, anchorPositions = [];
    var parts =  [ "Waist", "Hips", "Bicep_R", "Bicep_L", "Thigh_R", "Thigh_L", "Calf_R", "Calf_L" ];

    //3D model parameters
    var defaultTexture, positiveTexture, negativeTexture;

    //HUD: Head-up display [+]
    var hudBitmap, hudTexture, cameraHUD;

    //toolkit
    var toolkit;

    inits();
    animate();

    //JSON loader based, jQuery
    $(document).ready(function() {

        $.ajax({
            url: JSON_URL,
            dataType: "text",
            success: function(data_) { json = $.parseJSON(data_); }
        });
        
    });

    function makeFloorGrid(y_, step_, size_){
        
        var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
        var geometry = new THREE.Geometry();

        var floor = y_, step = step_, size = size_;
		
        for ( var i = 0; i <= size / step * 2; i ++ ) {
            
            geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
            geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
            geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
            geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );
            
        }
                
        var grid = new THREE.LineSegments( geometry, material );
        scene.add( grid );
 
    }

    function loadTexture(manager_, url_) {

        var texture = new THREE.Texture();
        
        var loader = new THREE.ImageLoader( manager_ );
        loader.load( url_, function ( image ) {
            
            texture.image = image;
            texture.needsUpdate = true;
            
        } );
        
        return texture;
        
    }

    function hideAnchors(object_) {
        
        for(var i = 0; i < parts.length; i++) {
            
            var name = parts[i] + "_Anchor";
            if(object_ == name) { return true; } 
         
        }
        
        return false;
        
    }

    function initHUD(){
        
        var hudCanvas = document.createElement("canvas");
  
        hudCanvas.width =  sceneWidth
        hudCanvas.height =  sceneHeight;

        hudBitmap = hudCanvas.getContext('2d');

        setHighPPI(hudCanvas);

        hudBitmap.beginPath();
        hudBitmap.arc(0, 0, 16, 0, 2 * Math.PI, false);
        hudBitmap.fillStyle = '#FFFFFF';
        hudBitmap.fill();
        hudBitmap.font = "Normal 14px Trebuchet MS";
        hudBitmap.textAlign = 'center';
        hudBitmap.fillStyle = "rgba(255, 255, 255, 0.75)";

        cameraHUD = new THREE.OrthographicCamera(-sceneWidth/2,  sceneWidth/2,  sceneHeight/2, -sceneHeight/2, 0, 30 );
        sceneHUD = new THREE.Scene();

        hudTexture = new THREE.Texture(hudCanvas) 
        hudTexture.needsUpdate = true;
        hudTexture.minFilter = THREE.LinearFilter
        
        var material = new THREE.MeshBasicMaterial( {map: hudTexture} );
        material.transparent = true;

        var planeGeometry = new THREE.PlaneGeometry(  sceneWidth, sceneHeight );
        var plane = new THREE.Mesh( planeGeometry, material );
        plane.needsUpdate = true;
        sceneHUD.add( plane );
 
    }

    function updateHUD(){

        hudBitmap.clearRect(0, 0,  sceneWidth,  sceneHeight); 
        
        for(var i = 0; i < parts.length; i++){
            
            var object = scene.getObjectByName(parts[i] + "_Anchor" , true);
            var position = object.geometry.vertices[0];
            var xy = screenXY(position, camera);
            hudBitmap.fillText("+", xy.x, xy.y);
     
        }
        
        hudTexture.needsUpdate = true;
        
    }

    function setColor(case_, type_){
        
        if( case_ == 1  && type_ == -1) { return this.positiveTexture; }
        if( case_ == 1  && type_ == 1) { return this.negativeTexture; }
        if( case_ == -1  && type_ == -1) { return this.negativeTexture; }
        if( case_ == -1  && type_ == 1) { return this.positiveTexture; }
        
        return this.defaultTexture;
    }

    function inits() {
        
        container = document.getElementById("scene3D");
        
        sceneWidth = document.getElementById("scene3D").offsetWidth;
        sceneHeight = document.getElementById("scene3D").offsetHeight;
        aspectRatio = sceneWidth / sceneHeight;
        
        console.log( sceneWidth, sceneHeight );
        
        camera = new THREE.PerspectiveCamera( 45, sceneWidth / sceneHeight, 1, 2000 );
        camera.position.z = 250;
        
        scene = new THREE.Scene();
        
        var ambient = new THREE.AmbientLight( 0x101030 );
        scene.add( ambient );
				
        var directionalLight = new THREE.DirectionalLight( 0xFFEEDD );
        directionalLight.position.set( 0, 0, 1 );
        scene.add( directionalLight );
        
        //grid floor
        makeFloorGrid(-94.0, 16.0, 64.0);

        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) { 
            
        //console.log( item, loaded, total ); 
        
        };
        
        var onProgress = function ( xhr ) {
            
            if ( xhr.lengthComputable ) {
                
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
	        }
        };
                
        var onError = function ( xhr ) { alert("broken URL");  };
        
        //initializing textures
        defaultTexture = loadTexture(manager, "assets/default.jpg");
        positiveTexture = loadTexture(manager, "assets/positive.jpg");
        negativeTexture = loadTexture(manager, "assets/negative.jpg");
        
        //Wavefront OBJ loader
        var loader = new THREE.OBJLoader( manager );
        
        loader.load( OBJ_URL, function ( object ) {
            
            object.traverse( function ( child ) {
                
                if ( child instanceof THREE.Mesh ) { 
                    
                    child.material.map = defaultTexture; 
                    child.geometry = new THREE.Geometry().fromBufferGeometry( child.geometry );
                    if(hideAnchors(child.name)) { child.visible = false; 
                
                     }
         
                }
                
            } );
            
            object.position.y = bodyOffsetY;
            object.name = "body";
            scene.add( object );
            
        }, onProgress, onError );
        
        raycaster = new THREE.Raycaster();
                
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( sceneWidth,sceneHeight);
        renderer.autoClear = false;
        renderer.setClearColor(0x494949, 1.0);
        container.appendChild( renderer.domElement );
        
        //initializing toolkit
        toolkit = new Toolkit(document.getElementById("toolkit"));
        
        initHUD();
        
        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    }

    function animate() {
        
        requestAnimationFrame( animate );
        render();
        
    }

    function render() {
        
        camera.position.x += ( mouseX - camera.position.x ) * cameraRotation.x;
        camera.position.y += ( - mouseY - camera.position.y ) * cameraRotation.y;
        camera.lookAt( scene.position );
        
        //body interaction
        if(scene.getObjectByName( "body" ) != null) {
             
             var intersects = raycaster.intersectObjects( scene.getObjectByName( "body" ).children );
             if ( intersects.length > 0 ) {
                 
                 if ( INTERSECTED != intersects[ 0 ].object ) {
                     
                     for(var i = 0; i < parts.length; i++) {
                            
                         if ( INTERSECTED ) INTERSECTED.material.map = defaultTexture;
                         INTERSECTED = intersects[ 0 ].object;
                         if(INTERSECTED.name == parts[i]) {
                             
                             if(getDelta(json.body[parts[i]]) < 0){ INTERSECTED.material.map = setColor(1, json.body[parts[i]].type); data = json.body[parts[i]]; currentPart = INTERSECTED.name;  } 
                             else { INTERSECTED.material.map = setColor(-1, json.body[parts[i]].type);  data = json.body[parts[i]]; currentPart = INTERSECTED.name; } 
                             break;
                             
                         }

                     }
                 }
             } else { if ( INTERSECTED ) INTERSECTED.material.map = defaultTexture; INTERSECTED = null; data = null; currentPart = null; }

        }
        
        toolkit.update(currentPart, data);
        raycaster.setFromCamera( mouse, camera );
        
        if(json != null && scene.getObjectByName( "body" ) != null) { updateHUD(); }
        
        renderer.clear();
        renderer.render( scene, camera );
        renderer.render( sceneHUD, cameraHUD );
        
    }

    function onWindowResize() {
        
        sceneWidth = document.getElementById("scene3D").offsetWidth;
        sceneHeight = document.getElementById("scene3D").offsetHeight;
        //document.getElementById("scene3D").offsetHeight;

        camera.aspect = sceneHeight / sceneHeight;
        camera.updateProjectionMatrix();
        //cameraHUD.aspect = sceneHeight / sceneHeight;
        //cameraHUD.updateProjectionMatrix();
        renderer.setSize( sceneWidth, sceneHeight );
        
        toolkit.resize();
        initHUD();
        
    }

    function onDocumentMouseMove( event ) {
        
        event.preventDefault();
        mouse.x = ( event.clientX / sceneWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / sceneHeight ) * 2 + 1;
        mouseX = ( event.clientX - sceneWidth / 2 ) / 2;
		mouseY = ( event.clientY - sceneHeight / 2 ) / 2;
        
    }



