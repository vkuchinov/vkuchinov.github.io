/*
* ITEMMESH
*
* @author Vladimir V. KUCHINOV
* @email  helloworld@vkuchinov.co.uk
*
*/

import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import React3 from "react-three-renderer";
import * as THREE from "three";

import TrackballControls from "./addons/TrackBall";
import MouseInput from "./addons/MouseInput";

class ItemMesh extends React.Component {
  static propTypes = {
    uniqueId: PropTypes.string,
    category: PropTypes.instanceOf(Object).isRequired,
    node: PropTypes.instanceOf(Object).isRequired,
    materialId: PropTypes.string,
    geometry: PropTypes.instanceOf(THREE.Geometry).isRequired,
    onCreate: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    const { node, category, materialId, geometry } = props;

    this.state = {
      node: node,
      category: category.type,
      materialId: materialId,
      id: node.name,
      alarm: false,
      alarmColor: 0,
      geometry: geometry,

      //aliases
      aliases: ["nodeId", "nodeType", "geo.geometry.coordinates", "attrs.role"]
    };

    this.node = this.props.node;
  }

  _animate = () => {};

  componentDidMount() {
    const { category } = this.state;
    if (category === "Device") {
      this.setState({ alarm: true });
    }
  }

  componentDidUpdate(props_) {}

  _onMouseEnter = () => {
    const { node, aliases } = this.state;

    let string = [];

    aliases.map(function(item_, k) {
      var v = item_.split(".").reduce(function(a, b) {
        return a[b];
      }, node.full_data);
      string.push(item_ + ": " + v);
    });

    var setTooltip = this.props.setTooltip;
    setTooltip(true, string);
  };

  _onMouseLeave = () => {
    var setTooltip = this.props.setTooltip;
    setTooltip(false, this.state.id);
  };

  _onMouseMove = event => {};

  _ref = mesh => {
    const { onCreate } = this.props;
    onCreate(mesh);
  };

  render() {
    const {
      materialId,
      node,
      geomery,
      category,
      geometry,
      alarmColor
    } = this.state;
    let zHeight = 0;

    const position = new THREE.Vector3(node.x, 4, node.y);

    let c = "rgb(" + alarmColor + ", 0, 0)";

    if (category === "Device") {
      return ((
        <group position={position}>
          <mesh
            ref={this._ref}
            rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
            onMouseEnter={this._onMouseEnter}
            onMouseLeave={this._onMouseLeave}
          >
            <geometry
              vertices={geometry.vertices}
              faces={geometry.faces}
              faceVertexUvs={geometry.faceVertexUvs}
            />
            <materialResource resourceId="alarmMaterial" />
          </mesh>
        </group>
      ): null);
    } else {
      return ((
        <mesh
          position={position}
          ref={this._ref}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
        >
          <geometryResource resourceId={"other"} />
          <materialResource resourceId={materialId} />
        </mesh>
      ): null);
    }
  }
}

export default ItemMesh;
