/**
 *
 * @BREAKING [TIDAL] SYSTEM
 * based on LiquidFun.js & KD-Tree libraries
 * 
 * LiquidFun.js has been used as core physics library and wave machine model 
 * to simulate tidal waves movement. Foam [bluish bubbles] is created by 
 * comparing each particle density with "rest density" or, in this case, 
 * simple algorithm of defining closest neighbours and checking distances. 
 *
 * While there are lots of particles, I have been implemented KD-Tree — 
 * a space-partitioning data structure for organizing points in a k-dimensional 
 * space and making neighbours search more efficient. 
 *
 * The library was made by Ubilabs and coud be found via this a link on GitHub. 
 *
 * Each node would have its own lifetime value and by its death would be replaced by 
 * a new one from XML feed. Virtually it would be the same object, but with 
 * different data, colour and radius.
 *
 * @author Vladimir V. KUCHINOV
 * @email  helloworld@vkuchinov.co.uk
 *
 */

"use strict"
var SCALE_RATIO = 150;
var TIME_RATE = 0.0165; // 1/60

///phase: 0: displaying, 1: pausing
var timing = { interval: 3000, overal: 0, passed: 0, phase: 0 };

var NUM_OF_NEIGHBOURS = 8;
var REST_DISTANCE = 0.132;
var PARTICLE_SIZE = 0.05; //for simulatio

var GROUND_OFFSET = 32;
var SCRREN_MARGINS = 64;
var zero;

//wave machine parameters
var MAX_ANGLE = 0.6;
var ANG_INC = 0.0038;

var machine;
var ang = 0.0;
var timeStep = TIME_RATE, velocityIterations = 8, positionIterations = 3;
var globalPos, globalAngle;

var world = null;   //LiquidFun.js requires world as global
var worldBody, worldShape;

var worldEnds = [[-4.5, 0], [4.5, 0], [4.5, -9], [-4.5, -9]]; 

var mass = [ {nodes:[[-4.4, -1.0], [-4.4, -0.1], [4.4, -1.0], [4.4, -0.1]]} ];

var kdtree; //KD-Tree

