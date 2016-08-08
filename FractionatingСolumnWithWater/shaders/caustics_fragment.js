uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

#define f length(fract(q*=m*=.6+.1*d++)-.5)

void main( void ) {

vec2 position = -1.0 + 2.0 * vUv;

float d = 0.;
vec3 q = vec3(gl_FragCoord.xy / resolution.yy-13., time*.2);
    
mat3 m = mat3(-2.,-1.,2., 3.,-2.,1., -1.,1.,3.);
vec3 col = vec3(pow(min(min(f, f), f), 7.) * 20.);
gl_FragColor = vec4(clamp(col + vec3(0., 0.35, 0.5), 0.0, 1.0), 1.0);


}