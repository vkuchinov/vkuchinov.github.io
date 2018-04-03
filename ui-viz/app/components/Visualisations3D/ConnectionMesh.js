/*
* CONNECTIONMESH
* Child React.Component for rendering connetcions (rels)
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
    color: PropTypes.instanceOf(THREE.Color).isRequired,
    link: PropTypes.instanceOf(Object).isRequired,
  };

  constructor(props) {
    super(props);

    const { color, link } = props;

    this.state = {
      link: link,
      color: color,
    };
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

  componentDidMount() {}

  componentDidUpdate(props_) {}

  _animate = () => {};

  render() {
    const { position, color, link } = this.state;

    const source = link.source;
    const target = link.target;

    const x0 = source.x;
    const z0 = source.y;

    const x1 = source.x + (target.x - source.x) / 2;
    const z1 = source.y + (target.y - source.y) / 2;

    const x2 = target.x;
    const z2 = target.y;

    let curve = this.calculateBezierCurve3D(
      new THREE.Vector3(x0, 4, z0),
      new THREE.Vector3(x1, 4, z1),
      new THREE.Vector3(x2, 4, z2),
      8
    );

    return ((
      <line key={link.index}>
        <geometry vertices={curve} />
        <lineBasicMaterial color={color} />
      </line>
    ): null);
  }
}

export default ConnectionMesh;
