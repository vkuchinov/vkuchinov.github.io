/*
* 3D ABSTRACT VISUALISATION[S] β-version
*
* TODO
* 
* [!] Take as input the (optionally) repositioned data that was provided by component 1
* [-] For this milestone this component will only support the “Linear” crs mode that will layout 
*     the graph in linear (abstract) space using x,y and z coordinates only. (However in near 
*     future milestone this component will also need to support the geo mode. ) 
*     For the Linear mode the component will ignore the latitude and longitude values in the data.
*    
* [-] This component will calculate the Z (height) of each relationship using the “layers” field in 
*     the relationship object of the data. Only three layers will be supported (0,1 2). 
*
*     Note that x and y coordinates determine where the nodes are placed while the z coordinate determines 
*     the height of the relationship. Between the same two nodes there could be multiple relationships that 
*     have different types and different layers. Visually the nodes will appear to be 3D objects centered 
*     at the x,y location specified while the relationships will be at different heights based on their layer. 
*
* [-] The component will use a 3D icon that looks like a router to represent a node where the nodeType 
*     is “Device”. For all other nodes it will use a generic spherical ball. 
*     These spherical balls will:
`*`
* [-] Have a different color for each unique nodeType. The front end can pick different colors or different 
*     shades keeping design harmony in mind. 
*
* [X] The front end will display a legend which will show the color along with the nodeType
*
* [!] We want to visually indicate if there is an event on the node (e.g., alarm). 
*     For this milestone this needs to be something simple.
*
* [-] The component will provide event handlers on nodes and relationships (edges). 
*     These event handlers will be used to display details when nodes and edges are clicked upon by a user.
*
* [-] The component will display the nodeId upon the nodes and the relType  upon the relationships. 
*     These names can be long and make the graph cluttered. So some thought should be given to truncating 
*     the names above a certain length and showing the full name on hover. 
*
* [x] The component will provide basic 3D visualization capabilities such as pan and zoom.
*
* BUGS
*
* [-] .shader > .flatShading @ react-three-renderer
* [-] Cannot read property 'left' of undefined at MouseInput._getRelativeMouseCoords
*
* [-] planned, [x] done, [!] see comments
*
* @author Vladimir V. KUCHINOV
* @email  helloworld@vkuchinov.co.uk
*
*/

import React from 'react';
import ReactDOM from 'react-dom';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import OBJLoader from 'three-obj-loader';
OBJLoader(THREE); //please keep it

import TrackballControls from './addons/TrackBall';
import MouseInput from './addons/MouseInput';

import ConnectionMesh from './ConnectionMesh';
import ItemMesh from './ItemMesh';

import '!file-loader?name=[name].[ext]!../../assets/router.obj';

const cameraName = 'camera';
const dragPlane = new THREE.Plane();

