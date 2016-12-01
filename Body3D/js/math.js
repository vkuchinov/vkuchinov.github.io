function getDelta(values_){ return values_.last - values_.current; }
function map(value_, min1_, max1_, min2_, max2_){ return min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_); }
function min(values_){ return Math.min(values_.current, values_.goal, values_.last, values_.reference); }
function max(values_){ return Math.max(values_.current, values_.goal, values_.last, values_.reference); }
function getSecond(values_) { return Math.min(values_.current, values_.goal, values_.last); }
function getThird(values_) { 
    
    var values = [ values_.current, values_.goal, values_.last ];
    values.sort();
    return values[1];
    
}

function screenXY(position_, camera_){

    var updated = new THREE.Vector3(position_.x, position_.y - 96, position_.z);
    var vector = updated.project(camera_);

    vector.x =   (vector.x * renderer.domElement.offsetWidth / 2) + renderer.domElement.offsetWidth / 2;
    vector.y =  -(vector.y * renderer.domElement.offsetHeight / 2 ) + renderer.domElement.offsetHeight / 2;

    return vector;
    
}

function calculateReference(data_) {

    var min = Math.min(data_.current, data_.last, data_.goal);
    var max = Math.max(data_.current, data_.last, data_.goal);
    return Math.floor(min - (max - min) * 0.4);
    
}
