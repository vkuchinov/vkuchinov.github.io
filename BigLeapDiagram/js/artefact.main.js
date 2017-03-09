/**
*
* BIG LEAP STATES SUNBURST
* data-visualisation based on JSON data
* 
* RADIAL SEGMENTS
* population, average, percent, foreclosure, risk, lower cost, top cities†
* † could be visible only at HUD div

*
* Typeface: Verdana, uppercased, bold
*           #373A41: general, #BEC831: over, #428BCA: clicked
*
* Colours: #E6E6E6, #FFAF00, #1CABEE, #D3EFFB, #51A0C1* 
*
* Kuler match: REI Colors 1:
*              #A7A7A2, #EFEEE2, #4E4D49, #BEC831, #3F5A2E
*
*              didi
*              #E8C357, #C6FFC1, #FF8F86, #CABEE8, #9BFFF7
*            
* Nevada
* has four cities: Henderson (#44), Las Vegas (#77), North Vegas (#88) 
* & Reno (#95), and the highest foreclosure and risk indices.
*
* alternative:
*
* California
* has the largest population, the highest percent and 13 top cities—Rancho Cucamonga (#97), Sacramento (#99), ... Fontana (#117).
*
*
* Title: 2016’s Best Cities to Flip Houses [for House-Flipping]
*        Top 150 Cities for House-Flipping, 2016
*
* smallest: nominal, minimal, least possible, lowest, merest; 
* largest: biggest, greatest, most, better, maximal, topmost, highest, lion's share, ustmost, outstanding;
*
* REFERENCES:
* http://www.successpatheducation.com/ [parent site]
* https://wallethub.com/edu/best-cities-to-flip-houses/23158/
* https://en.wikipedia.org/wiki/Bracket
*
* @author   Vladimir V. KUCHINOV
* @email    helloworld@vkuchinov.co.uk
*
*/

var colors = ["#BEC831", "#A7A7A2", "#C6FFC1", "#FF8F86", "#CABEE8", "#9BFFF7", "#E8C357" , "#1CABEE"];
var scene;
var segments = [];
var regions = [];
var ranges = [];

var parameters = {minR: 80, maxR: 220, offset : 0.0025, colors: colors };

var width = 600, height = 600;

window.onload = function() { inits(); }

function Segment(parent_, index_, data_){

    var pos = {r:0, i:0};

    for(var i = 0; i < regions.length; i++){
        for(var j = 0; j < regions[i].states.length; j++){
        if(regions[i].states[j] == data_.id) { pos.r = regions[i].indices.start; pos.i = j; }   
        }
    }

    index_ = pos.r + pos.i;

    var values = [data_.population, data_.average, data_.percent, data_.foreclosure, data_.risk, data_.lowest, data_.top.length];
    
    var scaledWidth = width;
    var scaledHeight = height;

    var tau = 2 * Math.PI / 51.0;
    
    var arc = d3.svg.arc()
    .outerRadius(parameters.maxR)
    .innerRadius(parameters.minR)
    .startAngle(tau * index_ + parameters.offset);
    
    var g = parent_.append("g")
            .attr("id", data_.id, true)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .on("mouseover", function(d) {  d3.select(this).moveToFront(); 
                                            d3.select(this).select("#selection").attr("stroke-width", 4.0); 
                                          
                                            for(var j = 0; j < 6; j++){
                                            document.getElementById("bullet" + j).style.color = parameters.colors[j];     
                                            }
                                          
                                            document.getElementById("state").innerHTML = data_.name;
                                            document.getElementById("description").innerHTML = getDescription(data_).replace(", .", ".");
                                            document.getElementById("population").innerHTML = data_.population.toLocaleString('en-US', {minimumFractionDigits: 0});
                                            document.getElementById("average").innerHTML = "$" + data_.average.toLocaleString('en-US', {minimumFractionDigits: 0});
                                            document.getElementById("percent").innerHTML = data_.percent.toLocaleString('en-US', {minimumFractionDigits: 2}) + "%";
                                            document.getElementById("foreclosure").innerHTML = data_.foreclosure.toLocaleString('en-US', {minimumFractionDigits: 3});
                                            document.getElementById("risk").innerHTML = data_.risk.toLocaleString('en-US', {minimumFractionDigits: 1});
                                            document.getElementById("lowest").innerHTML = data_.lowest.toLocaleString('en-US', {minimumFractionDigits: 1});
                                            if(data_.top.length > 0){
                                            //document.getElementById("top").innerHTML = "";
                                            //data_.top.forEach(function(city) {
                                            //document.getElementById("top").innerHTML += city.name + ", " + city.code + "<br>";
                                            //});
     
                                            }else{
                                            //document.getElementById("top").innerHTML = "none";
                                            }
                                          
                                            })
            .on("mouseout", function(d) {  d3.select(this).moveToFront(); d3.select(this).select("#selection").attr("stroke-width", 0.0); });
    
    for(var i = 0; i < 7; i++){
        
    var inner = parameters.maxR - (parameters.maxR - parameters.minR) / 7 * i;
    var outer = parameters.maxR - (parameters.maxR - parameters.minR) / 7 * (i + 1);
    
    var inner2 = map(values[i], ranges[i].max, ranges[i].min, inner, outer);
        
    var subarc = d3.svg.arc()
    .outerRadius(outer - parameters.offset * 128 )
    .innerRadius(inner + parameters.offset * 128 )
    .startAngle(tau * index_ + parameters.offset);
    
    var subarc2 = d3.svg.arc()
    .outerRadius(outer - parameters.offset * 128 )
    .innerRadius(inner2 + parameters.offset * 128 )
    .startAngle(tau * index_ + parameters.offset);
    
    var foreground = g.append("path")
    .datum({endAngle: tau * (index_ + 1) - parameters.offset})
    .attr("fill", "url(#hatched)")
    .attr("opacity", 1.0)
    .attr("d", subarc);
        
    var value = g.append("path")
    .datum({endAngle: tau * (index_ + 1) - parameters.offset})
    .attr("fill", parameters.colors[i])
    .attr("d", subarc2);
        
    var label = g.append("text")
                .style("fill", "black")
                .style("stroke", "none")
                .style("font-family", "Verdana")
                .style("font-size", "12px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(" + (tau * (index_ + 0.5) * 180 / Math.PI)  + "),translate(0, " + (-parameters.maxR * 1.05) + ")")
                .text(data_.id);
        
    }
    
     var background =  g.append("path")
    .attr("id", "selection", true)
    .datum({endAngle: tau * (index_ + 1) - parameters.offset})
    .attr("fill", "none")
    .attr("stroke", parameters.colors[7])
    .attr("stroke-width", 0.0)
    .attr("d", arc);

}

