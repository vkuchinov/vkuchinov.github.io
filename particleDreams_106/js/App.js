/*

ParticleShader "tPos"
UVmapShader 
SimShader "tPrev", "tCurr"

https://threejs.org/examples/webgl_morphtargets_horse.html
https://threejs.org/examples/webgl_buffergeometry_morphtargets.html

*/

var cloneDefines = function(src_) {
    
    var dst = {};
    for (var d in src_) {
        
        dst[d] = src_[d];
        
    }
    return dst;
    
};

var createShaderMaterial = function(shader_) {
    
    return new THREE.ShaderMaterial({
        
        defines: cloneDefines(shader_.defines),
        uniforms: THREE.UniformsUtils.clone(shader_.uniforms),
        vertexShader: shader_.vertexShader,
        fragmentShader: shader_.fragmentShader
        
    });
    
};

var ShaderPass = function(shader_) {
    
    if (shader_ instanceof THREE.Material) { this.material = shader_; }
    else{ this.material = createShaderMaterial(shader_); }

    this.material.blending = THREE.NoBlending;
    this.material.depthWrite = false;
    this.material.depthTest = false;

    var triangle = new THREE.BufferGeometry();
    var p = new Float32Array(9);
    p[0] = -1; p[1] = -1; p[2] = 0;
    p[3] =  3; p[4] = -1; p[5] = 0;
    p[6] = -1; p[7] =  3; p[8] = 0;
    var uv = new Float32Array(6);
    uv[0] = 0; uv[1] = 0;
    uv[2] = 2; uv[3] = 0;
    uv[4] = 0; uv[5] = 2;
    triangle.addAttribute("position", new THREE.BufferAttribute(p, 3));
    triangle.addAttribute("uv", new THREE.BufferAttribute(uv, 2));

    this.mesh = new THREE.Mesh(triangle, this.material);
    this.scene  = new THREE.Scene();
    this.scene.add(this.mesh);
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

    this.clear = false;
    
};

ShaderPass.prototype.render = function(renderer_, writeBuffer_) { 
    
    renderer_.setRenderTarget(writeBuffer_);
    renderer_.render(this.scene, this.camera); 

};
 
var UVMapper = function(renderer_) {
    
    var _renderer = renderer_;

    var _camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    var _scene  = new THREE.Scene();

    var _mat = createShaderMaterial(UVMapShader);
    _mat.side = THREE.DoubleSide;
    _mat.blending = THREE.NoBlending;
    _mat.depthTest = false;
    _mat.depthWrite = false;
    _mat.morphTargets = true;
    _scene.overrideMaterial = _mat;

    this.render = function(mesh_, target_) {
        
        _scene.add(mesh_);
        _renderer.setRenderTarget(target_);
        _renderer.render(_scene, _camera);
        _renderer.setRenderTarget(null);
        _scene.remove(mesh_);
        
    };

    this.createTarget = function(size_) {
        
        var target = new THREE.WebGLRenderTarget(size_, size_, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: false,
            stencilBuffer: false
        });
        
        target.texture.generateMipmaps = false;

        return target;
        
    };

    this.createMap = function(mesh_, size_) {
        
        var target = this.createTarget(size_);
        this.render(mesh_, target);
        return target;
    };
    
};

var UVMapAnimator = function(renderer_, size_) {
    
    var _this = this;
    var _mesh;
    var _mapper = new UVMapper(renderer_);
    var _speed = 1.0;

    this.target = _mapper.createTarget(size_);

    this.update = function(dt_, t_) {
        
        if (!_mesh) { return; }
        
        _mesh.mixer.update(dt_ * 0.1);
        _mapper.render(_mesh, _this.target);
    };

    this.setMesh = function(mesh) { _mesh = mesh; };
    
};