var tidalSystem = {
    
    inits : function(dataset_){

        zero = window.innerHeight;
        
        //translate group
        particles.attr("transform", "translate(" + width / 2 + ", " + (height + GROUND_OFFSET) + ")");
        
        var gravity = new b2Vec2(0, 9.8);
        var psd, particleSystem;

		world = new b2World(gravity);
        
        worldBody = world.CreateBody(new b2BodyDef());
		worldShape = new b2ChainShape();
		worldShape.vertices = worldEnds.map(function(node){
			return new b2Vec2(node[0], node[1]);
		});
		worldShape.CreateLoop();
		worldBody.CreateFixtureFromShape(worldShape, 0);
        worldBody.angle = 0;
        
        //ground
        var bd = new b2BodyDef();
        var ground = world.CreateBody(bd);
        
        machine = new b2RevoluteJointDef();
        machine.motorSpeed = 0.05 * Math.PI;
        machine.maxMotorTorque = 1e7;
        machine.enableMotor = true;
        machine.joint = machine.InitializeAndCreate(ground, worldShape, new b2Vec2(0, 0));
        machine.time = 0;
        
        psd = new b2ParticleSystemDef();
		psd.radius = PARTICLE_SIZE;				 
		psd.dampingStrength = 0.1; 
        psd.colorMixingStrength = 1.0;
        
		particleSystem = world.CreateParticleSystem(psd);
        
        mass.forEach(function(def){
            
			var shape = new b2PolygonShape(), pd = new b2ParticleGroupDef();
            
			shape.vertices = def.nodes.map(function(node){
				return new b2Vec2(node[0], node[1]);
			});
			pd.shape = shape;
			particleSystem.CreateParticleGroup(pd);

		});
        
        this.feed(particleSystem, dataset_);

    },
    
    update: function(timer_){
        
        if(timing.phase == 1) { timing.interval = this.exponentialMap(timing.overall, 5000, 1000);  console.log(timing.interval); }
            
        if(timing.passed > timing.interval) { 
           
        //if(timing.state == 0) { timing.interval == 3000; } else { timing.interval = 50; }
        timing.passed = 0;
                                            
        world.Step(timeStep, velocityIterations, positionIterations);
        machine.time += TIME_RATE;
        machine.joint.SetMotorSpeed(0.05 * Math.cos(machine.time) * Math.PI);

        var body = world.bodies[0];
        body.SetTransform(body.GetWorldCenter(), ang);

        if(ang > 0.35 || ang < -0.35) {  ANG_INC *= -1; }
        ang += ANG_INC;
        
        //adjusting the sun
        globalPos = worldBody.GetPosition();
        //globalPos.y += window.innerHeight - zero;
        globalAngle = worldBody.GetAngle() * 180 / Math.PI;
              
        var system = world.particleSystems[0];
        
        var points = [];
        var buffer = system.GetPositionBuffer();
        
        for (var i = 0; i < system.GetParticleCount(); i += 2) {
                points.push({x: buffer[i], y: buffer[i + 1]});
        }
        

        var distance = function(a, b){ return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2); }
        var sqrtDistance = function(a, b){ return Math.sqrt(Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2)); }

        var kd = new kdTree(points, distance, ["x", "y"]);
        var particleGroup = particles.selectAll("g.particle").data(system.particleGroups)
        var positionBuf = system.GetPositionBuffer();
        
        
		particleGroup.enter().append("g").classed("particle", true)
		particleGroup.each(function(pg){

            //check rest distance
            //var nearest = tree.nearest({x: particlesBJS[i].position.x, y: particlesBJS[i].position.y}, NUM_OF_NEIGHBOURS);
            
			var dataSet = d3.select(this).selectAll("circle").data(new Array(pg.GetParticleCount()));
			var offset = pg.GetBufferIndex();
        
            
			dataSet.enter().append("circle")
                           .attr("id", function(d, i) { return "particle_" + nodes[i].id; });
            
            if(gup("mode") == "interactive") { 
                
			//.attr("id", function(d, i){ return "particle_" + i; }, true)
            dataSet.attr("fill",  function(d, i){ 
                                  
                var nearest = kd.nearest({x: positionBuf[(i + offset) * 2], y: positionBuf[(i + offset) * 2 + 1]}, NUM_OF_NEIGHBOURS);
                
                var distances = [];
                
                for(var j = 0; j < nearest.length; j++){
                    
                    distances.push(sqrtDistance({x: Number(positionBuf[(i + offset) * 2]), y: Number(positionBuf[(i + offset) * 2 + 1])}, {x: Number(nearest[j][0].x), y: Number(nearest[j][0].y) }));
                    
                }
                
                 if(Number(positionBuf[(i + offset) * 2]) * SCALE_RATIO + window.innerWidth/2 > 32 &&  Number(positionBuf[(i + offset) * 2]) * SCALE_RATIO + window.innerWidth/2 < window.innerWidth - 32 )  { if(Number(positionBuf[(i + offset) * 2 + 1]) * SCALE_RATIO + window.innerHeight < window.innerHeight - 32) { nodes[i].state = 1; } } else { nodes[i].state = 0; }
                    
                if(Math.max.apply(null, distances) < REST_DISTANCE) {  
                    
                  return nodes[i].color; 
                    
                }else{
                    
                    //move to front
                    d3.select(this).moveToFront();
                    return nodes[i].foam; 
                    
                }
                
                
                        
             })
            .attr("r", function(d, i){ return nodes[i].radius; })
            .attr("cx", function(d, i){
				return positionBuf[(i + offset) * 2] * SCALE_RATIO;
			}).attr("cy", function(d, i){
				return positionBuf[(i + offset) * 2 + 1] * SCALE_RATIO;
			})
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 0.0)
            .on("mouseover", function(d, i) { 
                                           d3.select(this).moveToFront();
                                           d3.select(this).attr("stroke-width", particleStyle.weight); })
            
            .on("mouseout", function(d, i) { d3.select(this).attr("stroke-width", 0.0); })
            .on("click", function(d, i) { var ii = parseInt(d3.select(this).attr("id").replace("particle_", "")); console.log(ii); tidalSystem.click({nodeID: ii, xmlID: nodes[ii].xml}); });
                
            } else {
                
                dataSet.attr("fill",  function(d, i){ 
                                  
                var nearest = kd.nearest({x: positionBuf[(i + offset) * 2], y: positionBuf[(i + offset) * 2 + 1]}, NUM_OF_NEIGHBOURS);
                
                var distances = [];
                
                for(var j = 0; j < nearest.length; j++){
                    
                    distances.push(sqrtDistance({x: Number(positionBuf[(i + offset) * 2]), y: Number(positionBuf[(i + offset) * 2 + 1])}, {x: Number(nearest[j][0].x), y: Number(nearest[j][0].y) }));
                    
                }
                    
                if(Number(positionBuf[(i + offset) * 2]) * SCALE_RATIO + window.innerWidth/2 > 32 &&  Number(positionBuf[(i + offset) * 2]) * SCALE_RATIO + window.innerWidth/2 < window.innerWidth - 32 )  { if(Number(positionBuf[(i + offset) * 2 + 1]) * SCALE_RATIO + window.innerHeight < window.innerHeight - 32) { nodes[i].state = 1; } } else { nodes[i].state = 0; }
                    
                if(Math.max.apply(null, distances) < REST_DISTANCE) {  
                    
                  return nodes[i].color; 
                    
                }else{
                    
                    //move to front
                    d3.select(this).moveToFront();
                    return nodes[i].foam; 
                    
                }
                        
             })
            .attr("r", function(d, i){ return nodes[i].radius; })
            .attr("cx", function(d, i){
//                if(positionBuf[(i + offset) * 2] * SCALE_RATIO < SCRREN_MARGINS || positionBuf[(i + offset) * 2] * SCALE_RATIO > window.innerWidth - SCRREN_MARGINS) { nodes[i].state = 0; }
				return positionBuf[(i + offset) * 2] * SCALE_RATIO;
			}).attr("cy", function(d, i){
//                if(positionBuf[(i + offset) * 2 + 1] * SCALE_RATIO < SCRREN_MARGINS || positionBuf[(i + offset) * 2 + 1] * SCALE_RATIO > window.innerHeight - SCRREN_MARGINS) { nodes[i].state = 0; }
				return positionBuf[(i + offset) * 2 + 1] * SCALE_RATIO;
			})
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 0.0);
                
            }
            
			dataSet.exit().remove();
		});
        particleGroup.attr("transform", "translate(" + globalPos.x + ", " + globalPos.y + "), rotate(" + (-globalAngle) + ")");
 
		particleGroup.exit().remove();
            
        }
        
        timing.passed += timer_.getInterval();
        timing.overall += timer_.getInterval();
        
	},
    
    feed : function(system_, dataset_){
        
        for(var i = 0; i < system_.GetParticleCount() / 2; i++){
            
            //there are messages up to 240 words, that"s why
            //I use "constrain" to limit length to 48 words
            //feel free  to play with these parameters
            
            var words = dataset_[i].message.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim().split(" ").length;
            var r = this.map(Math.min(Math.max(parseInt(words), 1), 48), 1, 48, 8, 18);

            var c = colors[this.findByKey(categories, "id", dataset_[i].category, 0)];
            var f = foam[this.findByKey(categories, "id", dataset_[i].category, 0)];
            
            nodes.push({"id": i, "xml" : i, "radius": r, "depth" : 0, "color" : c, "foam" : f, "state" : 1});
        }
        
        console.log("# of particels in this setup: " + nodes.length);
        next = nodes.length;
        
    },
        
    display : function() {
        
        timing.phase = 0; timing.interval = 10000; timing.overall = 0;
        
        ///returns composite object {nodeID: n, xmlID: n}
        var index = this.findLowestIDByKey(nodes, "state", 1);
    
        D3Renderer.highlight(particles, index);
        this.takeover(index, dataset[next]);                          
        
        console.log("node: " + index.nodeID + " xml: " + index.xmlID + " " + next);
        if(next < dataset.length) { next++; } else { next = 0; }
        
    },

    pause : function(){
        
        timing.phase = 1; timing.interval = 25; timing.overall = 0;
        
        d3.select("#HUD").attr("opacity", 1.0)
        .transition()
        .duration(1000)
        .attr("opacity", 0.0)
        .each("end", function(d) { this.remove(); });
    
    },
    
    takeover: function(index_, data_){

        var node = d3.select("#particle_" + index_.xmlID);
        node.attr("stroke-width", 0.0);
        
        var words = data_.message.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim().split(" ").length;
        var r = this.map(Math.min(Math.max(parseInt(words), 1), 48), 1, 48, 6, 20);

        var c = colors[this.findByKey(categories, "id", data_.category, 0)];
        var f = foam[this.findByKey(categories, "id", data_.category, 0)];

        nodes[index_.nodeID] = {"id" : index_.nodeID, "xml" : next, "radius": r, "depth" : 0, "color" : c, "foam" : f, "state" : 0};
        
        
        //this.delete(nodes, index_.nodeID);
        //nodes.push({"id" : next, "radius": r, "depth" : 0, "color" : c, "state" : 0});

    },
    
    
    click : function(index_){
        
        d3.selectAll("#HUD").remove();
        
        D3Renderer.highlight(particles, index_);
        this.takeover(index_, dataset[next]);                          
        
        console.log("node: " + index_.nodeID + " xml: " + index_.xmlID + " " + next);
        if(next < dataset.length) { next++; } else { next = 0; }
        
    },
    
    map: function(value_, min1_, max1_, min2_, max2_){ 
        
        return min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_); 
    
    },
    
    exponentialMap: function(value_, interval0_, interval1_){
        
        //value_ should be from 0.0 to 1.0
        
        var b = 9.0; //coefficient
        var t = this.map(Math.min(value_, interval0_), 0.0, interval0_, 0.0, 1.0);
        var i = Math.exp(t * b);
        return this.map(i, 1.0, Math.exp(1.0 * b), 0.0, interval1_);
        
    },

    findByKey: function(array_, key_, value_, default_) {
        
        for (var i = 0; i < array_.length; i++) {
            if (array_[i][key_] === value_) {
                return i;
            }
        }
        return default_;
    },
    
    findLowestIDByKey: function(array_, key_, value_) {
        
        var available = [];
        var keys = [];
        
        for (var i = array_.length - 1; i >= 0; i--) {
            if (array_[i][key_] === value_) { available.push({ nodeID: i, xmlID : array_[i]["xml"]}); 
                                              keys.push( array_[i]["xml"]); }
        }
        
        var lowest = Math.min.apply(null, keys);
        return available[this.findByKey(available, "xmlID", lowest, 0)];
    }
    
    
}