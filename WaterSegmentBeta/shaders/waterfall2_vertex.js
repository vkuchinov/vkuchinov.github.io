varying vec2 vUv;

void main()
{
vUv = uv;
vec4 mvPosition = modelViewMatrix * vec4( position, 0.5 );
gl_Position = projectionMatrix * mvPosition;
}
