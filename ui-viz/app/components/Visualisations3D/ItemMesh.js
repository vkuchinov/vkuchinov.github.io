/*
* ITEMMESH
* Child React.Component for rendering items (nodes)
*
* @author Vladimir V. KUCHINOV
* @email  helloworld@vkuchinov.co.uk
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import TrackballControls from './addons/TrackBall';
import MouseInput from './addons/MouseInput';

class ItemMesh extends React.Component {
  static propTypes = {
    category: PropTypes.instanceOf(Object).isRequired,
    node: PropTypes.instanceOf(Object).isRequired,
    materialId: PropTypes.string,
    geometry: PropTypes.instanceOf(THREE.Geometry).isRequired,
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
      geometry: geometry,
    };
  }

  componentDidMount() {
    const { category } = this.state;

    if (category === 'Device') {
      this.setState({ alarm: true });
    }
  }

  componentDidUpdate(props_) {}

  _onMouseEnter = () => {
    var setTooltip = this.props.setTooltip;
    setTooltip(true, this.state.id);
  };

  _onMouseLeave = () => {
    var setTooltip = this.props.setTooltip;
    setTooltip(false, this.state.id);
  };

  _animate = () => {};

  _onMouseMove = event => {};

  render() {
    const { materialId, node, geomery, category, geometry } = this.state;
    const position = new THREE.Vector3(node.x, 4, node.y);

    if (category === 'Device') {
      return ((
        <group position={position}>
          <mesh position={new THREE.Vector3(0, 8, 0)}>
            <sphereGeometry radius={1.5} widthSegments={4} heightSegments={4} />
            <meshBasicMaterial color={0xff0000} />
          </mesh>

          <mesh
            rotation={new THREE.Euler(-Math.PI / 2, 0, 0)}
            onMouseEnter={this._onMouseEnter}
            onMouseLeave={this._onMouseLeave}
          >
            <geometry
              vertices={geometry.vertices}
              faces={geometry.faces}
              faceVertexUvs={geometry.faceVertexUvs}
            />
            <materialResource resourceId={materialId} />
          </mesh>
        </group>
      ): null);
    } else {
      return ((
        <mesh
          position={position}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
        >
          <sphereGeometry radius={4} widthSegments={16} heightSegments={16} />
          <materialResource resourceId={materialId} />
        </mesh>
      ): null);
    }
  }
}

export default ItemMesh;
