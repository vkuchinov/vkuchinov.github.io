/*
* BUILD GRAPH 2D [as function] + 3D ABSTRACT VISUALISATION[S] β-version
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
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import PropTypes from "prop-types";
      
import * as d3 from 'd3';
import Chroma from './addons/Chroma';

import React3 from 'react-three-renderer';
import * as THREE from 'three';
import OBJLoader from 'three-obj-loader';
OBJLoader(THREE); //please keep it

var OrbitControls = require('./addons/OrbitControl')(THREE);
import MouseInput from './addons/MouseInput';
import Stats from './addons/Stats';

import ConnectionMesh from './ConnectionMesh';
import ItemMesh from './ItemMesh';

import '!file-loader?name=[name].[ext]!./assets/router.obj';

//CAMERA CONTROL ICONS
import RotateEnabled from '!svg-react-loader!./assets/rotateEnabled.svg';
import RotateDisabled from '!svg-react-loader!./assets/rotateDisabled.svg';
import PanEnabled from '!svg-react-loader!./assets/panEnabled.svg';
import PanDisabled from '!svg-react-loader!./assets/panDisabled.svg';

//LAYERS CONTROL
import LayersAll from '!svg-react-loader!./assets/layersAll.svg';
import Layers0 from '!svg-react-loader!./assets/layers0.svg';
import Layers1 from '!svg-react-loader!./assets/layers1.svg';
import Layers2 from '!svg-react-loader!./assets/layers2.svg';

const cameraName = 'camera';
const dragPlane = new THREE.Plane();

class GraphVisualisation3D extends React.Component {
  
          
    static propTypes = {
        
    data: PropTypes.object
        
    }

    constructor(props) {
    super(props);

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    this._setControlsToPan = this._setControlsToPan.bind(this);
    this._setControlsToRotate = this._setControlsToRotate.bind(this);

    this._raycaster = new THREE.Raycaster();

    this.state = {
      //building graph parameters
      dimensions: { width: 256, height: 256 },
      simulation: {
        strengthA: -80,
        distance: 25,
        strengthB: 1,
        iterations: 16,
      },
      nodes: [],
      rels: [],
      connections: [],

      //3d scene parameters
      backgroundColor: new THREE.Color(0xffffff),
      camera: cameraName,
      cameraPosition: new THREE.Vector3(0, 150, -250),
      cameraRotation: new THREE.Euler(),

      buttons: [true, false, 3],

      items: [],
      augteraColors: ['#06426B', '638BA6', '#FD9827'],

      models: { router: { url: 'router.obj' } },
      loaded: false,
      offset: 4.0,
      dragging: false,
        
      labelsOffset: new THREE.Vector3(6, -6, 0),
      gridDimensions : 256,
      gridOffset : new THREE.Vector2(0, 0),
        
      tooltipLabel: [''],
      tooltipVisibility: 'none',

      //blinking animation
      counter: 0,
    };

    //collecting all interactable objects
    //by now only items [routers and spheres]
    this.interactables = [];
    this.labels = [];
    this.counter = 0;
  }

  buildGraph(nodes, rels) {
    const params = this.state.simulation;

    let simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(params.strengthA))
      .force(
        'link',
        d3
          .forceLink(rels)
          .distance(params.distance)
          .strength(params.strengthB)
          .iterations(params.iterations)
      )
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .stop();

    //that's a really important stage of force graph simulation
    for (
      var i = 0,
        n = Math.ceil(
          Math.log(simulation.alphaMin()) /
            Math.log(1 - simulation.alphaDecay())
        );
      i < n;
      ++i
    ) {
      simulation.tick();
    }

    this.getDimensions(nodes);
    this.forceUpdate();
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

  componentDidMount() {
      
    let data = this.props.data;
      
    let colors0 = Chroma.interpolate.bezier(this.state.augteraColors);
    let palette = Chroma.scale(colors0)
      .mode('lab')
      .correctLightness(true);
    let items = [];

    const dims = this.state.dimensions;
    let nodes = [];
    let rels = [];

    let area = {
      xMin: Number.POSITIVE_INFINITY,
      xMax: Number.NEGATIVE_INFINITY,
      yMin: Number.POSITIVE_INFINITY,
      yMax: Number.NEGATIVE_INFINITY,
    };
    let count = 0;

    //parsing paths from source data
    data.paths.map(function(path_, i) {
      //parsing nodes
      path_.nodes.map(function(node_, j) {
        if (items.filter(e => e.type === node_.nodeType).length === 0) {
          items.push({
            type: node_.nodeType,
            color: '#FFFFFF',
            material: { c: 0xfff, e: 0xfff, s: 0xfff },
          });
        }

        var checkXY = function(xy_) {
          area.xMin = Math.min(area.xMin, xy_[0]);
          area.xMax = Math.max(area.xMax, xy_[0]);
          area.yMin = Math.min(area.yMin, xy_[1]);
          area.yMax = Math.max(area.yMax, xy_[1]);
        };

        if (nodes.filter(e => e.name === node_.nodeId).length === 0) {
          const xy = node_.geo.geometry.coordinates;
          checkXY(xy);

          nodes.push({
            index: count,
            name: node_.nodeId,
            type: node_.nodeType,
            alarm: node_.alarm,
            x: xy[0],
            y: xy[1],
            full_data: node_,
          });
          count++;
        }
      });

      path_.rels.map(function(rel_, j) {
        const src = nodes.filter(e => e.name === rel_.sourceNodeId)[0];
        const trg = nodes.filter(e => e.name === rel_.targetNodeId)[0];
        const layers = rel_.layers;

        if (rels.filter(e => e.relId === rel_.relId).length === 0) {
          rels.push({
            source: src,
            target: trg,
            instances: 1,
            layers: layers,
            full_data: rel_,
          });
        } else {
          rels.filter(e => e.source === src && e.target === trg)[0].instances++;
        }
      });
    });

    let total = items.length;

    items.map(function(item_, k) {
      const rgb = palette(1.0 / total * k)._rgb;
      item_.color =
        '#' +
        Number(rgb[0]).toString(16) +
        Number(rgb[1]).toString(16) +
        Number(rgb[2]).toString(16);
    });

    this.setState({ items: items });

    this.setItemMaterials(items);

    if (data.crs === 'Linear') {
      nodes.map(function(node_) {
        delete node_.x;
        delete node_.y;
      });
      this.buildGraph(nodes, rels);
    } else {
      //map input XY values to fit 3D reserved area
      var mapValue = function(value_, min1_, max1_, min2_, max2_) {
        return min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_);
      };

      nodes.map(function(node_) {
        node_.x = mapValue(
          node_.x,
          area.xMin,
          area.xMax,
          0.8 * -dims.width / 2,
          0.8 * dims.width / 2
        );
        node_.y = mapValue(
          node_.y,
          area.yMin,
          area.yMax,
          0.8 * -dims.height / 2,
          0.8 * dims.height / 2
        );
      });
    }

    this.setState({ nodes: nodes, rels: rels });

    const { mouseInput, container } = this.refs;
    const { models } = this.state;

    //models loader
    this.THREE = THREE;
    const loader = new this.THREE.OBJLoader();
    const group = this.refs.group;
    const router = this.state.models.router.mesh;

    loader.load(this.state.models.router.url, object => {
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

    //gap between connections
    const offset = this.state.offset;
    let connections = [];
    count = 0;

    rels.map(function(rel_, i) {
      const relsSplitter = function(
        x0_,
        y0_,
        x1_,
        y1_,
        n_,
        offset_,
        layer_,
        rel_
      ) {
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
            layers: layer_,
            full_data: rel_,
          });
          count++;
        }

        return out;
      };

      let layer = rel_.layers;

      let n = rel_.instances;
      let splitted = relsSplitter(
        rel_.source.x,
        rel_.source.y,
        rel_.target.x,
        rel_.target.y,
        n,
        1.0 / n * offset,
        layer,
        rel_.full_data
      );
      connections = connections.concat(splitted);
    });

    this.setState({ connections: connections });

    nodes.map(function(node_) {
      this.labels.push({
        name: node_.name.substr(0, 8),
        coordinates: { x: node_.x, y: node_.y },
      });
    }, this);

    //setting camera controls
    const controls = new OrbitControls(this.refs.camera);
    this.controls = controls;

    this.stats = new Stats();

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';

    this.refs.container.appendChild(this.stats.domElement);
      
    window.addEventListener('resize', this.updateWindowDimensions);
      
  }

  //possibly could be used for realtime update
  componentDidUpdate(props_) {
      
    const { mouseInput, camera, container } = this.refs;

    if (!mouseInput.isReady()) {
      const { scene, camera } = this.refs;

      mouseInput.ready(scene, container, camera);
      mouseInput.restrictIntersections(this.interactables);
      mouseInput.setActive(false);
    }
      
    mouseInput.containerResized();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  getDimensions(nodes_){
      
      let area = {
      xMin: Number.POSITIVE_INFINITY,
      xMax: Number.NEGATIVE_INFINITY,
      yMin: Number.POSITIVE_INFINITY,
      yMax: Number.NEGATIVE_INFINITY,
      width : 0,
      height : 0,
      dims : 0,
      centroid : new THREE.Vector2(0, 0)
          
    };
      
      nodes_.map(function(node_, i) {
          
          area.xMin = Math.min(area.xMin, node_.x);
          area.xMax = Math.max(area.xMax, node_.x);
          area.yMin = Math.min(area.yMin, node_.y);
          area.yMax = Math.max(area.xMax, node_.y);
          
          area.width = Math.abs(area.xMax - area.xMin);
          area.height = Math.abs(area.yMax - area.yMin);
          
          area.centroid.x += node_.x;
          area.centroid.y += node_.y;
          
          
      });
      
      
      this.setState({gridDimensions : 1.25 * Math.max(area.width, area.height), gridOffset : new THREE.Vector2(area.centroid.x/nodes_.length, area.centroid.y/nodes_.length)});

  }

  setItemMaterials(items) {
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
    this.setState({ tooltipLabel: [''] });
    this.setState({ tooltipVisibility: 'none' });
  };

  _setTooltip(visible_, name_) {
    if (!visible_) {
      this.setState({ tooltipLabel: [''] });
      this.setState({ tooltipVisibility: 'none' });
    } else {
      this.setState({ tooltipLabel: name_ });
      this.setState({ tooltipVisibility: 'flex' });
    }
  }

  _animate = () => {
      
    this.counter++;
    if(this.counter - this.state.counter > 5){
    this.setState({ counter: this.counter });
    }
    
    this.stats.update();
      
  };

  _onItemCreate = (index_, item_) => {
    this.interactables.push(item_);
  };

  _blink() {
    const { counter } = this.state;

    var blink = function(value_, min1_, max1_, min2_, max2_) {
      return Math.abs(
        min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_)
      );
    };

    return 'rgb(' + blink(counter % 255, 0, 255, -255, 255) + ',0,0)';
  }

  _toScreenXY(position_) {
    const { camera } = this.refs;
    const { container } = this.refs;

    if (camera != undefined && container != undefined) {
      var div = container;
      var width = div.offsetWidth;
      var height = div.offsetHeight;
      var offsetX = div.offsetLeft;
      var offsetY = div.offsetTop;

      var pos = position_.clone();
      let projScreenMat = new THREE.Matrix4();
      projScreenMat.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      pos.applyMatrix4(projScreenMat);

      return {
        x: (pos.x + 1) * width / 2 + offsetX,
        y: (-pos.y + 1) * height / 2 + offsetY,
      };
    } else {
      return position_;
    }
  }

  _setControlsToPan = () => {
      
    const layers = this.state.buttons[2];
    this.setState({ buttons: [false, true, layers] });
    this.controls.mouseButtons = {
      ORBIT: THREE.MOUSE.RIGHT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.LEFT,
    };
  };

  _setControlsToRotate = () => {
      
    const layers = this.state.buttons[2];
    this.setState({ buttons: [true, false, layers] });
    this.controls.mouseButtons = {
      ORBIT: THREE.MOUSE.LEFT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.RIGHT,
    };
  };

  _setLayerControls = () => {
      
    const btn1 = this.state.buttons[0];
    const btn2 = this.state.buttons[1];
      
    let layers = this.state.buttons[2];
    if(layers < 3 ) { layers++; } else { layers = 0; }
    this.setState({ buttons: [btn1, btn2, layers] });

  };

  render() {
    const {
      cameraPosition,
      cameraRotation,

      mouseInput,
      camera,
        
      labelsOffset,
      gridDimensions,
      gridOffset,
        
      tooltipLabel,
      tooltipVisibility,

      buttons,
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
      paddingLeft: 0,
      fontSize: 10,
      top: 32,
      left: 32
    };

    const width = window.innerWidth,
      height = window.innerHeight;

    //legend as list
    const listItems = this.state.items.map((item_, i) => (
      <li key={i} style={{ color: item_.color, fontSize: 32, lineHeight: 0.7, verticalAlign: "middle" }}>{'■'}
        <span style={{ color: '#000000', fontSize: 14, verticalAlign:"30%", paddingLeft: 6 }}>
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
            uniqueId={uniqueKey}
            materialId={'material' + node_.type}
            node={node_}
            onCreate={this._onItemCreate.bind(this, i)}
            category={type}
            setTooltip={this._setTooltip.bind(this)}
            geometry={geom}
          />
        );
      }
    }, this);

    const parsedTooltipLabel = this.state.tooltipLabel.map(function(
      element_,
      i
    ) {
        
      const key = Math.random()
        .toString(36)
        .substr(2, 9);
        
      return <li key={key}>{element_}</li>;
    });

    const labels = this.labels.map(function(label_, i) {
      let z = 999 + i;

      let xyz = new THREE.Vector3(
        label_.coordinates.x,
        4,
        label_.coordinates.y
      );
      let xy = this._toScreenXY(xyz.add(labelsOffset));

      const key = Math.random()
        .toString(36)
        .substr(2, 9);

      return (
        <div
          key={key}
          style={{
            display: 'flex',
            userSelect: 'none',
            position: 'absolute',
            zIndex: z,
            minWidth: 30,
            height: 20,
            top: xy.y,
            left: xy.x,
            padding: 3,
            fontSize: 9,
          }}
        >
          {label_.name}
        </div>
      );
    }, this);

    const connections = this.state.connections.map(function(link_, i) {
      let uniqueKey = 'connection' + i;

      return (
        <ConnectionMesh
          key={uniqueKey}
          position={new THREE.Vector3(0, 0, 0)}
          link={link_}
          layer={link_.layers}
          visible={buttons[2]}
          onCreate={this._onItemCreate.bind(this, i)}
          setTooltip={this._setTooltip.bind(this)}
        />
      );
    }, this);

    const materials = this.state.items.map(function(item_) {
      return (
        <meshStandardMaterial
          key={'material' + item_.type}
          resourceId={'material' + item_.type}
          color={item_.material.c}
          emissive={item_.material.e}
          roughness={0.6}
          metalness={0.2}
        />
      );
    }, this);

    const setButtons = this.state.buttons.map(function(button_, i) {
      if (i == 0 && button_) {
        return (
          <a key="btn1">
            <RotateEnabled width={32} height={32} />
          </a>
        );
      } else if (i == 0 && !button_) {
        return (
          <a key="btn1" onMouseDown={this._setControlsToRotate}>
            <RotateDisabled width={32} height={32} />
          </a>
        );
      } else if (i == 1 && button_) {
        return (
          <a key="btn2">
            <PanEnabled width={32} height={32} />
          </a>
        );
      } else if ( i == 1 && !button_) {
        return (
          <a key="btn2" onMouseDown={this._setControlsToPan}>
            <PanDisabled width={32} height={32} />
          </a>
        );
      }  
      else if(i == 2){
          
        if(button_ == 0){
            
        return (
          <a key="btn3" onMouseDown={this._setLayerControls}>
            <Layers0 width={32} height={32} />
          </a>
        );
            
        } else if(button_ == 1){
            
             return (
          <a key="btn3" onMouseDown={this._setLayerControls}>
            <Layers1 width={32} height={32} />
          </a>
        );
            
        } else if(button_ == 2){
            
             return (
          <a key="btn3" onMouseDown={this._setLayerControls}>
            <Layers2 width={32} height={32} />
          </a>
        );
            
        } else if(button_ == 3){
            
             return (
          <a key="btn3" onMouseDown={this._setLayerControls}>
            <LayersAll width={32} height={32} />
          </a>
        );
            
        }
                    
      }
        
        
    }, this);

    return (
      <div ref="container">
        <React3
          ref="react3"
          width={width}
          height={height}
          pixelRatio={window.devicePixelRatio}
          clearColor={this.state.backgroundColor}
          mainCamera="camera"
          onAnimate={this._animate}
          antialias
        >
          <module ref="mouseInput" descriptor={MouseInput} />
          <resources>
            <sphereGeometry
              resourceId="other"
              radius={4}
              widthSegments={16}
              heightSegments={16}
            />
            {materials}
            <meshStandardMaterial
              resourceId={'alarmMaterial'}
              color={new THREE.Color(this._blink())}
              emissive={new THREE.Color(this._blink())}
              roughness={0.6}
              metalness={0.2}
            />
            <meshBasicMaterial
              resourceId={'connectionMaterial0'}
              color={new THREE.Color(0x846868)}
            />
            <meshBasicMaterial
              resourceId={'connectionMaterial1'}
              color={new THREE.Color(0x747186)}
            />
            <meshBasicMaterial
              resourceId={'connectionMaterial2'}
              color={new THREE.Color(0x556f62)}
            />
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
              far={1e3}
              position={cameraPosition}
              rotation={cameraRotation}
            />
            <cameraHelper cameraName={this.state.camera} />
            <pointLight
              color={0xffffff}
              intensity={0.2}
              position={new THREE.Vector3(100, 200, 100)}
            />
            <gridHelper size={gridDimensions} position={new THREE.Vector3(gridOffset.x, 0, gridOffset.y)} colorGrid={0xF0F0F0} colorCenterLine={0xF0F0F0}/>
            <group
              ref="group"
              scale={new THREE.Vector3(1, 1, 1)}
              position={new THREE.Vector3(0, 25, 0)}
              rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
              visible={false}
            />
            {nodes}
            {connections}
          </scene>
        </React3>

        <div
          style={{
            display: 'flex',
            userSelect: 'none',
            backgroundColor: '#F0F0F050',
            position: 'absolute',
            zIndex: 98,
            width: 160,
            height: this.state.items.length * 20 + 60,
            top: 32,
            left: window.innerWidth - 192,
            padding: 0,
          }}
        >
          <div style={{ padding: 0, marginTop: -46, marginLeft: -20 }}>
            <ul style={{ listStyleType: 'none', fontSize : "62px" }}>{listItems}</ul>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            userSelect: 'none',
            position: 'absolute',
            zIndex: 99,
            minWidth: 60,
            minHeight: 32,
            top: window.innerHeight - 64,
            left: window.innerWidth - 142,
            padding: 6,
          }}
        >
          {setButtons}
        </div>
        <div style={style}>
          <ul>{parsedTooltipLabel}</ul>
        </div>
        {labels}
      </div>
    );
  }
}

export default GraphVisualisation3D;