function Region(parent_, index_, data_){

    this.children = data_.states.length;
    this.states = data_.states;
    this.indices = {start: data_.start, end: data_.end};
    
    var tau = 2 * Math.PI / 51.0;
    
    var arc = d3.svg.arc()
    .outerRadius(parameters.maxR * 1.15)
    .innerRadius(parameters.maxR * 1.02)
    .startAngle(data_.start * tau - parameters.offset * 1);
    
    var g = parent_.append("g")
            .attr("id", data_.name, true)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
           
     var background =  g.append("path")
    .attr("id", "selection", true)
    .datum({endAngle: data_.start * tau + parameters.offset * 2})
    .attr("fill", "#DEDEDE")
    .attr("d", arc);
    
    var label = g.append("text")
                .style("fill", "black")
                .style("stroke", "none")
                .style("font-family", "Verdana")
                .style("font-size", "12px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(" + ((data_.start + (data_.end - data_.start) / 2.0 ) * tau * 180 / Math.PI)  + "),translate(0, " + (-parameters.maxR * 1.15) + ")")
                .text(data_.name.toUpperCase());

}

function inits(){
    
var scene = d3.select("div#container")
        .append("svg")
        .attr("id", "scene", true)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 600")
        .classed("svg-content", true);

        scene.append("defs")
        .append("pattern")
        .attr("id", "hatched")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 4)
        .attr("height", 4)
        .append("path")
        .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
        .attr("stroke", "#DEDEDE")
        .attr("stroke-width", 1.0);

var background = scene.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#FFFFFF");
    
var caption = scene.append("g")
.attr("transform", "translate(" + width / 2 + "," + (height / 2 - 8)+ ")");

wrapLabel(caption, "Top 150 US Cities for House-Flipping, 2016", 150);
    
d3.json("json/regions.json", function(error, data) {

data.forEach(function(d, i) { regions.push(new Region(scene, i, d)); });

});

d3.json("json/data.json", function(error, data) {

setRanges(data);
data.forEach(function(d, i) { segments.push(new Segment(scene, i, d)); });

});

}

function map(value_, min1_, max1_, min2_, max2_){ return min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_); }

