/*

TOOLKIT

*/

//retina and high-resolution mobile devices tweak

function setHighPPI(canvas_) {
    
   var PIXEL_RATIO = (function () {
         var ctx = document.createElement("canvas").getContext("2d"),
             dpr = window.devicePixelRatio || 1,
             bsr = ctx.webkitBackingStorePixelRatio ||
             ctx.mozBackingStorePixelRatio ||
             ctx.msBackingStorePixelRatio ||
             ctx.oBackingStorePixelRatio ||
             ctx.backingStorePixelRatio || 1;

       return dpr / bsr; 
   
   })();
    
  canvas_.style.width  = canvas_.width  + "px";
  canvas_.style.height = canvas_.height + "px";

  canvas_.width  *= PIXEL_RATIO;
  canvas_.height *= PIXEL_RATIO;

  var context = canvas_.getContext('2d');
  context.scale(PIXEL_RATIO, PIXEL_RATIO)
  
}

function Toolkit( parent_ ) {

this.parent = parent_;
    
this.width;
this.height;
this.aspectRatio;
this.data = null;
this.type = -1;
    
this.width = this.parent.offsetWidth;
this.height = this.parent.offsetHeight;
this.aspectRatio = this.width / this.height;

    
//typography parameters
this.offsets = { left: 32, top: 92};
this.colors = { lightGray: "#C8C9CB", darkGray: "#53585F", positive: "#72bE49", negative: "#DC6A23" }; 
this.font = "Trebuchet MS";
this.fontSize = 18.0;
this.lineSpacing = 1.8;
   
this.canvas = document.createElement("canvas");
this.canvas.width = this.parent.offsetWidth;
this.canvas.height = this.parent.offsetHeight;
this.canvas.style.position = "absolute";
setHighPPI(this.canvas);
this.parent.appendChild(this.canvas)

this.content = this.canvas.getContext("2d");
    
this.update = function(name_, data_){
    
    if(data_ != null && name_ != null) {
        
        this.type = data_.type;
        
        var line = 0;
        name_ = name_.replace("_R", " (R)");
        name_ = name_.replace("_L", " (L)");
        
        this.content.fillStyle = "#494949";
        this.content.fillRect(0, 0, this.width, this.height);
        
        this.content.textAlign = "start"; 
        
        this.content.font = "normal " + this.fontSize * 0.6 + "px " + this.font;
        this.content.fillStyle = "#FFFFFF";
        this.content.fillText(name_ + " Circumference", this.offsets.left, this.offsets.top);
        
        line += this.fontSize * this.lineSpacing * 1.5;
        
        this.content.font = "bold " + this.fontSize + "px " + this.font;
        this.content.fillStyle = "#FFFFFF";
        this.content.fillText("Current:", this.offsets.left, this.offsets.top + line);
        if(getDelta(data_) > 0) { this.content.fillStyle = this.setColor(1, this.type); } else { this.content.fillStyle = this.setColor(-1, this.type); };
        this.content.fillText(data_.current + "\"", this.offsets.left + this.fontSize * 6.0, this.offsets.top + line);
        line += this.fontSize * this.lineSpacing;
        
        this.content.font = "normal " + this.fontSize + "px " + this.font;
        this.content.fillStyle = "#FFFFFF";
        this.content.fillText("Last:", this.offsets.left, this.offsets.top + line);
        this.content.fillText(data_.last + "\"", this.offsets.left + this.fontSize * 6.0, this.offsets.top + line);
        line += this.fontSize * this.lineSpacing;
        
        this.content.fillText("Goal:", this.offsets.left, this.offsets.top + line);
        this.content.fillText(data_.goal + "\"", this.offsets.left + this.fontSize * 6.0, this.offsets.top + line);
        line += this.fontSize * this.lineSpacing * 1.2;
        
        this.drawBar(data_, line);
        
    } else {
        
        this.content.fillStyle = "#494949";
        this.content.fillRect(0, 0, this.width, this.height);
        
    }

}

this.drawBar = function(data_, line_) {
    
    this.content.font = "normal " + this.fontSize * 0.8 + "px " + this.font;
    
    var data = { current: data_.current, last: data_.last, goal: data_.goal, reference: calculateReference(data_) };
    this.content.fillStyle = this.colors.lightGray;
    this.content.fillRect(this.offsets.left, this.offsets.top + line_, this.fontSize * 12.0, this.fontSize * 1.5);
    
    //darkgray segment between goal and the closest value [current, last]
    this.setDarkSegment(data, this.fontSize * 12.0, this.offsets.top + line_);
    this.setCLSegment(data, this.fontSize * 12.0, this.offsets.top + line_);
    
    line_ += this.lineSpacing * 28.0;

    //min values, always a reference number
    this.setScale(data, data.reference, this.fontSize * 12.0, line_, "left");
    //middles
    this.setScale(data, getSecond(data), this.fontSize * 12.0, line_, "center");
    this.setScale(data, getThird(data), this.fontSize * 12.0, line_, "center");
    //max value
    this.setScale(data, max(data), this.fontSize * 12.0, line_, "right");

}
    
this.setScale = function(data_, value_, max_, line_, align_){
    
    if(value_ == data_.current) { if(getDelta(data_) > 0) { this.content.fillStyle = this.setColor(1, this.type); } else { this.content.fillStyle = this.setColor(-1, this.type); } 
    } else { this.content.fillStyle = "#FFFFFF"; }
    this.content.textAlign = align_; 
    var mappedValue = map(value_, min(data_), max(data_), 0, max_);
    this.content.fillText(value_ + "\"", this.offsets.left + mappedValue, this.offsets.top + line_ ); 
    this.content.fillStyle = "#FFFFFF";
    this.content.fillRect(this.offsets.left + mappedValue - 0.5, this.offsets.top + line_ - this.fontSize * 1.25, 1.0, 5.0);
    
}

this.setDarkSegment = function(data_, length_, line_){
    
   this.content.fillStyle = this.colors.darkGray;
   var mappedValue = map(data_.goal, min(data_), max(data_), 0, length_);
   var mappedDelta = (data_.current - data_.goal) * length_ / (max(data_) - min(data_));
   this.content.fillRect(this.offsets.left + mappedValue, line_, mappedDelta, this.fontSize * 1.5);
    
}

this.setCLSegment = function(data_, length_, line_){
    
   var mappedValue = map(data_.current, min(data_), max(data_), 0, length_);
   var mappedDelta = (data_.last - data_.current) * length_ / (max(data_) - min(data_));
   if(mappedDelta > 0 ) { this.content.fillStyle = this.setColor(1, this.type); } else { this.content.fillStyle = this.setColor(-1, this.type); }
   this.content.fillRect(this.offsets.left + mappedValue, line_, mappedDelta, this.fontSize * 1.5);
    
}

this.setColor = function(case_, type_){
        
    if( case_ == 1  && type_ == -1) { return this.colors.positive; }
    if( case_ == 1  && type_ == 1) { return this.colors.negative; }
    if( case_ == -1  && type_ == -1) { return this.colors.negative; }
    if( case_ == -1  && type_ == 1) { return this.colors.positive; }

    return this.defaultTexture;
}
    
this.clear = function(){
    
    this.content.fillStyle = "#494949";
    this.content.clearRect(0, 0, this.width, this.height);
    
}
    
this.resize = function() {
    
    this.width = this.parent.offsetWidth;
    this.height = this.width * this.aspectRatio;
    
    this.content.fillStyle = "#494949";
    this.content.fillRect(0, 0, this.width, this.height);
    
}
    
}
