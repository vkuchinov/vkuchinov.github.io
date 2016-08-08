uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

float addSine(vec2 pos, float a, float f, float angle, float s, float o) {
	return a * sin(f * (pos.y * cos(angle * 3.14/180.) + pos.x * sin(angle * 3.14/180.)) + time * s + o);
}

void main( void ) {

vec2 position = ( gl_FragCoord.xy / resolution.xy ) * vUv;

	float size = 0.02;
	
	float height = 0.;
	
	float rnd;
	for (float i = 0.; i < 20.; i++) {
		rnd = sin(i*cos(i));
		float a = .4 - rnd*.3*i;
		float f = 5. - 5.*rnd*i;
		float angle = 360. * rnd;
		float s = 1. + rnd*4.;
		float o = rnd;
		height += addSine(position, a, f, angle, s, o);
	}
	
	vec4 lightBlue = vec4(.4,.73,.9,1.);
	vec4 darkBlue = vec4(.2,.4,.6,1.);
	gl_FragColor = mix(lightBlue, darkBlue, height / 20.);
	if (length(gl_FragColor) > 1.8) {
		gl_FragColor *= 1.3;
	}

}