var RenderContext = function(canvas_) {

    var _this = this;
    var _canvas = canvas_;
    var _renderer;
    var _w, _h, _aspect;
    var _camera;
    var _scene;
    var _controls;

    var _updateFuncs = [];

    var _rendererParams = {
        
        canvas: _canvas,
        alpha: false,
        depth: true,
        stencil: false,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        logarithmicDepthBuffer: false,
        autoClear: false,
        clearColor: 0x0,
        clearAlpha: 0,
        sortObjects: true,
        shadowMapEnabled: false,
        shadowMapType: THREE.PCFShadowMap,
        shadowMapCullFace: THREE.CullFaceFront,
        shadowMapDebug: false,
        
    };

    var _cameraParams = {
        
        fov: 45,
        near: 1,
        far: 1000
        
    };

    var _initRenderer = function() {
        
        _renderer = new THREE.WebGLRenderer(_rendererParams);
        _renderer.setSize(_w, _h);
        _renderer.setClearColor(_rendererParams.clearColor, _rendererParams.clearAlpha);
        _renderer.autoClear = _rendererParams.autoClear;
        _renderer.sortObjects = _rendererParams.sortObjects;
        _renderer.shadowMap.enabled = _rendererParams.shadowMapEnabled;
        _renderer.shadowMap.type = _rendererParams.shadowMapType;
        _renderer.shadowMapDebug = _rendererParams.shadowMapDebug;
        
    };

    this.init = function() {
        
        _w = _canvas.clientWidth;
        _h = _canvas.clientHeight;
        _aspect = _w/_h;

        _initRenderer();

        _camera = new THREE.PerspectiveCamera(
            _cameraParams.fov,
            _aspect,
            _cameraParams.near,
            _cameraParams.far
        );

        _scene = new THREE.Scene();

        this.customInit();
        
    };

    this.setSize = function(w_, h_) {
        
        _w = w_;
        _h = h_;
        _aspect = _w/_h;

        _renderer.setSize(_w, _h);

        _camera.aspect = _aspect;
        _camera.updateProjectionMatrix();

    };

    this.update = function(dt_) {
        
        _renderer.setRenderTarget(null);

        for (var i = 0; i < _updateFuncs.length; i++) { _updateFuncs[i](dt_); }

        _renderer.render(_scene, _camera);

    };

    this.customInit = function() {
        
        _camera.position.y = 5;
        _camera.position.z = 10;

    };

    this.getRenderer = function() { return _renderer; };

    this.getScene = function() { return _scene; };

    this.getCamera = function() { return _camera; };

};

var ParticleEngine = function(params_) {

    var _this = this;
    var _canvas;
    var _updateLoop;
    var _renderer, _camera, _scene;
    var _sim, _simMat, _initMat, _drawMat;
    var _mouse;
    var _controls, _raycaster;
    var _leapMan;
    var _customUpdate;
    var _pauseSim = false;

    params_ = params_ || {};
    _size = params_.size || 512;
    _simMat = params_.simMat || createShaderMaterial(BasicSimShader);
    _initMat = params_.initMat || createShaderMaterial(SimInitShader);
    _drawMat = params_.drawMat || createShaderMaterial(BasicParticleShader);
    _customUpdate = params_.update;

    var _onWindowResize = function() { _renderer.setSize(window.innerWidth, window.innerHeight); };

    var _onFrameUpdate = function(dt_, t_) {
        
        if (!_controls.enabled) { _controls.update(); }
        if(_customUpdate) { _customUpdate(dt_, t_); }

        _renderer.update(dt_);
        
    };

    var _onFixedUpdate = function(dt_, t_) { if (!_pauseSim) _sim.update(dt_, t_); };

    var _init = function() {
        
        window.addEventListener("resize", _onWindowResize, false);
        
        _updateLoop = new UpdateLoop();
        
        _updateLoop.frameCallback = _onFrameUpdate;
        _updateLoop.fixedCallback = _onFixedUpdate;

        _canvas = document.querySelector("#webgl-canvas");

        _renderer = new RenderContext(_canvas);
        _renderer.init();
        _camera = _renderer.getCamera();
        _scene = _renderer.getScene();
        
    };

    var _sceneInit = function() {
        
        _sim = new ParticleSimulation(_renderer.getRenderer(), _size, {
            simMat: _simMat,
            initMat: _initMat,
            drawMat: _drawMat
        });
        
        _scene.add(_sim.getParticleObject());

        _camera.position.set(0, 4, 8);
        _controls = new THREE.OrbitControls(_camera, _canvas);
        _controls.autoRotate = true;
        _controls.autoRotateSpeed = 1.0;
        _controls.enablePan = true;
        //_controls.enabled = false; 

        var tmat = (new THREE.Matrix4()).compose(
            new THREE.Vector3(0.0, -3.0, -_camera.position.z),
            new THREE.Quaternion(),
            new THREE.Vector3(0.015, 0.015, 0.015));
        _simMat.defines.MULTIPLE_INPUT = "";
        _simMat.needsUpdate = true;
        
    };

    var _inputUpdate = function() { _simMat.uniforms.uInputPosAccel.value.set(0, 0, 0, 0); };

    this.start = function() { _updateLoop.start(); };

    _init();

    _sceneInit();

    this.renderer = _renderer;
    this.scene = _scene;
    this.camera = _camera;
    
};

