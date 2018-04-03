/*
* CONNECTIONMESH
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

class ConnectionMesh extends React.Component {
  static propTypes = {
    link: PropTypes.instanceOf(Object).isRequired,
    layer: PropTypes.number,
    visible: PropTypes.number,
    onCreate: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const { color, link, layer, visible } = props;

    this.state = {
      link: link,
      color: color,
      layer: layer,
      id: link.full_data.relId,

      //aliases
      aliases: ['relId', 'relType', 'sourceNodeId', 'targetNodeId', 'layers'],
    };

    this.curve = new THREE.CurvePath();
    this.curve.arcLengthDivisions = 8;
      
    this.curveEmpty = new THREE.CurvePath();
    this.curveEmpty.arcLengthDivisions = 1;
      
  }

  calculateBezierCurve3D(p0_, p1_, p2_, n_) {
    var points = [];

    for (let i = 0; i < n_; i++) {
      let t = 1.0 / n_;
      let x = this._quadraticBezier(t * i, p0_.x, p1_.x, p2_.x),
        y = this._quadraticBezier(t * i, p0_.y, p1_.y, p2_.y),
        z = this._quadraticBezier(t * i, p0_.z, p1_.z, p2_.z);
      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }

  _quadraticBezier(t_, v0_, v1_, v2_) {
    return (
      Math.pow(1.0 - t_, 2) * v0_ +
      2.0 * (1.0 - t_) * t_ * v1_ +
      Math.pow(t_, 2) * v2_
    );
  }

  componentDidMount() {
      
    const { position, color, link, layer } = this.state;

    const source = link.source;
    const target = link.target;

    const x0 = source.x;
    const y0 = 3 + layer * 1;
    const z0 = source.y;

    const x2 = target.x;
    const y2 = 3 + layer * 1;
    const z2 = target.y;

    const x1 = x0 + (x2 - x0) / 2;
    const y1 = 3 * layer + y0 + (y2 - y0) / 2;
    const z1 = z0 + (z2 - z0) / 2;

    let q = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, y0, z0),
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2)
    );
    this.curve.add(q);
      
    q = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, y0, z0),
      new THREE.Vector3(x0, y0, z0),
      new THREE.Vector3(x0, y0, z0)
    );
      
    this.curveEmpty.add(q);
      
  }

  componentDidUpdate(props_) {}

  _onMouseEnter = () => {
    const { link, aliases } = this.state;

    let string = [];

    aliases.map(function(item_, k) {
      string.push(item_ + ': ' + link.full_data[item_]);
    });

    var setTooltip = this.props.setTooltip;
    setTooltip(true, string);
  };

  _onMouseLeave = () => {
    var setTooltip = this.props.setTooltip;
    setTooltip(false, '');
  };

  _animate = () => {};

  _ref = mesh => {
    const { onCreate } = this.props;
    onCreate(mesh);
  };

  render() {
    const { position, color, link, layer, } = this.state;
    const { visible } = this.props;

    let curve = this.curveEmpty;
    if(visible === 3 || visible === layer) { curve = this.curve; }
    if (this.curve.curves.length != 0) {
      return ((
        <mesh
          key={link.index}
          ref={this._ref}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
        >
          <tubeGeometry
            path={curve}
            radius={0.2}
            segments={8}
            radiusSegments={3}
          />
          <materialResource resourceId={"connectionMaterial" + layer} />
        </mesh>
      ): null);
    } else {
      return null;
    }
  }
}

export default ConnectionMesh;
