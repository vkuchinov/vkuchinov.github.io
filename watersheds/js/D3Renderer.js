/*

<wish>
	<id>483</id>
	<partnerid>4006</partnerid>
	<featured>0</featured>
	<name>Benmoussa</name>
	<age>65</age>
	<city></city>
	<text><![CDATA[Plus de prospérité, d'harmonie sociale et d'impact sur la justice et la paix mondiales]]></text>
</wish>
 
    SVG STRUCTURE

    svg > scene

          scene > system [group]

                  system > nodes [circles]

                > tags [group]

                > hover [group]
            

REFERENCES:
Z-Index @ SVG
http://stackoverflow.com/questions/13595175/updating-svg-element-z-index-with-d3

var text_element = plot.select("text");
var textWidth = text_element.node().getBBox().width

HUD
update
hide / show
position

*/

var palette = { pink: "#F59DAE", red: "#D43D31", brown: "#815A3D", green: "#92CA70", orange: "#F19436",	
                purple: "#925E8E", teal: "#6AC5B3", blue: "#397BA3", yellow: "#ECBE42", black: "#241F1F" };

var colors = Object.values(palette).slice(0, Object.values(palette).length - 1);

console.log(colors);

var tags, system, HUD;


//ripples concepte
var ripples = []

var XML_LIMIT = 512;
var XML_URL = "xml/data.xml";

var TAGS_URL = "json/tags.json"
var tagStyle = { active: "#1D1D1D", inactive: "#CECECE", over: "#494949", label: "#929497",
                 typeface: "Montserrat", size: 12 };

var hudStyle = { tag: "#1293DC", textarea: "#DCDCDC", message: "#171717",
                 typeface: "Open Sans", size: 11, weight: "lighter", spacing: 1.2 };

var particleStyle = { stroke: "#FFFFFF", weight: 2.0, opacity: 0.9, min: 6.0, max: 16.0 };

