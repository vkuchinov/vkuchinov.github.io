uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

vec2 hash( vec2 p )
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			 dot(p,vec2(269.5,183.3)) );
    //setting p mult to 0.0001 seems to get slightly smoother results
	return -1.0 + 2.0*fract(sin(p*0.0001)*43758.5453123);
}

float noise( in vec2 p )
{
	const float K1 = 0.366025404; // (sqrt(3)-1)/2;
	const float K2 = 0.211324865; // (3-sqrt(3))/6;
	
	vec2 i = floor( p + (p.x+p.y)*K1 );
	
	vec2 a = p - i + (i.x+i.y)*K2;
	vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
	vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;
	
	vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	
	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
	
	return dot( n, vec3(70.0) );
}

float fbm(vec2 uv)
{
	float f;
	mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
	f  = 0.5000*noise( uv ); uv = m*uv;
	f += 0.2500*noise( uv ); uv = m*uv;
	f += 0.1250*noise( uv ); uv = m*uv;
	f += 0.0625*noise( uv ); uv = m*uv;
    //increasing first float here widens flow
	f = 0.6 + 0.5*f;
	return f;
}

void main( void ) {

    vec2 position = -1.0 + 2.0 * vUv;
    
    vec2 uv = (gl_FragCoord.xy/resolution.x) - vec2(1.0,resolution.y/resolution.x);
	vec2 q = -uv;

    float strength = floor(6.);

    float T3 = max(3.,1.25 * strength) * time * 0.6 + pow(abs(q.y), 1.25) *2.; 
    float n = fbm(vec2(strength*q.x,strength*q.y) - vec2(0,T3));
    
    strength=26.;
    float T3B = max(3.,1.25*strength)*time*0.6+pow(abs(q.y),1.25)*2.;
    n = n*0.5 + (n*0.5)/(0.001+1.5*fbm(vec2(strength*q.x,strength*q.y) - vec2(0,T3B)));
    
    float intensity = abs(sin(time*0.2));
    n*=1.+pow(intensity,8.)*0.5;

    float c = 1. - (16./abs(pow(q.y,1.)*4.+1.)) * pow( max( 0., length(q*vec2(1.8+q.y*1.5,.75) ) - n * max( 0., q.y+.25 ) ),1.2 );
    float c1 = n * c * ((0.7+pow(intensity,0.8)*0.9-pow(intensity,4.)*0.4)-pow((1.0)*uv.y,2.));

    c1= c1*1.05+sin(c1*3.4)*0.4;
    c1*=0.95-pow(q.y,2.0);
    c1=clamp(c1,0.4,1.0);

    vec3 col = vec3(1.5*c1*c1*c1, 1.5*c1*c1*c1*c1, 1.25*c1*c1*c1*c1);

    col = col.zyx;

    float a = c * (1.-pow(abs(uv.y),10.));
    gl_FragColor = vec4( mix(vec3(0.),col, a), 1.0);
    
}