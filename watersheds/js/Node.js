function Node(id_, cx_, cy_, parent_){
    
    this.id = id_;
    this.parent = parent_;
    this.cx = cx_;
    this.cy = cy_;
    

    this.radius = particleStyle.min + Math.random() * (particleStyle.max - particleStyle.min);
    this.hue = Math.floor(Math.random() * 360);
    this.color = colors[Math.round(Math.random() * 8)];

}

function NodeList(){
    
    
    this.getLast = function(){
        
        return null;
        
    }
    
}

function Ripple(id_, speed_){
    
    this.radius = 0;
    this.speed = speed_;
    
    this.update = function(){
        
        this.radius += this.speed;
        this.speed *= 1.01;
        
    }
    
}

function RippleGenerator(){
    
    this.MAX_RADIUS = 600.0;
    this.MAX_CHILDREN = 5;
    this.ripples = [];
    
    this.update = function(){
        
        var condemned = [];
        
        if(this.ripples.length > 0){
             
            for(var i = 0; i < this.ripples.length; i++){

                if(this.ripples[i].radius < this.MAX_RADIUS) { this.ripples[i].update(); } else { condemned.push(i); }

            }
        
        }
        
        this.killRipples(condemned);
        
    }
    
    this.getValues = function(){
        
        var output = "";
        if(this.ripples.length > 0){
        for(var i = 0; i < this.ripples.length; i++){ output += this.ripples[i].radius + " "; }
        }
        return output;
        
    }
    
    this.addRipple = function(){ if(this.ripples.length < this.MAX_CHILDREN) { this.ripples.push(new Ripple(this.ripples.length - 1, 2.0)); }}
    this.killRipples = function(indices_){ for(var i = 0; i < indices_.length; i++) { this.remove(this.ripples, indices_[i]); } }
    
    this.remove = function(array_, index_) {
             
          for(var i = array_.length; i--;) {
              
                  if(i === index_) {
                      array_.splice(i, 1);
                  }
          }
          return array_;
             
    }
    
}

function Vector2(x_, y_){
    
    this.x = x_;
    this.y = y_;
    
    this.dist = function(v_){ return Math.sqrt(Math.pow(v_.x - this.x, 2.0) + Math.pow(v_.y - this.y, 2.0)); }
    this.dist2 = function(v0_, v1_){ return Math.sqrt(Math.pow((v1_.x - v0_.x), 2.0) + Math.pow((v1_.y - v0_.y), 2.0)); }
    this.passed = function(v_){ 
    
        if(this.dist2(new Vector2(0.0, 0.0), this) < this.dist(new Vector2(0.0, 0.0), v_)) { 
          return 0;
        } else { 
          return 1;
        }
    
    }
    
    
}