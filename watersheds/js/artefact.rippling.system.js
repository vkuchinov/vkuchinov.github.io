/**
 *
 * @RIPPLING [CIRCULAR] SYSTEM
 * Each particles would have its own lifetime and would be changes 
 * by a newer node from XML by its death. 
 * 
 * The new node would have its own unique position. 
 *
 * @author Vladimir V. KUCHINOV
 * @email  helloworld@vkuchinov.co.uk
 *
 */

"use strict"

var MAX_RADIUS = 240.0;
var MAX_NODES = 768;

var GENERATOR_INTERVAL = 56000;
var TRANSITION_INTERVAL = 240000;

var ripplingSystem = {

    inits: function(dataset_) {

        //this.timer = new Timer();
        this.generator = new Generator(GENERATOR_INTERVAL);
        
        this.feed(dataset_);
        
      this.generator.generate(particles);

    },

    update: function(timer_) {

        //dublicated instance from main class
        //conflicts
        
        //this.timer.update();
        this.generator.update(timer_.getInterval());
        
        if(nodes.length == MAX_NODES){
            
            var ripples = [];
            var rps = d3.selectAll("#ripple").each(function(d) { ripples.push(this.attributes.r.value); });

            var node = d3.selectAll(".nodes")
                           .each(function(d) { 

                      var n = d3.select("#" + this.attributes.id.value);
                      var id = parseInt(n.attr("id").replace("particle_", ""));
                      var vX = this.attributes.cx.value;
                      var vY = this.attributes.cy.value;
                      if(vX == undefined || vY == undefined ) { console.log("Ooops, something wrong!"); }
                      var magV = Math.sqrt(Math.pow(vX, 2) + Math.pow(vY, 2));

                      for(var i = 0; i < ripples.length; i++){

                            var aX = vX / magV * ripples[i];
                            var aY = vY / magV * ripples[i];

                            var dist = Math.sqrt(Math.pow((aX - vX), 2) + Math.pow((aY - vY), 2));
                            if(dist < 8) { n.attr("fill", nodes[id].color); n.attr("r", ripplingSystem.map(dist, 0, 8, nodes[id].radius, 4)); nodes[id].state = 1; break; } 
                            else { n.attr("fill", "none"); n.attr("r", 4); nodes[id].state = 0; }
                      }

                });
        }

    },

    feed: function(dataset_) {

        var upto = Math.min(MAX_NODES, dataset_.length);
        
        for(var i = 0; i < upto; i++){

            var a = Math.random() * 360.0;
            var r = Math.random() * MAX_RADIUS;

            var xy = ripplingSystem.uniform();
            var x = xy.x * MAX_RADIUS;
            var y = xy.y * MAX_RADIUS;

            if(gup("mode") == "interactive") { 
            var node = particles.append("circle")
            .attr("id", "particle_" + i, true)
            .attr("class", "nodes")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 1)
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 0.0)
            .attr("fill", "#FF00FF")
            .on("mouseover", function(d) { d3.select(this).moveToFront(); 
                                               d3.select(this).attr("stroke-width", particleStyle.weight); })
            
            .on("mouseout", function(d) { d3.select(this).attr("stroke-width", 0.0); })
            .on("click", function(d, i) { var ii = parseInt(d3.select(this).attr("id").replace("particle_", "")); console.log(ii); ripplingSystem.click({nodeID: ii, xmlID: nodes[ii].xml}); });
                
            } else {
                
            var node = particles.append("circle")
            .attr("id", "particle_" + i, true)
            .attr("class", "nodes")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 1)
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 0.0)
            .attr("fill", "#FF00FF");
                
            }

            //there are messages up to 240 words, that"s why
            //I use "constrain" to limit length to 48 words
            //feel free  to play with these parameters
            
            var words = dataset_[i].message.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim().split(" ").length;
            var r = this.map(Math.min(Math.max(parseInt(words), 1), 48), 1, 48, 2, 20);

            var c = colors[this.findByKey(categories, "id", dataset_[i].category, 0)];
            
            //id is a reference to xml
            nodes.push({"id" : i, "xml": i, "radius": r, "depth" : 0, "color" : c, "state" : 0});

        }
        
            next = nodes.length;

    },
    
    display : function() {

        //returns composite object {nodeID: n, xmlID: n}
        var index = this.findLowestIDByKey(nodes, "state", 1);
    
        D3Renderer.highlight(particles, index);
        this.takeover(index, dataset[next]);                          
        
        console.log("node: " + index.nodeID + " xml: " + index.xmlID + " " + next);
        if(next < dataset.length) { next++; } else { next = 0; }
        
    },

    pause : function(){
        
        //d3.selectAll("g.HUD").remove();
        
        
        d3.select("#HUD").attr("opacity", 1.0)
        .transition()
        .duration(1500)
        .attr("opacity", 0.0)
        .each("end", function(d) { this.remove(); });
        
        //hide HUD, clear its circle
        
        //all nodes to next update
        
    },
    
    takeover: function(index_, data_){
        
        var a = Math.random() * 360.0;
        var r = Math.random() * MAX_RADIUS;

        var xy = ripplingSystem.uniform();
        var x = xy.x * MAX_RADIUS;
        var y = xy.y * MAX_RADIUS;


        var words = data_.message.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim().split(" ").length;
        var r = this.map(Math.min(Math.max(parseInt(words), 1), 48), 1, 48, 6, 20);

        var c = colors[this.findByKey(categories, "id", data_.category, 0)];

        var node = d3.select("#particle_" + index_.xmlID);
        node.attr("cx", x)
        .attr("cy", y)
        .attr("stroke-width", 0.0);

        nodes[index_.nodeID] = {"id" : index_.nodeID, "xml" : next, "radius": r, "depth" : 0, "color" : c, "state" : 0};
        //this.delete(nodes, index_.nodeID);
        //nodes.push({"id" : next, "radius": r, "depth" : 0, "color" : c, "state" : 0});

    },
    
     click : function(index_){
        
        d3.selectAll("#HUD").remove();
        
        D3Renderer.highlight(particles, index_);
        this.takeover(index_, dataset[next]);                          
        
        //console.log("node: " + index_.nodeID + " xml: " + index_.xmlID + " " + next);
        if(next < dataset.length) { next++; } else { next = 0; }
        
    },
    
    delete : function(array_, indices_){
        
        for(var j = 0; j < indices_.length; j++){
          
            for(var i = 0; i < array_.length; i++) { if(i === indices_[j]) { array_.splice(i, 1); } }
            
        }
        
        return array_;
        
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

            //ripples transitons, don't do expnentials here
            D3Renderer.bulletTime(circle, {"r": 16}, {"r": 320}, TRANSITION_INTERVAL, "sine", false);
        
    }
    
    this.delete = function(array_, indices_){
        
        for(var j = 0; j < indices_.length; j++){
          
            for(var i = 0; i < array_.length; i++) { if(i === indices_[j]) { array_.splice(i, 1); } }
            
        }
        
        return array_;
        
    }

}