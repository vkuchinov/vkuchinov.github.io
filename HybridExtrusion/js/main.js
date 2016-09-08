//PARAMETERS


//THREE.JS
var container, renderer, camera, scene;
var mouseX = 0, mouseY = 0;

        var controls = new function() {
            this.thickness = 4.0;
            this.depth = 99.0;
            this.scaleX = 1.0;
            this.scaleY = 1.0;
            this.mergedY = false;

        }
        
        var gui = new dat.GUI();
        gui.add(controls, 'thickness', 2.0, 12.0).onChange(function(value){ buildModel(); });
        gui.add(controls, 'depth', 32.0, 256.0).onChange(function(value){ buildModel(); });
        gui.add(controls, 'scaleX', 0.5, 1.5).onChange(function(value){ buildModel(); });
        gui.add(controls, 'scaleY', 0.5, 1.5).onChange(function(value){ buildModel(); });
        gui.add(controls, 'mergedY').onChange(function(value){ buildModel(); });

var objects = new THREE.Object3D();
objects.name = 'objects';

container = document.createElement( 'div' );
document.body.appendChild( container );

var SVG_URL = "assets/sample.svg";
var SVG;

var xmlhttp = getXmlHttp()
xmlhttp.open("POST", SVG_URL, true);

xmlhttp.onreadystatechange=function(){
  
  if (xmlhttp.readyState != 4) return
  clearTimeout(timeout);

  if (xmlhttp.status == 200) {
      
      //OK
      SVG = new SVGObject(xmlhttp.responseXML);
      SVG.parseXML();
      
      WebGLSceneSetup();

  } else {
      
      //ERROR
      handleError(xmlhttp.statusText);
      alert("Oops, something wrong with SVG file!");
  }
}

xmlhttp.send("a=5&b=4");
var timeout = setTimeout( function(){ xmlhttp.abort(); handleError("Timeout is over") }, 10000);

function handleError(message) { alert("Error: " + message); }

function getXmlHttp(){
    
      var xmlhttp;
      try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
          xmlhttp = false;
        }
      }
      if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
        xmlhttp = new XMLHttpRequest();
      }
      return xmlhttp;
    
}

function WebGLSceneSetup(){

    var WIDTH = window.innerWidth, HEIGHT = window.innerHeight, VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;
    
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 512;
    scene.add(camera);
    
    var ambient = new THREE.AmbientLight( 0xAAAAAA );
	scene.add( ambient );

    var directionalLight = new THREE.DirectionalLight( 0xFFEEDD);
    directionalLight.position.set( 0, -200, -200 );
    scene.add( directionalLight );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xDEDEDE, 1.0 );
    container.appendChild( renderer.domElement );

    //pivot point
    var pivotMaterial = new THREE.MeshLambertMaterial( {color: 0x00FFFF} ); 
    var pivotGeometry = new THREE.SphereGeometry( 4, 32, 16);
    var pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    scene.add(pivot);
    
    var floorTextureLoader = new THREE.TextureLoader();
    var floorTexture = floorTextureLoader.load( 'assets/checkerboard.jpg' );
    
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
    
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);

    buildModel();
    
    //listeners
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    
    scene.position.y += 100;
    animate();

}

function lineToGeometry(p0_, p1_, offset_, depth_, material_) {

		    var L = Math.sqrt((p0_.x - p1_.x) * (p0_.x - p1_.x) + (p0_.y - p1_.y) * (p0_.y - p1_.y));
      
            var points = [];
                
            points.push(new THREE.Vector2(p0_.x + offset_ * (p1_.y - p0_.y) / L, p0_.y + offset_ * (p0_.x - p1_.x) / L));
            points.push(new THREE.Vector2(p0_.x - offset_ * (p1_.y - p0_.y) / L, p0_.y - offset_ * (p0_.x - p1_.x) / L));
            points.push(new THREE.Vector2(p1_.x - offset_ * (p1_.y - p0_.y) / L, p1_.y - offset_ * (p0_.x - p1_.x) / L ));
            points.push(new THREE.Vector2(p1_.x + offset_ * (p1_.y - p0_.y) / L, p1_.y + offset_ * (p0_.x - p1_.x) / L));
            
            var shape = new THREE.Shape( points );

            var extrusionSettings = {
                steps           : 1,
                bevelEnabled    : false,
                amount          : depth_
            };
                
            var extrudedGeometry = new THREE.ExtrudeGeometry( shape, extrusionSettings ); 
                
            return new THREE.Mesh( extrudedGeometry , material_ );

}