const inputnodes = [
  {
    index: 0,
    name: 'prod:ac12:8:::9223372036854775807',
    type: 'Device',
    x: -68.54874442804137,
    y: -21.451220585478392,
    vy: -0.0001793358428776354,
    vx: 0.0000058790400820392035,
  },
  {
    index: 1,
    name: 'prod:ac12:8:::9223372036854775807:395:9223372036854775807',
    type: 'Interface',
    x: -67.80635115820448,
    y: -0.8716613695088463,
    vy: -0.00008247456620976637,
    vx: -0.00004758823665351186,
  },
  {
    index: 2,
    name: 'prod:172.18.0.7:23:24:9223372036854775807',
    type: 'Link',
    x: -63.08349252633526,
    y: 19.271780782632636,
    vy: 0.000001522579188846431,
    vx: -0.000060629253135490235,
    alarm: false,
  },
  {
    index: 3,
    name: 'prod:172.18.0.7:387:9223372036854775807',
    type: 'Interface',
    x: -55.6323363202226,
    y: 38.57142166629341,
    vy: 0.00007486037374354456,
    vx: -0.00002240771928017308,
  },
  {
    index: 4,
    name: 'prod:172.18.0.7:9223372036854775807',
    type: 'Device',
    x: -44.8315467941765,
    y: 56.09657256846045,
    vy: 0.00011807679324484874,
    vx: 0.00010124218326778099,
  },
  {
    index: 5,
    name: 'prod:192.168.1.152:9223372036854775807',
    type: 'Device',
    x: 20.356377941002318,
    y: 10.939793625247944,
    vy: 0.00011895942402006462,
    vx: -0.00005629190690113069,
  },
  {
    index: 6,
    name: 'prod:192.168.1.152:1:9223372036854775807',
    type: 'Interface',
    x: 39.82051566226763,
    y: 19.26263876001662,
    vy: 0.00018622810155544418,
    vx: 0.000032353197419432256,
  },
  {
    index: 7,
    name:
      'prod:"08 00 27 15 A2 0C ":"Ethernet1":"08 00 27 2B 12 4A ":"Ethernet1":9223372036854775807',
    type: 'Link',
    x: 57.48234822733699,
    y: 7.66004405377434,
    vy: 0.00010584731126115284,
    vx: 0.0001236603655656334,
  },
  {
    index: 8,
    name: 'prod:192.168.1.150:1:9223372036854775807',
    type: 'Interface',
    x: 60.99804793095488,
    y: -13.325544196572686,
    vy: -0.000023247844551797748,
    vx: 0.00007691653257122216,
  },
  {
    index: 9,
    name: 'prod:192.168.1.150:9223372036854775807',
    type: 'Device',
    x: 51.45829407439686,
    y: -32.38935729469304,
    vy: -0.00012060691679732487,
    vx: 0.0000025494829052272183,
  },
  {
    index: 10,
    name: 'prod:192.168.1.150:999001:9223372036854775807',
    type: 'Interface',
    x: 31.866616373130075,
    y: -40.509029348794414,
    vy: -0.000208098132753143,
    vx: -0.00010022932431726691,
  },
  {
    index: 11,
    name:
      'prod:"08 00 27 15 A2 0C ":"Management1":"08 00 27 2B 12 4A ":"Management1":9223372036854775807',
    type: 'Link',
    x: 14.022324065961255,
    y: -29.22692640819759,
    vy: -0.00012588034371043328,
    vx: -0.0001845357598901635,
  },
  {
    index: 12,
    name: 'prod:192.168.1.152:999001:9223372036854775807',
    type: 'Interface',
    x: 10.880366015988356,
    y: -8.181231948031469,
    vy: 0.000004093136045473541,
    vx: -0.00013149691017868667,
  },
];
const inputrels = [
  {
    source: {
      index: 1,
      name: 'prod:ac12:8:::9223372036854775807:395:9223372036854775807',
      type: 'Interface',
      x: -67.80635115820448,
      y: -0.8716613695088463,
      vy: -0.00008247456620976637,
      vx: -0.00004758823665351186,
    },
    target: {
      index: 0,
      name: 'prod:ac12:8:::9223372036854775807',
      type: 'Device',
      x: -68.54874442804137,
      y: -21.451220585478392,
      vy: -0.0001793358428776354,
      vx: 0.0000058790400820392035,
    },
    instances: 8,
    index: 0,
  },
  {
    source: {
      index: 2,
      name: 'prod:172.18.0.7:23:24:9223372036854775807',
      type: 'Link',
      x: -63.08349252633526,
      y: 19.271780782632636,
      vy: 0.000001522579188846431,
      vx: -0.000060629253135490235,
    },
    target: {
      index: 1,
      name: 'prod:ac12:8:::9223372036854775807:395:9223372036854775807',
      type: 'Interface',
      x: -67.80635115820448,
      y: -0.8716613695088463,
      vy: -0.00008247456620976637,
      vx: -0.00004758823665351186,
    },
    instances: 8,
    index: 1,
  },
  {
    source: {
      index: 3,
      name: 'prod:172.18.0.7:387:9223372036854775807',
      type: 'Interface',
      x: -55.6323363202226,
      y: 38.57142166629341,
      vy: 0.00007486037374354456,
      vx: -0.00002240771928017308,
    },
    target: {
      index: 2,
      name: 'prod:172.18.0.7:23:24:9223372036854775807',
      type: 'Link',
      x: -63.08349252633526,
      y: 19.271780782632636,
      vy: 0.000001522579188846431,
      vx: -0.000060629253135490235,
    },
    instances: 8,
    index: 2,
  },
  {
    source: {
      index: 4,
      name: 'prod:172.18.0.7:9223372036854775807',
      type: 'Device',
      x: -44.8315467941765,
      y: 56.09657256846045,
      vy: 0.00011807679324484874,
      vx: 0.00010124218326778099,
    },
    target: {
      index: 3,
      name: 'prod:172.18.0.7:387:9223372036854775807',
      type: 'Interface',
      x: -55.6323363202226,
      y: 38.57142166629341,
      vy: 0.00007486037374354456,
      vx: -0.00002240771928017308,
    },
    instances: 8,
    index: 3,
  },
  {
    source: {
      index: 5,
      name: 'prod:192.168.1.152:9223372036854775807',
      type: 'Device',
      x: 20.356377941002318,
      y: 10.939793625247944,
      vy: 0.00011895942402006462,
      vx: -0.00005629190690113069,
    },
    target: {
      index: 6,
      name: 'prod:192.168.1.152:1:9223372036854775807',
      type: 'Interface',
      x: 39.82051566226763,
      y: 19.26263876001662,
      vy: 0.00018622810155544418,
      vx: 0.000032353197419432256,
    },
    instances: 2,
    index: 4,
  },
  {
    source: {
      index: 6,
      name: 'prod:192.168.1.152:1:9223372036854775807',
      type: 'Interface',
      x: 39.82051566226763,
      y: 19.26263876001662,
      vy: 0.00018622810155544418,
      vx: 0.000032353197419432256,
    },
    target: {
      index: 7,
      name:
        'prod:"08 00 27 15 A2 0C ":"Ethernet1":"08 00 27 2B 12 4A ":"Ethernet1":9223372036854775807',
      type: 'Link',
      x: 57.48234822733699,
      y: 7.66004405377434,
      vy: 0.00010584731126115284,
      vx: 0.0001236603655656334,
    },
    instances: 2,
    index: 5,
  },
  {
    source: {
      index: 8,
      name: 'prod:192.168.1.150:1:9223372036854775807',
      type: 'Interface',
      x: 60.99804793095488,
      y: -13.325544196572686,
      vy: -0.000023247844551797748,
      vx: 0.00007691653257122216,
    },
    target: {
      index: 7,
      name:
        'prod:"08 00 27 15 A2 0C ":"Ethernet1":"08 00 27 2B 12 4A ":"Ethernet1":9223372036854775807',
      type: 'Link',
      x: 57.48234822733699,
      y: 7.66004405377434,
      vy: 0.00010584731126115284,
      vx: 0.0001236603655656334,
    },
    instances: 2,
    index: 6,
  },
  {
    source: {
      index: 9,
      name: 'prod:192.168.1.150:9223372036854775807',
      type: 'Device',
      x: 51.45829407439686,
      y: -32.38935729469304,
      vy: -0.00012060691679732487,
      vx: 0.0000025494829052272183,
    },
    target: {
      index: 8,
      name: 'prod:192.168.1.150:1:9223372036854775807',
      type: 'Interface',
      x: 60.99804793095488,
      y: -13.325544196572686,
      vy: -0.000023247844551797748,
      vx: 0.00007691653257122216,
    },
    instances: 2,
    index: 7,
  },
  {
    source: {
      index: 9,
      name: 'prod:192.168.1.150:9223372036854775807',
      type: 'Device',
      x: 51.45829407439686,
      y: -32.38935729469304,
      vy: -0.00012060691679732487,
      vx: 0.0000025494829052272183,
    },
    target: {
      index: 10,
      name: 'prod:192.168.1.150:999001:9223372036854775807',
      type: 'Interface',
      x: 31.866616373130075,
      y: -40.509029348794414,
      vy: -0.000208098132753143,
      vx: -0.00010022932431726691,
    },
    instances: 2,
    index: 8,
  },
  {
    source: {
      index: 10,
      name: 'prod:192.168.1.150:999001:9223372036854775807',
      type: 'Interface',
      x: 31.866616373130075,
      y: -40.509029348794414,
      vy: -0.000208098132753143,
      vx: -0.00010022932431726691,
    },
    target: {
      index: 11,
      name:
        'prod:"08 00 27 15 A2 0C ":"Management1":"08 00 27 2B 12 4A ":"Management1":9223372036854775807',
      type: 'Link',
      x: 14.022324065961255,
      y: -29.22692640819759,
      vy: -0.00012588034371043328,
      vx: -0.0001845357598901635,
    },
    instances: 2,
    index: 9,
  },
  {
    source: {
      index: 12,
      name: 'prod:192.168.1.152:999001:9223372036854775807',
      type: 'Interface',
      x: 10.880366015988356,
      y: -8.181231948031469,
      vy: 0.000004093136045473541,
      vx: -0.00013149691017868667,
    },
    target: {
      index: 11,
      name:
        'prod:"08 00 27 15 A2 0C ":"Management1":"08 00 27 2B 12 4A ":"Management1":9223372036854775807',
      type: 'Link',
      x: 14.022324065961255,
      y: -29.22692640819759,
      vy: -0.00012588034371043328,
      vx: -0.0001845357598901635,
    },
    instances: 2,
    index: 10,
  },
  {
    source: {
      index: 5,
      name: 'prod:192.168.1.152:9223372036854775807',
      type: 'Device',
      x: 20.356377941002318,
      y: 10.939793625247944,
      vy: 0.00011895942402006462,
      vx: -0.00005629190690113069,
    },
    target: {
      index: 12,
      name: 'prod:192.168.1.152:999001:9223372036854775807',
      type: 'Interface',
      x: 10.880366015988356,
      y: -8.181231948031469,
      vy: 0.000004093136045473541,
      vx: -0.00013149691017868667,
    },
    instances: 2,
    index: 11,
  },
];