var D3Renderer = {

	init: function(){
        
		scene = d3.select("body").append("svg").attr("id", "scene").style("width", "100%").style("height", "100%");
                //.on("click", function(d){ d3.selectAll("svg > #tags > *").style("visibility", "hidden"); });
        
        //TAGS INITIALIZATION

        var width = 600;
        var height = 400;
        var treemap = d3.tree().size([height, width]);
        var val = 0;
        
        d3.json(TAGS_URL, function(error, tags_) {
        
            if (error) throw error;

            var nodes = d3.hierarchy(tags_, function(d) { return d.children; });

            nodes = treemap(nodes);

            tags = scene.append("g")
                   .attr("id", "tags")
                   .attr("width", width)
                   .attr("height", height)
                   .attr("transform", "translate(" + -(window.innerWidth/2 - 32) + "," + 32 + ")");

            var node = tags.selectAll(".node")

            .data(nodes.leaves().slice(0))
            .enter().append("g")
            .attr("class", function(d) { 
            return "node" + 
            (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { return "translate(" + 0 + "," + 0 + ")"; })
            .on("mouseover", function(d){ d3.select(this).select("rect").attr("fill", tagStyle.over); })
            .on("mouseout", function(d){ if(d.data.visible == true) { d3.select(this).select("rect").attr("fill", tagStyle.active); } else { d3.select(this).select("rect").attr("fill", tagStyle.inactive); } })
            .on("click", function(d){  
                                        var c = d3.select(this).select("rect").attr("fill");
                                        if(c == tagStyle.active) { d3.select(this).select("rect").attr("fill", tagStyle.inactive); }
                                        else { d3.select(this).select("rect").attr("fill", tagStyle.active); }
                                    });
            
            node.append("rect")
            .attr("x", function(d) { return d.y - 6 + d.parent.x;})
            .attr("y", function(d) { return d.x - 12 - d.parent.children[0].x;})
            .attr("fill", function(d) { if(d.data.visible == true) { return tagStyle.active; } else { return tagStyle.inactive; } })
            .attr("width", function(d) { return D3Renderer.getTextWidth(d.data.name) + 6; })
            .attr("height", 22)
            
            node.append("text")
            .attr("dx", function(d) { return d.y + d.parent.x; })
            .attr("dy", function(d) { return d.x - d.parent.children[0].x; })
            .attr("fill", tagStyle.label)
            .style("font-size", tagStyle.size)
            .style("font-family", tagStyle.typeface)
            .style("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .text(function(d) { return d.data.name; });
            
        });
            
        //PARTICLES SYSTEM
        
        system = scene.append("g").attr("id", "system");
        //D3Renderer.drawParticle(system, 0, 0, 0, 30, "#FF00FF");
        //console.log(d3.select("svg > scene > system"));

        
        d3.xml(XML_URL, function(error, data) {

            if (error) throw error;

              dataset = [].map.call(data.querySelectorAll("wish"), function(wish) {

                return {

                  id: wish.querySelector("id").textContent,
                  partner: wish.querySelector("partnerid").textContent,
                  featured: wish.querySelector("featured").textContent,
                  name: wish.querySelector("name").textContent,
                  age: wish.querySelector("age").textContent,
                  city: wish.querySelector("city").textContent,
                  message: wish.querySelector("text").textContent

                };
              });   
        
        D3Renderer.feed(system);
            
        });
        
        D3Renderer.HUD(scene, 0, 46, 200, true);
        
		D3Renderer.resize();
	},
    
	render: function(scene_){
        
        
		scene = d3.select("svg#scene");
        
        //if(currentFrame % 20 == 0) { d3.selectAll("g.nodes").remove(); D3Renderer.drawNodes(viz); }
        //D3Renderer.processNodes(scene_);
        
        //d3.selectAll("g.HUD").moveToFront();
    
	},
    
    
    feed: function(system_){
        
        //console.time("caption A");
        var t0 = performance.now();
        
        var min = Math.min(MAX_NODES, dataset.length);
        
        for(var i = 0; i < min; i++){

            var a = -Math.PI + Math.random() * Math.PI * 2.0;
            var x = monteCarloDistribution(MAX_RADIUS) * Math.cos(a);
            var y = monteCarloDistribution(MAX_RADIUS) * Math.sin(a);
            nodes.push(new Node(i, x, y, null));

        }
        
        //console.timeEnd("Initial XML data was processed");
        console.log("Initial XML data was processed in " + (performance.now() - t0) + " milliseconds.");
        
        for(var i = 0; i < 512; i++){
            
            if(nodes[i] != undefined) {
            D3Renderer.drawParticle(system_, i, nodes[i].cx, nodes[i].cy, nodes[i].radius, nodes[i].color);
            }
            
        }
        
        //test, should be removed
        D3Renderer.highlight(system_, "particle_16");
        D3Renderer.updateData(system_);
    },
    
    updateData : function(system_){
        
        var indices = [];
 
        nodes.forEach(function(entry) { indices.push(entry.id); });
        var first = Math.min.apply(Math, nodes.id);
        var last = Math.max.apply(Math, nodes.id);

        var a = -Math.PI + Math.random() * Math.PI * 2.0;
        var x = monteCarloDistribution(MAX_RADIUS) * Math.cos(a);
        var y = monteCarloDistribution(MAX_RADIUS) * Math.sin(a);
        
        if(last < dataset.length){ first = new Node(last.id + 1, x, y, null); }else{ console.log("You have reached the end of XML universe!")};
        
        //you are working with nodes and system as group
        //pick the oldest node (min id_);
        //replalce it with new one
        //change its id, position, radius and color
        
        
    },
    
    applyRipples: function(node_, ripples_){
    
        var radius = 0.0;
        if(ripples_.length > 0){
            
            var nodePosition = new Vector2(node_.cx, node_.cy);
            var mag = Math.sqrt(Math.pow(node_.cx, 2.0) + Math.pow(node_.cy, 2.0));
            
            for(var i = 0; i < ripples_.length; i++){
                
                var closestPosition = new Vector2(node_.cx / mag * ripples_[i].radius, node_.cy / mag * ripples_[i].radius);
                if(nodePosition.dist(closestPosition) < 16) {
                    
                    radius = node_.radius * nodePosition.dist(closestPosition) / 10; break; 
                    
                }

            }
            
        }
        
        return radius;
        
    },
    
    drawParticle: function(group_, id_, x_, y_, radius_, color_){
        
            group_.append("circle")
                  .attr("id", "particle_" + id_)
                  .attr("cx", x_)
                  .attr("cy", y_)
                  .attr("r", radius_)
                  .attr("stroke", particleStyle.stroke)
                  .attr("stroke-width", 0.0)
                  .attr("fill", color_)
                  .on("mouseover", function(d) { d3.select(this).attr("stroke-width", particleStyle.weight); })
                  .on("mouseout", function(d) { d3.select(this).attr("stroke-width", 0.0); }); 
        
    },
    
    HUD: function(scene_, id_, x_, y_, visible_) {

            d3.selectAll("g.HUD").remove();
        
            var HUD = scene_.append("g")
                          .attr("id", "HUD")
                          .attr("transform", "translate(" + x_ + "," + y_ + ")");
            
                          HUD.append("rect")
                          .attr("x", 0)
                          .attr("y", 0)
                          .attr("width", "32px")
                          .attr("height", "92px")
                          .style("fill", hudStyle.tag)
                          .style("fill-opacity", 0.9);
        
                           HUD.append("rect")
                           .attr("x", 0)
                           .attr("y", 0)
                           .attr("transform", "translate(32,0)")
                           .attr("width", "312px")
                           .attr("height", "92px")
                           .style("fill", hudStyle.textarea)
                           .style("fill-opacity", 0.9);
      
                           var label = HUD.append("g")
                           .attr("id", "placeholder")
                           .attr("transform", "translate(" + 40 + "," + 16 + ")");

                           D3Renderer.wrapLabel(label, "Praesent porta pulvinar elit vitae pharetra. Fusce laoreet vulputate maximus. Fusce pellentesque eleifend nisi, et maximus turpis scelerisque et. Proin pretium lobortis diam, in fermentum metus dictum sed. Donec sagittis lacinia tellus ac tempus. Aenean auctor ex id sollicitudin posuere.", 286);
                       
            if(!visible_) { d3.selectAll("g.HUD").remove(); }

    },
    
    highlight : function(system_, id_){
        
        var object = system_.select("#particle_16");
        
        object.attr("stroke-width", particleStyle.weight);
        var hud = d3.select("#HUD");
        
        var values = system_.attr("transform").replace("translate(", "").replace(")", "").trim().split(",");

        var translateX = parseInt(values[0]) + parseInt(object.attr("cx"));
        var translateY = parseInt(values[1]) + parseInt(object.attr("cy"));

        hud.attr("transform", "translate(" + translateX + "," + translateY + ")");
        
        //update message
        hud.select("#placeholder").remove();
        
        var label = hud.append("g")
                    .attr("id", "placeholder")
                    .attr("transform", "translate(" + 40 + "," + 16 + ")");

        var message = dataset[id_.replace("particle_", "")].message.replace( /<!\[CDATA\[(.*?)\]\]>/g, '$1' ).trim();
        if(message == "") { message = "no comments"; }
        D3Renderer.wrapLabel(label, message, 286);
        
        object.moveToFront();
        hud.moveToFront();
        
    },
    
    getTextWidth : function(text_){
    
        var template = d3.select("body").append("svg").attr("id", "template").attr("width", "100%").attr("height", "100%");

        var text = template.append("text")
        .style("font-size", "12px")
        .style("font-family", "Montserrat")
        .style("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .text(text_);

        var output = text.node().getBBox().width * 1.5;
        template.remove();
        
        return output;
    
    },
    
    drawNodes: function(viz_){

        var group = viz_.append("g").classed("nodes", true);
        
        for(var n = 0; n < nodes.length; n++){
            
            var node = group.append("circle")
                           .attr("id", n)
                           .attr("cx", nodes[n].cx)
                           .attr("cy", nodes[n].cy)
                           .attr("r", D3Renderer.applyRipples(nodes[n], ripples.ripples))
                           .style("fill", d3.hsl(nodes[n].hue, 0.8, 0.7))
                           .style("stroke", "#FFFFFF")
                           .style("stroke-width", 0)
                           .on("mouseover", function(d, i){ d3.select(this).style("stroke-width", 4); 
                                                           D3Renderer.HUD(viz_, d3.select(this).attr("id"), d3.select(this).attr("cx"),
                                                           d3.select(this).attr("cy"), true); })
                           .on("mouseout", function(d, i){ d3.select(this).style("stroke-width", 0);  D3Renderer.HUD(viz_, 0, -1000, -1000, false); })
            
        }
    },

    click: function(mouseX_, mouseY_) {
        
        mouseX = mouseX_;
        mouseY = mouseY_;
        
    },
    
    wrapLabel: function (group_, text_, length_){
        
        var text = group_.append("text")
                         .attr("fill", hudStyle.message)
                         //.attr("stroke", "#FFFFFF")
                         //.attr("stroke-width", 0.075)
                         .attr("font-family", hudStyle.typeface)
                         .attr("font-size", hudStyle.size)
                         .attr("font-weight", hudStyle.weight);
        
        var words = text_.split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = hudStyle.spacing,
        y = 0,
        dy = 0,
        
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            
            line.push(word);
            tspan.text(line.join(" "));
            if(tspan.node().getComputedTextLength() > length_) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
        }

    },
    
	resize: function(){
		var w = window.innerWidth, h = window.innerHeight;
		var scale = 1.0; 
		var scene = d3.select("svg#scene");
		scene.style("width", "100%").style("height", h + "px");
		var translate = "translate(" + (w/2) + ", " + (h/2 + scale*2) + ")";
		var scale = "scale(" + scale + ", " + (scale) + ")";
		scene.select("g").attr("transform", [translate, scale].join());
	}
};

d3.selection.prototype.moveToFront = function() { return this.each(function(){ this.parentNode.appendChild(this); }); };

function extractColors(colors_){
 
    var output = [];
    
}