var ParticleSimulation = function(renderer_, size_, params_) {
    
    var _this = this;
    var _size = size_;
    var _sim, _simMat, _initMat, _drawMat, _particles;

    params_ = params_ || {};

    var _createParticleGeometry = function(size_) {
        
        var geo = new THREE.BufferGeometry();
        var pos = new Float32Array(size_ * size_ * 3);
        
        for (var x = 0; x < size_; x++) {
            for (var y = 0; y < size_; y++) {
                
                var idx = x + y * size_;
                pos[3 * idx] = (x+0.5) / size_;
                pos[3 * idx + 1] = (y + 0.5) / size_;
                pos[3 * idx + 2] = idx / (size_ * size_);
                
            }
        }
        
        geo.addAttribute("position", new THREE.BufferAttribute(pos, 3));
        return geo;
        
    };

    var _init = function() {
        
        _simMat = params_.simMat || createShaderMaterial(SimShader);
        _initMat = params_.initMat || createShaderMaterial(SimInitShader);

        _sim = new SimulationRenderer(
            
            renderer_,
            _simMat,
            _initMat,
            _size
        );

        _drawMat = params_.drawMat || createShaderMaterial(ParticleShader);
        _drawMat.blending = THREE.AdditiveBlending;
        _drawMat.transparent = true;
        _drawMat.depthTest = false;
        _drawMat.depthWrite = false;
        _sim.registerUniform(_drawMat.uniforms.tPos);

        var geo = _createParticleGeometry(_size);
        _particles = new THREE.Points(geo, _drawMat);
        _particles.frustumCulled = false;
        
    };

    this.getParticleObject = function() { return _particles; };

    _init();

    this.update = _sim.update;
    
};

var SimulationRenderer = function(renderer_, simMat_, initMat_, size_) {

    var _this = this;
    var _renderer = renderer_;
    var _size = size_;
    var _target1, _target2, _target3, _outTargetPtr;
    var _simPass, _initPass, _debugPass;
    var _registeredUniforms = [];
    var _currUpdateTarget;

    var _checkSupport = function() {
        
        var gl = _renderer.context;

        if ( gl.getExtension( "OES_texture_float" ) === null ) {
            
            console.error("SimulationRenderer: OES_texture_float not supported.");
            return false;
            
        }

        if ( gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) === 0 ) {
            
            console.error("SimulationRenderer: Vertex shader textures not supported.");
            return false;
            
        }

        return true;
    };

    var _createTarget = function(size_) {
        
        var target = new THREE.WebGLRenderTarget(size_, size_, {
            
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: false,
            stencilBuffer: false
            
        });
        
        target.texture.generateMipmaps = false;
        return target;
        
    };

    var _updateRegisteredUniforms = function() {
        
        for (var i = 0; i < _registeredUniforms.length; i++) { _registeredUniforms[i].value = _outTargetPtr.texture; }
        
    };

    this.update = function(dt_, t_) {
        
        _simPass.material.uniforms.uDeltaT.value = dt_;
        _simPass.material.uniforms.uTime.value = t_;

        if (_currUpdateTarget === 1) {
            
            _simPass.material.uniforms.tPrev.value = _target2.texture;
            _simPass.material.uniforms.tCurr.value = _target3.texture;
            _simPass.render(_renderer, _target1);
            _outTargetPtr = _target1;
            
        }
        else if (_currUpdateTarget === 2) {
            
            _simPass.material.uniforms.tPrev.value = _target3.texture;
            _simPass.material.uniforms.tCurr.value = _target1.texture;
            _simPass.render(_renderer, _target2);
            _outTargetPtr = _target2;
            
        }
        else if (_currUpdateTarget === 3) {
            
            _simPass.material.uniforms.tPrev.value = _target1.texture;
            _simPass.material.uniforms.tCurr.value = _target2.texture;
            _simPass.render(_renderer, _target3);
            _outTargetPtr = _target3;
            
        }
        else { console.error("SimulationRenderer: something's wrong!"); }
        
        _simPass.material.uniforms.tPrev.needsUpdate = true;
        _simPass.material.uniforms.tCurr.nwwdsUpdate = true;
        
        _updateRegisteredUniforms();
        _currUpdateTarget++;
        
        if (_currUpdateTarget > 3) { _currUpdateTarget = 1; }
        
    };

    this.registerUniform = function(uniform_) {
        
        _registeredUniforms.push(uniform_);
        uniform_.value = _outTargetPtr.texture;
        
    };

    this.reset = function() {
        
        _initPass.render(_renderer, _target1);
        _initPass.render(_renderer, _target2);
        _initPass.render(_renderer, _target3);
        
    };

    _checkSupport();

    _target1 = _createTarget(_size);
    _target2 = _createTarget(_size);
    _target3 = _createTarget(_size);

    _target1.name = "SimulationRenderer._target1";
    _target2.name = "SimulationRenderer._target2";
    _target3.name = "SimulationRenderer._target3";

    _currUpdateTarget = 1;
    _outTargetPtr = _target1;

    _simPass = new ShaderPass(simMat_);
    _initPass = new ShaderPass(initMat_);

    this.reset();
    
};