function planeToGeometry(p0_, p1_, depth_, material_) {

            var x_ = p0_.x; 
            var y_ = p0_.y;
    
            var width_ = p1_.x - p0_.x;
            var height_ = p1_.y - p0_.y;
    
            var points = [];
                
            points.push(new THREE.Vector2(x_, y_));
            points.push(new THREE.Vector2(x_ + width_, y_));
            points.push(new THREE.Vector2(x_ + width_, y_ + height_));
            points.push(new THREE.Vector2(x_, y_ + height_));
            
            var shape = new THREE.Shape( points );

            var extrusionSettings = {
                steps           : 1,
                bevelEnabled    : false,
                amount          : depth_
            };
                
            var extrudedGeometry = new THREE.ExtrudeGeometry( shape, extrusionSettings ); 
                
            return new THREE.Mesh( extrudedGeometry , material_ );

}


function onWindowResize() {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    
    render();

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - window.innerWidth / 2 ) / 2;
    mouseY = ( event.clientY - window.innerHeight / 2 ) / 2;

}

function buildModel( ) {

if(scene.getObjectByName('objects')) { var objectToRemove = scene.getObjectByName('objects'); scene.remove(objectToRemove); objects = new THREE.Object3D();
objects.name = 'objects'; }
    
for(var g = 0; g < SVG.groups.length; g++){
        
        if(SVG.groups[g].type == "left"){

        var groupMaterial = new THREE.MeshLambertMaterial( {color: 0xFFFF00, side: THREE.DoubleSide} ); 
        var groupWidth = SVG.groups[g].bounds.max.x - SVG.groups[g].bounds.min.x;
        var groupHeight = SVG.groups[g].bounds.max.y - SVG.groups[g].bounds.min.y;
            
        var groupBoundingBox = new THREE.Object3D(); //new THREE.Mesh(new THREE.PlaneGeometry(groupWidth, groupHeight), groupMaterial);

        groupBoundingBox.position.x -= controls.thickness + calculateScaleDifferenceByX();
        if(controls.mergedY) { groupBoundingBox.scale.set(1.0, controls.scaleY, 1.0); }
        //groupBoundingBox.position.y += groupHeight / 2;
            
        for(var c = 0; c < SVG.groups[g].children.length; c++){
            
            //walls
            if(SVG.groups[g].children[c].type == "line") {

                groupBoundingBox.add(lineToGeometry(SVG.groups[g].children[c].points[0], SVG.groups[g].children[c].points[1], controls.thickness, -controls.depth, groupMaterial)); 
            }
            if(SVG.groups[g].children[c].type == "rect") {

                var back = planeToGeometry(SVG.groups[g].children[c].points[0], SVG.groups[g].children[c].points[1], controls.thickness, groupMaterial);
                back.position.z -= controls.depth - controls.thickness;
                groupBoundingBox.add(back); 
            }
            
        }
            

        objects.add(groupBoundingBox);

        }
        
        if(SVG.groups[g].type == "central"){

        var groupMaterial = new THREE.MeshLambertMaterial( {color: 0xFF00FF, side: THREE.DoubleSide} ); 
        var groupWidth = SVG.groups[g].bounds.max.x - SVG.groups[g].bounds.min.x;
        var groupHeight = SVG.groups[g].bounds.max.y - SVG.groups[g].bounds.min.y;
            
        var groupBoundingBox =  new THREE.Object3D(); //new THREE.Mesh(new THREE.PlaneGeometry(groupWidth, groupHeight), groupMaterial);

        for(var c = 0; c < SVG.groups[g].children.length; c++){
            
            //walls
            if(SVG.groups[g].children[c].type == "line") {

                groupBoundingBox.add(lineToGeometry(SVG.groups[g].children[c].points[0], SVG.groups[g].children[c].points[1], controls.thickness, -controls.depth, groupMaterial)); 
            }
            if(SVG.groups[g].children[c].type == "rect") {

                var back = planeToGeometry(SVG.groups[g].children[c].points[0], SVG.groups[g].children[c].points[1], controls.thickness, groupMaterial);
                back.position.z -= controls.depth - controls.thickness;
                groupBoundingBox.add(back); 
            }
            
        }

        //left pivot
        var leftPivotMaterial = new THREE.MeshLambertMaterial( {color: 0xFFFF00} ); 
        var leftPivotGeometry = new THREE.SphereGeometry( 4, 32, 16);
        var leftPivot = new THREE.Mesh(leftPivotGeometry, leftPivotMaterial);
        leftPivot.position.x -= groupWidth / 2;
        groupBoundingBox.add(leftPivot);
            
        //right pivot
        var rightPivotMaterial = new THREE.MeshLambertMaterial( {color: 0x646464} ); 
        var rightPivotGeometry = new THREE.SphereGeometry( 4, 32, 16);
        var rightPivot = new THREE.Mesh(rightPivotGeometry, rightPivotMaterial);
        rightPivot.position.x += groupWidth / 2;
        groupBoundingBox.add(rightPivot);
        
        groupBoundingBox.scale.set(controls.scaleX, controls.scaleY, 1.0);
            
        objects.add(groupBoundingBox);

        }

        if(SVG.groups[g].type == "right"){

        var groupMaterial = new THREE.MeshLambertMaterial( {color: 0x00FFFF, side: THREE.DoubleSide} ); 
        var groupWidth = SVG.groups[g].bounds.max.x - SVG.groups[g].bounds.min.x;
        var groupHeight = SVG.groups[g].bounds.max.y - SVG.groups[g].bounds.min.y;

        var groupBoundingBox = new THREE.Object3D(); //new THREE.Mesh(new THREE.PlaneGeometry(groupWidth, groupHeight), groupMaterial);

        groupBoundingBox.position.x += controls.thickness + calculateScaleDifferenceByX(); 
        if(controls.mergedY) { groupBoundingBox.scale.set(1.0, controls.scaleY, 1.0); }
        //groupBoundingBox.position.y += groupHeight / 2;

        for(var c = 0; c < SVG.groups[g].children.length; c++){
            
            //walls
            if(SVG.groups[g].children[c].type == "line") {

                groupBoundingBox.add(lineToGeometry(SVG.groups[g].children[c].points[0], SVG.groups[g].children[c].points[1], controls.thickness, -controls.depth, groupMaterial)); 
            }
            if(SVG.groups[g].children[c].type == "rect") {

                var back = planeToGeometry(SVG.groups[g].children[c].points[0], SVG.groups[g].children[c].points[1], controls.thickness, groupMaterial);
                back.position.z -= controls.depth - controls.thickness;
                groupBoundingBox.add(back); 
            }
            
        }
            
        objects.add(groupBoundingBox);

        }
        
    }

    scene.add(objects);
    
    animate();
    
}

function calculateScaleDifferenceByX() { return (SVG.central.x * controls.scaleX - SVG.central.x) / 2; }

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render(){

    camera.position.x += ( mouseX - camera.position.x ) * .5;
	camera.position.y += ( - mouseY - camera.position.y ) * .5;

	camera.lookAt( scene.position );
    
    renderer.render( scene, camera );
    
}

