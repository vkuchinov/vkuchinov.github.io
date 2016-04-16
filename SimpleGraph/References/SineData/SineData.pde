void setup(){
  
   String data = "";
   float amplitude = 0.69;
   float angle = 0.0;
  
   for(int x = 0; x < 21; x++){
    
      float y = amplitude * sin (radians(360.0 / 21.0 * x));
     
      data += nf(y, 1, 4) + ",";
   } 
  
  println(data);
  
}
