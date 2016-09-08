var Vector2 = function (x_, y_) {
  this.x = x_;
  this.y = y_;
};

var Vector3 = function (x_, y_, z_) {
  this.x = x_;
  this.y = y_;
  this.z = z_;
};

var Bounds = function (v0_, v1_) {
  
    this.min = new Vector2(Math.min(v0_.x, v1_.x), Math.min(v0_.y, v1_.y));
    this.max = new Vector2(Math.max(v0_.x, v1_.x), Math.max(v0_.y, v1_.y));

};

function Element (id_, type_, p0_, p1_) {
    
    this.id = id_;
    this.type = type_;
    this.thickness = 4.0;
 
    this.points = [];
    this.points[0] = p0_; 
    this.points[1] = p1_;
    
    this.bounds = new Bounds(p0_, p1_);
 
}


function Group (id_, type_, children_) {
    
    this.id = id_;
    this.type = type_;
    this.children = children_;
    this.depth = 32.0;
    this.scale = Vector2(1.0, 1.0);
    this.sceneTransform = new Vector3(-50.0, 50.0, -50.0);
    this.bounds;
    //this.paint = paint_;

    //this.min = getMinBounds();
    //this.max = getMaxBounds();
    //this.pivot = getPivot(this.type, this.min, this.max);
    
    this.calculateBoundingPlane = function() {

    var min = new Vector2(Infinity, Infinity);
    var max = new Vector2(-Infinity, -Infinity);
        
    for(var c = 0; c < this.children.length; c++){
        
        min.x = Math.min(min.x, this.children[c].bounds.min.x); min.y = Math.min(min.y, this.children[c].bounds.min.y);  
        max.x = Math.max(this.children[c].bounds.max.x, max.x); max.y = Math.max(this.children[c].bounds.max.y, max.y);  
    }
    
    this.bounds = new Bounds(min, max);
    
    }.bind(this);
    
    this.calculateBoundingPlane();
    
}

Group.prototype.getPivot = function(min_, max_, type_) {
    
    var out = Vector2(0, 0);
    
    switch(type_) {
    case 'left':
        out.x = max_.x; out.y = max_.y;
        break;
    case 'center':
        out.x = min_.x + (max_.x - min_.x)/2; out.y = max_.y;
        break;
    case 'right':
        out.x = min_.x; out.y = max_.y;
        break;
    default:
        out.x = min_.x + (max_.x - min_.x)/2; out.y = max_.y;
        break;
}
            
    return out;
};


function SVGObject (XML_) {
    
    this.rawXML = XML_;
    this.groups = [];
    this.parseXML = function(){
        
    var sceneParameters = this.rawXML.getElementsByTagName('svg')[0].attributes.viewBox.textContent.split(" ");
    this.scene = new Bounds(new Vector2(0.0, 0.0), new Vector2(parseFloat(sceneParameters[2]), parseFloat(sceneParameters[3])));
        
    var g = this.rawXML.getElementsByTagName('g');
    for (var i = 0; i < g.length; i++) { 
    
        var children = [];
        
        for (var j = 0; j < g[i].childNodes.length; j++) { 
        
            var child = g[i].childNodes[j];
            
            if(child.tagName != undefined){
            
                if(child.tagName == "rect") { children.push(this.parseRectangle(child)); }
                else if(child.tagName == "line") { children.push(this.parseLine(child)); }
            }
            
        }

        var newGroup = new Group(i, g[i].getAttribute('id'), children);
        this.groups.push(newGroup);
        
    }
        
    for(var g = 0; g < this.groups.length; g++){
        if(this.groups[g].type == "central"){ this.central = new Vector2(this.groups[g].bounds.max.x - this.groups[g].bounds.min.x, this.groups[g].bounds.max.y - this.groups[g].bounds.min.y); }
    }
        

    }.bind(this);
    
    this.translateVector2D = function(v_){
        
        v_.x -= this.scene.max.x / 2;
        v_.y = this.scene.max.y - v_.y;
        
        return new Vector2(v_.x, v_.y);
        
    }.bind(this);
    
    this.parseRectangle = function(child_) {
    //console.log("parsing rectange");
    
    var v0 = new Vector2(parseFloat(child_.getAttribute('x')), parseFloat(child_.getAttribute('y')));
    var v1 = new Vector2(parseFloat(child_.getAttribute('x')) + parseFloat(child_.getAttribute('width')) , parseFloat(child_.getAttribute('y')) + parseFloat(child_.getAttribute('height')));
        
    return new Element(child_.id, "rect", this.translateVector2D(v0) , this.translateVector2D(v1));

    }.bind(this);
    
    this.parseLine = function(child_) {
    //console.log("parsing line"); 

    var v0 = new Vector2(parseFloat(child_.getAttribute('x1')), parseFloat(child_.getAttribute('y1')));
    var v1 = new Vector2(parseFloat(child_.getAttribute('x2')), parseFloat(child_.getAttribute('y2')));
    return new Element(child_.id, "line", this.translateVector2D(v0) , this.translateVector2D(v1));

    }.bind(this);
    
    this.getCentralLeftCorner = function() {
        
        var out = 0.0;
        
        for(var g = 0; g < this.groups.length; g++){
        if(this.groups[g].type == "central"){ out = (this.groups[g].bounds.max.x - this.groups[g].bounds.min.x) / 2; }
        }
        return out;

    }.bind(this);
    
    this.getCentralRightCorner = function() {
        
        var out = 0.0;
        
        for(var g = 0; g < this.groups.length; g++){
        if(this.groups[g].type == "central"){ out = (this.groups[g].bounds.max.x - this.groups[g].bounds.min.x) / 2; }
        }
        return out;

    }.bind(this);
    
    
}