class AbstractVisualisation3D extends React.Component {
  constructor(props) {
    super(props);

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this._raycaster = new THREE.Raycaster();

    this.state = {
      backgroundColor: new THREE.Color(0xdedede),

      camera: cameraName,
      cameraPosition: new THREE.Vector3(0, 150, -250),
      cameraRotation: new THREE.Euler(),

      items: [
        {
          type: 'Device',
          color: '#F2385A',
          material: { c: 0xfff, e: 0xfff, s: 0xfff },
        },
        {
          type: 'Interface',
          color: '#F5A503',
          material: { c: 0xfff, e: 0xfff, s: 0xfff },
        },
        {
          type: 'Link',
          color: '#36B1BF',
          material: { c: 0xfff, e: 0xfff, s: 0xfff },
        },
      ],

      models: { router: { url: 'router.obj' } },
      loaded: false,
      nodes: [],
      links: [],
      offset: 0.8,
      dragging: false,
      tooltipLabel: '',
      tooltipXY: new THREE.Vector2(0, 0),
      tooltipVisibility: 'none',
    };

    this.interactables = [];
  }

  componentDidMount() {
    const { mouseInput, container } = this.refs;
    const { models } = this.state;

    //models loader
    this.THREE = THREE;
    const loader = new this.THREE.OBJLoader();
    const group = this.refs.group;
    const router = this.state.models.router.mesh;
    const items = this.state.items;

    this.setItemMaterials();

    loader.load(this.state.models.router.url, object => {
      //object.children[0].material = items[0].material;
      this.setState({
        models: {
          router: {
            geometry: new THREE.Geometry().fromBufferGeometry(
              object.children[0].geometry
            ),
          },
        },
        loaded: true,
      });
    });

    //parse input data
    this.state.nodes = inputnodes;

    //gap between links
    const offset = this.state.offset;
    let links = [];
    let count = 0;

    inputrels.map(function(rel_, i) {
      const relsSplitter = function(x0_, y0_, x1_, y1_, n_, offset_) {
        let out = [];
        let thikness = offset_ * (n_ - 1);
        let offsets = [n_];

        for (var j = 0; j < n_; j++) {
          offsets[j] = -thikness / 2 + thikness / n_ * j;
          offsets[j] += thikness / n_ / 2;
        }

        for (let i = 0; i < n_; i++) {
          var n = offsets[i];
          var dx = x0_ - x1_;
          var dy = y0_ - y1_;

          var dist = Math.sqrt(dx * dx + dy * dy);
          dx /= dist;
          dy /= dist;

          var x3 = x0_ + dy * n;
          var y3 = y0_ - dx * n;
          var x4 = x1_ + dy * n;
          var y4 = y1_ - dx * n;

          out.push({
            index: 'link_' + count,
            source: { x: x3, y: y3 },
            target: { x: x4, y: y4 },
          });
          count++;
        }

        return out;
      };

      let n = rel_.instances;
      let splitted = relsSplitter(
        rel_.source.x,
        rel_.source.y,
        rel_.target.x,
        rel_.target.y,
        n,
        offset
      );
      links = links.concat(splitted);
    });

    this.state.links = links;

    //setting camera controls
    const controls = new TrackballControls(
      this.refs.camera,

      ReactDOM.findDOMNode(this.refs.react3)
    );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 128;
    controls.maxDistance = 512;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.1;
    controls.addEventListener('change', () => {
      this.setState({
        cameraPosition: this.refs.camera.position.clone(),
        cameraRotation: this.refs.camera.rotation.clone(),
      });
    });

    this.controls = controls;

    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('mousemove', this._onMouseMove, false);
  }

