/**
 *
 * @RIPPLING [CIRCULAR] SYSTEM
 * Each particles would have its own lifetime and would be changes 
 * by a newer node from XML by its death. 
 * 
 * The new node would have its own unique position. 
 *
 * The extra line between the end of the @file docblock
 * and the file-closure is important.
 *
 * @author Vladimir V. KUCHINOV
 * @email  helloworld@vkuchinov.co.uk
 *
 */

"use strict"

var GENERATOR_INTERVAL = 3500;
var TRANSITION_INTERVAL = 15000;

var ripplingSystem = {

    inits: function() {

        this.timer = new Timer();
        this.generator = new Generator(GENERATOR_INTERVAL);
        
        for(var i = 0; i < MAX_NODES; i++){

            var a = Math.random() * 360.0;
            var r = Math.random() * MAX_RADIUS;

            var xy = ripplingSystem.uniform();
            var x = xy.x * MAX_RADIUS;
            var y = xy.y * MAX_RADIUS;

            var node = particles.append("circle")
            .attr("id", "nodes_" + i, true)
            .attr("class", "nodes")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 1)
            .attr("stroke", "none")
            .attr("fill", "#FF00FF");

            nodes.push({"id":i, "radius": 6 + Math.random() * 12, "depth" : 0, "color" : colors[Math.round(Math.random() * 8)]});

        }
        
      this.generator.generate(particles);

    },

    update: function() {

        this.timer.update();
        this.generator.update(this.timer.getInterval());
        
        if(nodes.length == MAX_NODES){
            
            var ripples = [];
            var rps = d3.selectAll("#ripple").each(function(d) { ripples.push(this.attributes.r.value); });

            var node = d3.selectAll(".nodes")
                           .each(function(d) { 

                      var n = d3.select("#" + this.attributes.id.value);
                      var id = parseInt(n.attr("id").replace("nodes_", ""));
                      var vX = this.attributes.cx.value;
                      var vY = this.attributes.cy.value;
                      if(vX == undefined || vY == undefined ) { console.log("Ooops, something wrong!"); }
                      var magV = Math.sqrt(Math.pow(vX, 2) + Math.pow(vY, 2));

                      for(var i = 0; i < ripples.length; i++){

                            var aX = vX / magV * ripples[i];
                            var aY = vY / magV * ripples[i];

                            var dist = Math.sqrt(Math.pow((aX - vX), 2) + Math.pow((aY - vY), 2));
                            if(dist < 8) { n.attr("fill", nodes[id].color); n.attr("r", ripplingSystem.map(dist, 0, 8, nodes[id].radius, 4)); break; } 
                            else { n.attr("fill", "none"); n.attr("r", 4); }
                      }

                });
        }

    },

    feed: function(min_) {

        //console.log(min_);
        //        for (var i = 0; i < min_; i++) {
        //
        //            var a = -Math.PI + Math.random() * Math.PI * 2.0;
        //            var x = ripplingSystem.monteCarlo(MAX_RADIUS) * Math.cos(a);
        //            var y = ripplingSystem.monteCarlo(MAX_RADIUS) * Math.sin(a);
        //            nodes.push(new Node(i, x, y, null));
        //
        //        }

    },
    
    map: function(value_, min1_, max1_, min2_, max2_){ 
        
        return min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_); 
    
    },

    uniform : function(){
        
       //http://stats.stackexchange.com/questions/120527/how-to-generate-random-points-uniformly-distributed-in-a-circle
        
        var n = 1e4;
        var rho = Math.sqrt(Math.random(n));
        var theta = Math.random() * 2.0 * Math.PI;
        var x = rho * Math.cos(theta);
        var y = rho * Math.sin(theta);
        
        return {"x" : x, "y" : y};
        
    },
    
    monteCarlo: function(value_) {

        while (true) {

            var v0 = Math.random();
            var v1 = Math.random();
            var probability = v0;

            if (v1 < probability) {
                return v0 * value_;
            }

        }

    }

}

function Generator(theta_) {

    this.children = [];
    this.theta = theta_;
    this.passed = 0;

    this.children = [];

    this.update = function(interval_) {

        this.passed += interval_;
        if(this.passed > this.theta) { this.passed = 0; this.generate(particles) }
        
        //        var candidates = [];
        //        
        //        for(var i = 0; i < this.children.length; i++){
        //         
        //            if(this.children.radius < MAX_RADIUS) { this.children[i].radius += this.speed.step; }
        //            else { candidates.push(i); }
        //            
        //        }
        //        
        //        this.children = this.delete(this.children, candidates);

    }

    this.generate = function(scene_) { 

            var circle = scene_.append("circle")
                .attr("id", "ripple", true)
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("stroke", "#DEDEDE")
                .attr("stroke-width", 0.0)
                .attr("fill", "none");

            D3Renderer.bulletTime(circle, {"r": 16}, {"r": 320}, TRANSITION_INTERVAL, "sine", false);
        
    }
    
    this.delete = function(array_, indices_){
        
        for(var j = 0; j < indices_.length; j++){
          
            for(var i = 0; i < array_.length; i++) { if(i === indices_[j]) { array_.splice(i, 1); } }
            
        }
        
        return array_;
        
    }

}

function Timer() {

    this.current = performance.now();
    this.last = 0;
    this.frame;

    this.update = function() {

        this.last = this.current;
        this.current = performance.now();
        this.frame = this.current - this.last;

    }

    this.getInterval = function() {
        return performance.now() - this.last;
    }

}

function Speed(step_, interval_) {

    this.step = step_;
    this.interval = interval_;

    this.ratio = 1.0;

    this.set = function(ratio_) {
        this.ration = ratio_;
    }

    //time, beginning, change, duration
    this.linear = function(t_, b_, c_, d_) {

    }

    this.backIn = function(t_, b_, c_, d_) {

        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1.0) * t - s) + b;

    }

    this.expIn = function(t_, b_, c_, d_) {
        return (t == 0) ? b : c * Math.pow(2.0, 10 * (t / d - 1.0)) + b;
    }

}