function getDescription(data_){
        
        var additional = "";
    
        if(data_.population == ranges[0].min) { additional += "the smallest population, "; }
        if(data_.population == ranges[0].max) { additional += "the largest population, "; }
    
        if(data_.average == ranges[1].min) { additional += "the smallest average, "; }
        if(data_.average == ranges[1].max) { additional += "the largest average, "; }
    
        if(data_.percent == ranges[2].min) { additional += "the lowest percent, "; }
        if(data_.percent == ranges[2].max) { additional += "the highest percent, "; }
    
        if(data_.foreclosure == ranges[3].min) { additional += "the lowest foreclosure, "; }
        if(data_.foreclosure == ranges[3].max) { additional += "the largets foreclosure, "; }
    
        if(data_.risk == ranges[4].min) { additional += "the minimal risk, "; }
        if(data_.risk == ranges[4].max) { additional += "the highest risk, "; }
    
        if(data_.lowest == ranges[5].min) { additional += "the lowest cost, "; }
        if(data_.lowest == ranges[5].min) { additional += "the largest cost, "; }
    
        if(additional.length == 0) { 
            
            if(data_.top.length == 0){ return "doesn't have <font color='#E8C357'>any top cities</font>."; }
            else if(data_.top.length == 1) { return "has <font color='#E8C357'>only one top city</font>—" + data_.top[0].name + " (" + data_.top[0].code.substr(data_.top[0].code.indexOf("#")) + ")."; }
            else{
                
                var s = "has <font color='#E8C357'>" + data_.top.length + " top cities</font>—";
                
                for(var j = 0; j < data_.top.length - 1; j++){
                s += data_.top[j].name + " (" + data_.top[j].code.substr(data_.top[j].code.indexOf("#")) + "), ";  
                }
                s += data_.top[data_.top.length - 1].name + " (" + data_.top[data_.top.length - 1].code.substr(data_.top[data_.top.length - 1].code.indexOf("#")) + ").";
                return s;
            }}
            else{
            if(data_.top.length == 0) { return "has " + additional.substr(0, additional.length - 2) + "."; }
            else if(data_.top.length == 1) { return "has " + additional.substr(0, additional.length - 2) + " and <font color='#E8C357'>only one top city</font>—" + data_.top[0].name + " (" + data_.top[0].code.substr(data_.top[0].code.indexOf("#")) + ")."; }
            else{
            var s = "<font color='#E8C357'>" + data_.top.length + " top cities</font>—";
                
                for(var j = 0; j < data_.top.length - 1; j++){
                s += data_.top[j].name + " (" + data_.top[j].code.substr(data_.top[j].code.indexOf("#")) + "), ";  
                }
                s += data_.top[data_.top.length - 1].name + " (" + data_.top[data_.top.length - 1].code.substr(data_.top[data_.top.length - 1].code.indexOf("#")) + ").";
                
            return "has " + additional.substr(0, additional.length - 2) + " and " + s;  
            }
            
            }
    
        return "";
        
}
    
function setRanges(data_){
    
    for(var  i = 0; i < 7; i++){  ranges.push({min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }); }

    ranges[0].min = d3.min(data_, function(d) { return d.population;} );
    ranges[0].max = d3.max(data_, function(d) { return d.population;} );

    ranges[1].min = d3.min(data_, function(d) { return d.average;} );
    ranges[1].max = d3.max(data_, function(d) { return d.average;} );
    
    ranges[2].min = d3.min(data_, function(d) { return d.percent;} );
    ranges[2].max = d3.max(data_, function(d) { return d.percent;} );
    
    ranges[3].min = d3.min(data_, function(d) { return d.foreclosure;} );
    ranges[3].max = d3.max(data_, function(d) { return d.foreclosure;} );
    
    ranges[4].min = d3.min(data_, function(d) { return d.risk;} );
    ranges[4].max = d3.max(data_, function(d) { return d.risk;} );
    
    ranges[5].min = d3.min(data_, function(d) { return d.lowest;} );
    ranges[5].max = d3.max(data_, function(d) { return d.lowest;} );
    
    ranges[6].min = d3.min(data_, function(d) { return d.top.length;} );
    ranges[6].max = d3.max(data_, function(d) { return d.top.length;} );
    
    //console.log(ranges);
}

function wrapLabel(group_, text_, length_) {

        var MESSAGE_LIMIT = 42; //0: bypassing this feature

        var text = group_.append("text")
            .attr("fill", "#373A41")
            .attr("text-anchor", "middle")
            .attr("font-family", "Verdana")
            .attr("font-size", 14)
            .attr("font-weight", "400");

        var words = text_.split(/\s+/).reverse();

        //limiting option
        if (words.length > MESSAGE_LIMIT && MESSAGE_LIMIT != 0) {
            words = words.slice(words.length - MESSAGE_LIMIT);
            words[0] = "...";
        }
        var word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.2,
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

    }
    
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};