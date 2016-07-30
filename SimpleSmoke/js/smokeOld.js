
    //scene
    scene = new THREE.Scene();
    //camera
    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    //camera.position.set(0,-13,5);
    //camera.lookAt(new THREE.Vector3( 0, 5, 0 ));
    camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = -40;
	camera.lookAt(scene.position);
    //renderer
    var renderer = new THREE.WebGLRenderer();
   // renderer.setClearColorHex(0xEEEEEE);
    renderer.setSize( window.innerWidth, window.innerHeight );
 
    //controls
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
       
    //show canvas
    $("#canvas-container").html(renderer.domElement);
     
     
 //directional light
 var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
 directionalLight.position.set(6, 0, 6);
 scene.add(directionalLight);
  
 //sphere
 //SphereGeometry(RADIUS,SEGMENTWIDTH,SEGMENTHEIGHT)
/* var geometry = new THREE.SphereGeometry(3, 10, 10);
 var material = new THREE.MeshBasicMaterial({wireframe: true,color: 0x555555});
 var sphere = new THREE.Mesh( geometry, material );
 sphere.position.set(0,0,1);
 scene.add( sphere );*/
     
     
    //grid xy
    var gridXY = new THREE.GridHelper(10, 1);
    gridXY.rotation.x = Math.PI/2;
    scene.add(gridXY);
      
     
     
 //particle
 var settings = 
	{
		positionStyle  : Type.CUBE,
		positionBase   : new THREE.Vector3( 0, 0,  0 ),
		positionSpread : new THREE.Vector3(    0,  30, 20 ),
		
		velocityStyle  : Type.CUBE,
		velocityBase   : new THREE.Vector3( 0, 40, 0 ),
		velocitySpread : new THREE.Vector3( 0, 20, 0 ), 
		
		particleTexture : THREE.ImageUtils.loadTexture( 'images/smokeparticle.png'),

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
     
     
   
    //render scene
    var render = function () {
     requestAnimationFrame(render);

     renderer.render(scene, camera);
      
     engine.update( 0.01 * 0.5 );
    };
       
    render();
     

