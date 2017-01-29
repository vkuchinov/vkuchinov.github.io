/**
 *
 * @D3RENDERER
 * A very basic library designed for visualising LiquidFun particle system
 * as well as my own model for circular waves.
 *
 * There are 3 general items: system, HUD (information pop-up) and tags menu.
 *
 * @author Vladimir V. KUCHINOV
 * @email  helloworld@vkuchinov.co.uk
 *
 */

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

          scene > particles [group]

                  particles > nodes [circles]

                > tags [group]

                > hover [group]
            

REFERENCES:
Z-Index @ SVG
http://stackoverflow.com/questions/13595175/updating-svg-element-z-index-with-d3

var text_element = plot.select("text");
var textWidth = text_element.node().getBBox().width

*/

var XML_LIMIT = 512;
var XML_URL = "xml/data.xml";

var TAGS_URL = "json/tags.json"
var tagStyle = {
    active: "#1D1D1D",
    inactive: "#CECECE",
    over: "#494949",
    label: "#929497",
    typeface: "Montserrat",
    size: 12
};

var hudStyle = {
    tag: "#1293DC",
    textarea: "#DCDCDC",
    message: "#171717",
    typeface: "Open Sans",
    size: 11,
    weight: "lighter",
    spacing: 1.2
};

var particleStyle = {
    stroke: "#FFFFFF",
    weight: 2.5,
    opacity: 0.9,
    min: 8.0,
    max: 16.0
};