  //possibly could be used for realtime update
  componentDidUpdate(props_) {}

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('mousemove', this._onMouseMove, false);

    delete this.controls;
  }

  setItemMaterials() {
    const items = this.state.items;
    items.map(function(item_, i) {
      const parseColor = function(hex_) {
        let f = parseInt(hex_.slice(1), 16),
          R = f >> 16,
          G = (f >> 8) & 0x00ff,
          B = f & 0x0000ff;

        var c = 'rgb(' + R + ',' + G + ',' + B + ')';

        return new THREE.Color(c);
      };

      const vibrantColor = function(color_, percent_) {
        let f = parseInt(color_.slice(1), 16),
          t = percent_ < 0 ? 0 : 255,
          p = percent_ < 0 ? percent_ * -1 : percent_,
          R = f >> 16,
          G = (f >> 8) & 0x00ff,
          B = f & 0x0000ff;

        let processed =
          '#' +
          (
            0x1000000 +
            (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 +
            (Math.round((t - B) * p) + B)
          )
            .toString(16)
            .slice(1);

        (f = parseInt(processed.slice(1), 16)),
          (R = f >> 16),
          (G = (f >> 8) & 0x00ff),
          (B = f & 0x0000ff);

        var c = 'rgb(' + R + ',' + G + ',' + B + ')';
        return new THREE.Color(c);
      };

      const saturatedColor = function(color_, percent_) {
        let f = parseInt(color_.slice(1), 16),
          t = Math.round(2.55 * percent_),
          R = (f >> 16) + t,
          G = ((f >> 8) & 0x00ff) + t,
          B = (f & 0x0000ff) + t;

        let processed =
          '#' +
          (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
          )
            .toString(16)
            .slice(1);

        (f = parseInt(processed.slice(1), 16)),
          (R = f >> 16),
          (G = (f >> 8) & 0x00ff),
          (B = f & 0x0000ff);

        var c = 'rgb(' + R + ',' + G + ',' + B + ')';
        return new THREE.Color(c);
      };

      item_.material.c = parseColor(item_.color); //base color
      item_.material.e = vibrantColor(item_.color, -0.5); //emissive color
      item_.material.s = saturatedColor(item_.color, 0.5); //specular color
    }, this);

    this.forceUpdate();
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  _onMouseOver = (e, name_) => {
    this.setState({ tooltipLabel: name_ });
    this.setState({ tooltipVisibility: 'flex' });
  };

  _onMouseOut = (e, name_) => {
    this.setState({ tooltipLabel: '' });
    this.setState({ tooltipVisibility: 'none' });
  };

  _setTooltip(visible_, name_) {
    if (!visible_) {
      this.setState({ tooltipLabel: '' });
      this.setState({ tooltipVisibility: 'none' });
    } else {
      this.setState({ tooltipLabel: name_ });
      this.setState({ tooltipVisibility: 'flex' });
    }
  }

  _animate = () => {
    const { mouseInput, camera, container } = this.refs;

    if (!mouseInput.isReady()) {
      const { scene, camera } = this.refs;

      mouseInput.ready(scene, container, camera);
      mouseInput.setActive(false);
    }

    this.controls.update();
  };

  _onMouseMove = event => {
    event.preventDefault();

    const { mouseInput } = this.refs;
    const ray: THREE.Ray = mouseInput.getCameraRay(
      new THREE.Vector2(event.clientX, event.clientY)
    );

    this.setState({
      tooltipXY: new THREE.Vector2(event.clientX, event.clientY),
    });

    const pos = dragPlane.intersectLine(
      new THREE.Line3(
        ray.origin,
        ray.origin.clone().add(ray.direction.clone().multiplyScalar(10000))
      )
    );
  };

  render() {
    const {
      cameraPosition,
      cameraRotation,

      mouseInput,
      camera,
      tooltipLabel,
      tooltipXY,
      tooltipVisibility,
    } = this.state;

    let style = {
      display: tooltipVisibility,
      backgroundColor: '#F0F0F090',
      position: 'absolute',
      zIndex: 100,
      minWidth: 200,
      minHeight: 26,
      overflow: 'hidden',
      padding: 6,
      paddingLeft: 12,
      fontSize: 10,
      top: tooltipXY.y,
      left: tooltipXY.x,
    };

    const width = window.innerWidth,
      height = window.innerHeight;

    //legend as list
    const listItems = this.state.items.map((item_, i) => (
      <li key={i} style={{ color: item_.color, fontSize: 14 }}>
        <span style={{ color: '#000000', fontSize: 14 }}>
          {item_.type.toUpperCase() + 'S'}
        </span>
      </li>
    ));

    //nodes
    const nodes = this.state.nodes.map(function(node_, i) {
      //get type parameters
      const { models, loaded } = this.state;
      const type = this.state.items.filter(e => e.type == node_.type)[0];
      let uniqueKey = 'item' + i;

      if (loaded) {
        let geom = new THREE.Geometry();

        geom.vertices = models.router.geometry.vertices;
        geom.faces = models.router.geometry.faces;
        geom.faceVertexUvs = models.router.geometry.faceVertexUvs;

        return (
          <ItemMesh
            key={uniqueKey}
            materialId={'material' + node_.type}
            node={node_}
            category={type}
            setTooltip={this._setTooltip.bind(this)}
            geometry={geom}
          />
        );
      }
    }, this);

    const links = this.state.links.map(function(link_, i) {
      let uniqueKey = 'connection' + i;

      return (
        <ConnectionMesh
          key={uniqueKey}
          position={new THREE.Vector3(0, 0, 0)}
          color={new THREE.Color(0x00ffff)}
          link={link_}
        />
      );
    }, this);

    const materials = this.state.items.map(function(item_) {
      return (
        <meshPhongMaterial
          key={'material' + item_.type}
          resourceId={'material' + item_.type}
          color={item_.material.c}
          emissive={item_.material.e}
          specular={item_.material.s}
          shininess={11}
        />
      );
    }, this);

    return (
      <div ref="container">
        <React3
          ref="react3"
          width={width}
          height={height}
          antialias
          pixelRatio={window.devicePixelRatio}
          clearColor={this.state.backgroundColor}
          mainCamera="camera"
          onAnimate={this._animate}
        >
          <module ref="mouseInput" descriptor={MouseInput} />
          <resources>
            <boxGeometry
              resourceId="router"
              width={10}
              height={10}
              depth={10}
            />
            {materials}
          </resources>
          <viewport
            x={0}
            y={0}
            width={width}
            height={height}
            cameraName={cameraName}
          />
          <scene ref="scene">
            <perspectiveCamera
              ref="camera"
              name={cameraName}
              fov={35}
              aspect={width / height}
              near={1e-2}
              far={1e4}
              position={cameraPosition}
              rotation={cameraRotation}
            />
            <cameraHelper cameraName={this.state.camera} />
            <pointLight
              color={0xffffff}
              intensity={0.4}
              position={new THREE.Vector3(0, 200, 0)}
            />
            <pointLight
              color={0xffffff}
              intensity={0.2}
              position={new THREE.Vector3(100, 200, 100)}
            />
            <gridHelper size={256} />
            <group
              ref="group"
              scale={new THREE.Vector3(1, 1, 1)}
              position={new THREE.Vector3(0, 25, 0)}
              rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
              visible={false}
            />
            {nodes}
            {links}
          </scene>
        </React3>

        <div
          style={{
            display: 'flex',
            backgroundColor: '#F0F0F090',
            position: 'absolute',
            zIndex: 99,
            width: 160,
            height: this.state.items.length * 32,
            top: 32,
            left: window.innerWidth - 192,
            padding: 0,
          }}
        >
          <div style={{ padding: 0 }}>
            <ul style={{ listStyleType: 'square' }}>{listItems}</ul>
          </div>
        </div>

        <div style={style}>{tooltipLabel}</div>
      </div>
    );
  }
}

export default AbstractVisualisation3D;