var UpdateLoop = function() {

    var _this = this;
    var _timer = 0.0;
    var _timeScale = 1.0;
    var _fixedTimer = 0.0;
    var _fixedTimeRemainder = 0.0;
    var _FIXED_TIME_STEP = 0.02;
    var _FIXED_TIME_STEP_MAX = 0.2;

    var _clock = new THREE.Clock(false);

    var _requestId;

    var _fixedUpdate = function() {
        
        var fixedDt = _FIXED_TIME_STEP * _timeScale;
        _fixedTimer += fixedDt;
        _this.fixedCallback(fixedDt, _fixedTimer);
        
    };

    var _frameUpdate = function() {
        
        var frameDt = _clock.getDelta();

        _timer += frameDt * _timeScale;
        _fixedTimeRemainder += frameDt;

        if (_fixedTimeRemainder > _FIXED_TIME_STEP_MAX) { _fixedTimeRemainder = _FIXED_TIME_STEP_MAX; }

        while (_fixedTimeRemainder > _FIXED_TIME_STEP) {
            
            _fixedUpdate();
            _fixedTimeRemainder -= _FIXED_TIME_STEP;
            
        }

        _this.frameCallback(frameDt, _timer);
        
    };

    var _loop = function() {
        
        //custom updates
        
        _params.simMat.uniforms.tTarget.value = _uvAnim.target.texture;
        _params.simMat.uniforms.tTarget.needsUpdate = true;
        
        _frameUpdate();
        _requestId = window.requestAnimationFrame(_loop);
        
    };

    this.start = function() {
        
        if (!_requestId) {
            
            _clock.start();
            _loop();
            
        }
    };

    this.stop = function() {
        
        if (_requestId) {
            
            window.cancelAnimationFrame(_requestId);
            _requestId = undefined;
            _clock.stop();
            
        }
        
    };

    this.setTimeScale = function(scale_) { _timecale = Math.max(scale_, 0); };

};

var isMobile = isMobileFunc();

var rendererParameters = {
    
    alpha: false,
    depth: true,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    logarithmicDepthBuffer: false,
    autoClear: false,
    clearColor: 0x000000,
    clearAlpha: 0,
    sortObjects: true,
    shadowMapEnabled: false,
    shadowMapType: THREE.PCFShadowMap,
    shadowMapCullFace: THREE.CullFaceFront,
    shadowMapDebug: false
    
};

var particlesParameters = {
    
    textureSize: isMobile ? 128 : 512,
    shape: { scale: 0.025, offset: new THREE.Vector3(-1.0, 0.0, 0.0), rotation: new THREE.Vector3(0, 0, 0), speed: 0.08, url: "models/horse.json" },
    background: 0x000000,
    color1: new THREE.Color(0xFF00FF),
    color2: new THREE.Color(0xFF6D00),
    alpha: 0.2,
    speed: 2.0,
    freq: 1.0,
    size: 1.5,
    gravity: 3.0,
    shapeGravity: 1.0
    
};

var _gui, _guiFields;
var _engine;
var _currPreset = "galaxy"; 
var _currSimMode;
var _uvAnim;

var _params = {
    
    size: 512,
    simMat: createShaderMaterial(SimShader),
    drawMat: createShaderMaterial(ParticleShader),
    update: undefined, 
};

var _simModes = [

    "SIM_GALAXY",
    "SIM_TEXTURE"

];

var _meshes = {
    
    horse: { scale: 0.018, offset: new THREE.Vector3(0.1, -1.8, 0.1), rotation: new THREE.Vector3(0.0,  Math.PI / 2.0, 0.0), speed: 0.10, url: "models/horse.glb" },
    
};

var _presets = {
    
    "none":{ "u ser gravity": 3, "shape gravity": 1, _shape: "" },
    "galaxy": { "user gravity": 3, "shape gravity": 1, _shape: "SIM_GALAXY" },
    "horse": { "user gravity": 3, "shape gravity": 5, _shape: _meshes.horse }
    
    
};

var _setSimMode = function(name_) {
    
    if (name_ === _currSimMode) { return; }
    
    _currSimMode = name_;
    _simModes.forEach(function(s_) { delete _params.simMat.defines[s_]; });
    if (name_) { _params.simMat.defines[name_] = ""; }
    _params.simMat.needsUpdate = true;

};