var D3Renderer = {

    init: function() {

        scene = d3.select("body").append("svg").attr("id", "scene").style("width", "100%").style("height", "100%");

        //TAGS INITIALIZATION

        var width = 600;
        var height = 400;
        //var menu = d3.layout.tagmenu([height, width]);
        var val = 0;

        d3.json(TAGS_URL, function(error, tags_) {

            if (error) throw error;
            
            var max = [0, 0, 0];
            var mult = function(array_, index_){ var sum = 0; for(var i = 0; i < index_; i++) { sum += array_[i]; } return sum; };
            
            tags_.forEach(function (d) { max[d.column] = Math.max(max[d.column], D3Renderer.getTextWidth(d.name)); });
            
            tags_.forEach(function (d) {
                
                var tag = scene.append("g")
                          .attr("id", d.name, true)
                          .attr("transform", "translate(" + (32 + mult(max, d.column) * 1.25) + ", " + (32 + d.index * 28) + ")")
                .on("mouseover", function(d) {
                    d3.select(this).select("rect").attr("fill", tagStyle.over);
                })
                .on("mouseout", function(d) {
              
                        d3.select(this).select("rect").attr("fill", tagStyle.active);
                })
    
                    
                var background = tag.append("rect")
                                .attr("x", -6)
                                .attr("y", -12)
                                .attr("width", D3Renderer.getTextWidth(d.name) + 6)
                                .attr("height", 22)
                                .attr("fill", tagStyle.active)
                
                    var label = tag.append("text")
                                .attr("fill", tagStyle.label)
                                .style("font-size", tagStyle.size)
                                .style("font-family", tagStyle.typeface)
                                .style("text-anchor", "left")
                                .style("alignment-baseline", "middle")
                                .text(d.name);
                
            });


//
        });

        //PARTICLES particles
        particles = scene.append("g").attr("id", "particles");
        //console.log(d3.select("svg > scene > particles"));


        d3.xml(XML_URL, function(error, data) {

            if (error) throw error;

              dataset = [].map.call(data.querySelectorAll("wish"), function(wish) {

                return {

                  id: parseInt(wish.querySelector("id").textContent),
                  partner: wish.querySelector("partnerid").textContent,
                  featured: wish.querySelector("featured").textContent,
                  name: wish.querySelector("name").textContent,
                  age: parseInt(wish.querySelector("age").textContent),
                  city: wish.querySelector("city").textContent,
                  category: parseInt(wish.querySelector("categoryid").textContent),
                  message: wish.querySelector("text").textContent

                };
              });   

        D3Renderer.analyse(dataset);
        D3Renderer.feed(particles);

        });

        //D3Renderer.HUD(scene, 0, 46, 200, true);
        D3Renderer.resize();
        
        //TEST RIPPLE
        //D3Renderer.drawCircle(d3.select("svg#scene"), window.innerWidth/2, window.innerHeight/2, 300);
        
    },

    render: function(scene_) {


        scene = d3.select("svg#scene");

        //if(currentFrame % 20 == 0) { d3.selectAll("g.nodes").remove(); D3Renderer.drawNodes(viz); }
        //D3Renderer.processNodes(scene_);

        //d3.selectAll("g.HUD").moveToFront();

    },

    feed: function(particles_) {

        //var t0 = performance.now();
        //var min = Math.min(MAX_NODES, dataset.length);

        //ripplingSystem.feed(min);

        //console.log("Initial XML data was processed in " + (performance.now() - t0) + " milliseconds.");
        
    },

    analyse: function (data_){
        
        var total = 0;
        var result = {min: -1, max: 0, average: 0, id: 0};

        console.log("There are " + data_.length + " wishes");
        
        for(var i = 0; i < data_.length; i++){
            
            var parsed = data_[i].message.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
            total += parsed.length;
            result.max = Math.max(result.max, parsed.length);
        }
        
        result.average = Math.floor(total / data_.length);
    
    },
    
    updateData: function(particles_) {

        var indices = [];

        nodes.forEach(function(entry) {
            indices.push(entry.id);
        });
        var first = Math.min.apply(Math, nodes.id);
        var last = Math.max.apply(Math, nodes.id);

        var a = -Math.PI + Math.random() * Math.PI * 2.0;
        var x = ripplingparticles.monteCarlo(MAX_RADIUS) * Math.cos(a);
        var y = ripplingparticles.monteCarlo(MAX_RADIUS) * Math.sin(a);

        if (last < dataset.length) {
            first = new Node(last.id + 1, x, y, null);
        } else {
            console.log("You have reached the end of XML universe!")
        };

    },

    drawCircle: function(scene_, x_, y_, radius_) {
        
        scene_.append("circle")
              .attr("cx", x_)
              .attr("cy", y_)
              .attr("r", radius_)
              .attr("stroke", "#DEDEDE")
              .attr("stroke-width", 1.0)
              .attr("fill", "none");
        
    },
    
    drawParticle: function(group_, id_, x_, y_, radius_, color_) {

        group_.append("circle")
            .attr("id", "particle_" + id_)
            .attr("cx", x_)
            .attr("cy", y_)
            .attr("r", radius_)
            .attr("stroke", particleStyle.stroke)
            .attr("stroke-width", 0.0)
            .attr("fill", color_)
            .on("mouseover", function(d) {
                d3.select(this).attr("stroke-width", particleStyle.weight);
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("stroke-width", 0.0);
            });

    },

    HUD: function(scene_, object_, message_ , x_, y_, visible_) {

        d3.selectAll("g.HUD").remove();

        var w = window.innerWidth;
        var h = window.innerHeight;
        
        var params = {x: x_, y: y_};
        
        //top left
        if(x_ <= w/2 && y_ <= h/2) { params = {x: 0, y: 0, tx: 0} }
        else if(x_ <= w/2 && y_ > h/2) { params = {x: 0, y: 92, tx: 0} }
        else if(x_ > w/2 && y_ <= h/2) { params = {x: 344, y: 0,  tx: 312} }
        else { params = {x: 344, y: 92, tx: 312} }
        
        var HUD = scene_.append("g")
            .attr("id", "HUD")
            .attr("transform", "translate(" + (x_ - params.x) + "," + (y_ - params.y) + ")");

        HUD.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(32,0)")
            .attr("width", "312px")
            .attr("height", "92px")
            .style("fill", hudStyle.textarea)
            .style("fill-opacity", 0.9);

        HUD.append("rect")
            .attr("x", params.tx)
            .attr("y", 0)
            .attr("width", "32px")
            .attr("height", "92px")
            .style("fill", hudStyle.tag)
            .style("fill-opacity", 0.9);

        HUD.append("circle")
               .attr("cx", params.x)
               .attr("cy", params.y)
               .attr("r", object_.attr("r"))
               .attr("fill", object_.attr("fill"))
               .attr("stroke", "#FFFFFF")
               .attr("stroke-width", 2.5);
        
        
        var label = HUD.append("g")
            .attr("id", "placeholder")
            .attr("transform", "translate(" + 40 + "," + 16 + ")");

        D3Renderer.wrapLabel(label, message_, 268);

            HUD.attr("opacity", 0.0)
            .transition()
            .duration(1000)
            .attr("opacity", 1.0);
        
        
        if (!visible_) {
            d3.selectAll("g.HUD").remove();
        }

    },

    highlight: function(particles_, id_) {

        var obj = particles_.select("#particle_" + id_.nodeID);

        //obj.attr("stroke-width", particleStyle.weight);
        
        d3.selectAll("g.HUD").remove();

        var values = particles_.attr("transform").replace("translate(", "").replace(")", "").trim().split(",");

        var translateX = parseInt(values[0]) + parseInt(obj.attr("cx"));
        var translateY = parseInt(values[1]) + parseInt(obj.attr("cy"));

        var message = dataset[id_.xmlID].message.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        if (message == "" || message == undefined || message == null ) {
            message = "there is no comments";
        }
        
        this.HUD(scene, obj, message, translateX, translateY, true);

    },

    bulletTime: function(object_, parameters0_, parameters1_, duration_, type_, loop_){

            if(Object.keys(parameters0_).length==Object.keys(parameters1_).length 
               && Object.keys(parameters0_).every(function(v,i) { return v === Object.keys(parameters1_)[i]})) {
          
                object_.attr(parameters0_)
                .transition()
                .ease(type_)
                .duration(duration_)
                .attr(parameters1_)
                .each("end", function(d) { if(loop_) { D3Renderer.BulletTime(object_, parameters0_, parameters1_, duration_, type_, loop_); } else { this.remove(); } } ); 

            } else { console.log("Oooops, something wrong!"); }

        },
        
    removeBulletTime(object_, parameters_){ object_.transition(); },
    
    getTextWidth: function(text_) {

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

    click: function(mouseX_, mouseY_) {

        mouseX = mouseX_;
        mouseY = mouseY_;

    },

    wrapLabel: function(group_, text_, length_) {

        var MESSAGE_LIMIT = 42; //0: bypassing this feature
        
        var text = group_.append("text")
            .attr("fill", hudStyle.message)
            .attr("font-family", hudStyle.typeface)
            .attr("font-size", hudStyle.size)
            .attr("font-weight", hudStyle.weight);

        var words = text_.split(/\s+/).reverse();
        
        //limiting option
        if(words.length > MESSAGE_LIMIT && MESSAGE_LIMIT != 0) { words = words.slice(words.length - MESSAGE_LIMIT); words[0] = "..."; }
        var word,
            line = [],
            lineNumber = 0,
            lineHeight = hudStyle.spacing,
            y = 0,
            dy = 0,

            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {

            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > length_) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }

    },

    resize: function() {
        
        var translate;
        
        var w = window.innerWidth,
            h = window.innerHeight;
        var scale = 1.0;
        var scene = d3.select("svg#scene");
        scene.style("width", "100%").style("height", h + "px");
        
        translate = (gup("type") == "rippling") ? "translate(" + (w / 2) + ", " + (h / 2 + scale * 2) + ")":"translate(" + w/2  + ", " + h + ")";
        
        var scale = "scale(" + scale + ", " + (scale) + ")";
        scene.select("g").attr("transform", [translate, scale].join());
    }
};

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.layout.tagmenu = function(dimensions_){
    
    this.width = dimensions_[0];
    this.height = dimensions_[1];
    
    
};


function extractColors(colors_) {

    var output = [];

}