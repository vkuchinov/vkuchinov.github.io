  attribute vec2 aPos;
  attribute vec3 aNormz;
  uniform mat4 mvMatrix;
  uniform mat4 prMatrix;
  uniform float norm_z;
  varying vec4 color;
  const vec4 dirDif = vec4(0., 0., 1., 0.);
  const vec4 dirHalf = vec4(-.4034, .259, .8776, 0.);
void main(void) {
   gl_Position = prMatrix * mvMatrix * vec4(aPos, aNormz.z, 1.);
   vec4 rotNorm = mvMatrix * vec4( normalize( vec3(aNormz.xy, norm_z) ), .0);
   float i = max( 0., abs(dot(rotNorm, dirDif)) );
   color = vec4(0, .5*i, i, 1.);
   i = pow( max( 0., abs(dot(rotNorm, dirHalf)) ), 40.);
   color += vec4(i, i, i, 0.);
}