var _setPreset = function(name_) {
        
    var preset = _presets[name_];
    _currPreset = name_;

    if (preset._shape.length >= 0) {
        
        console.log("procedural");
        _setSimMode(preset._shape);
        _uvAnim.setMesh();
        
    }
    else {
        
        console.log("3d model")
        _setSimMode("SIM_TEXTURE");
        _uvAnim.setMesh(preset._shape.mesh);
        
    }

    _guiFields["user gravity"]  = _params.simMat.uniforms.uInputAccel.value = preset["user gravity"];
    _guiFields["shape gravity"] = _params.simMat.uniforms.uShapeAccel.value = preset["shape gravity"];
    
};

var _update = _params.update = function(dt_, t_) {
    
    _params.drawMat.uniforms.uTime.value = t_;
    _uvAnim.update(dt_, t_);
    
};

var _init = function() {
    
    _engine = new ParticleEngine(_params);
    _uvAnim = new UVMapAnimator(_engine.renderer.getRenderer(), _params.size);
    _params.simMat.uniforms.tTarget = { type: "t", value: _uvAnim.target.texture };
    
};

var _initUI = function() {
    
    _gui = new dat.GUI();
    _guiFields = {
    
        "shape": _currPreset

    };

    _gui.add(_guiFields, "shape", Object.keys(_presets)).onFinishChange(_setPreset);
    _gui.closed = true;

};

var _loadMeshes = function() {
    
    var loader = new THREE.GLTFLoader();
    
        Object.keys(_meshes).forEach(function(k_) {
            
            loader.load(_meshes[k_].url, function(gltf_) {
                
                var mesh = gltf_.scene.children[ 0 ];
                mesh.rotation.set(_meshes[k_].rotation.x, _meshes[k_].rotation.y, _meshes[k_].rotation.z);
                mesh.position.set(_meshes[k_].offset.x, _meshes[k_].offset.y, _meshes[k_].offset.z);
                mesh.scale.set(_meshes[k_].scale,_meshes[k_].scale,_meshes[k_].scale);
                mesh.name = k_;
                mesh.mixer = new THREE.AnimationMixer( mesh );
                mesh.mixer.clipAction( gltf_.animations[ 0 ] ).setDuration( 100.0 ).play();
            
                _meshes[k_].mesh = mesh;

                if (_currPreset === k_) { _uvAnim.setMesh(mesh); }
                
            });
    });
    
};

var _setParameters = function(){
    
    var rgb1 = getRGBValues(particlesParameters.color1);
    
    _params.drawMat.uniforms.uColor1.value.x = particlesParameters.color1.r;
    _params.drawMat.uniforms.uColor1.value.y = particlesParameters.color1.g;
    _params.drawMat.uniforms.uColor1.value.z = particlesParameters.color1.b;

    var rgb2 = getRGBValues(particlesParameters.color2);
    
    _params.drawMat.uniforms.uColor2.value.x = particlesParameters.color2.r;
    _params.drawMat.uniforms.uColor2.value.y = particlesParameters.color2.g;
    _params.drawMat.uniforms.uColor2.value.z = particlesParameters.color2.b;

    _params.drawMat.uniforms.uAlpha.value = particlesParameters.alpha;
    _params.drawMat.uniforms.uColorSpeed.value = particlesParameters.speed;
    _params.drawMat.uniforms.uColorFreq.value = particlesParameters.freq;
    _params.drawMat.uniforms.uPointSize.value = particlesParameters.size;
    
}

_loadMeshes();
_init();
_initUI();
_setParameters();
_setPreset(_currPreset);
_engine.start();

Utils.loadTextFile = function(url_) {
    
    var result;
    var req = new XMLHttpRequest();
    req.onerror = function() {
        console.log("Error: request error on " + url_);
    };
    req.onload = function() {
        result = this.responseText;
    };
    req.open("GET", url_, false);
    req.send();

    return result;
    
};

function getRGBValues(decimal_){
    
    var r = (decimal_ >> 16) & 0xFF / 256.0,
        g = (decimal_ >> 8) & 0xFF / 256.0,
        b = decimal_ & 0xFF / 256.0;
        
    return new THREE.Vector3(r, g, b);
    
}

function isMobileFunc() {

    if (sessionStorage.desktop)
        return false;
    else if (localStorage.mobile)
        return true;

    var mobile = ["iphone", "ipad", "android", "blackberry", "nokia", "opera mini", "windows mobile", "windows phone", "iemobile"];
    
    for (var i in mobile)
        if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) return true;

    return false;

}