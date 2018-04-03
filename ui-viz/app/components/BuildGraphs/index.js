/*
* BUILD 2D GRAPH[S] β-version
*
* TODO
*
* [x] Take the input data passed in the json format specified in the attached file
*     (topology-search-api-example-xyz.json).
*     The input data specifies the nodes and relationships between those nodes.
*     Each relationship specifies the start and end node.
*
* [!] Provide a configuration parameter called “reposition”. This parameter is relevant only
*     IF the top level “crs” field in the data is set to “Linear”.
*
* [x] IF this parameter is set to false the component will use the x and y coordinates from
*     the input data (given in the coordinates field of each node in the order x and y)
*
*     ELSE
*
* [!] If this parameter is set to true the component will calculate the x and y coordinates of the given nodes.
*     It will do this using a tree/hierarchical layout similar to the following.
*     For this milestone we want the least time consuming implementation to implement this repositioning
*     (it could be using D3) http://mbostock.github.io/d3/talk/20111018/tree.html
*
* [!] This component will return the (optionally) repositioned data back to the caller.
*
* [-] planned, [x] done, [!] see comments
*
* @author Vladimir V. KUCHINOV
* @email  helloworld@vkuchinov.co.uk
*
*/

import React from 'react';
import * as d3 from 'd3';
import data from '../../data/example3.json';

class BuildGraph2D extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // simulation area
      dimensions: { width: 256, height: 256 },
      // simulation parameters
      simulation: { strength: -80, distance: 20, strength: 1, iterations: 16 },
      nodes: [],
      rels: [],
    };
  }

  componentDidMount() {
    const dims = this.state.dimensions;
    const nodes = this.state.nodes;
    const rels = this.state.rels;

    const area = {
      xMin: Number.POSITIVE_INFINITY,
      xMax: Number.NEGATIVE_INFINITY,
      yMin: Number.POSITIVE_INFINITY,
      yMax: Number.NEGATIVE_INFINITY,
    };
    let count = 0;

    // parsing paths from source data
    data.paths.map((path_, i) => {
      // parsing nodes
      path_.nodes.map((node_, j) => {
        const checkXY = function(xy_) {
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
          });
          count++;
        }
      });

      path_.rels.map((rel_, j) => {
        const src = nodes.filter(e => e.name === rel_.sourceNodeId)[0].index;
        const trg = nodes.filter(e => e.name === rel_.targetNodeId)[0].index;

        if (
          rels.filter(e => e.source === src && e.target === trg).length === 0
        ) {
          rels.push({ source: src, target: trg, instances: 1 });
        } else {
          rels.filter(e => e.source === src && e.target === trg)[0].instances++;
        }
      });
    });

    if (data.crs === 'Linear') {
      nodes.map(node_ => {
        delete node_.x;
        delete node_.y;
      });
      this.buildGraph();
    } else {
      // map input XY values to fit 3D reserved area
      const mapValue = function(value_, min1_, max1_, min2_, max2_) {
        return min2_ + (value_ - min1_) / (max1_ - min1_) * (max2_ - min2_);
      };

      nodes.map(node_ => {
        node_.x = mapValue(
          node_.x,
          area.xMin,
          area.xMax,
          -dims.width / 2,
          dims.width / 2
        );
        node_.y = mapValue(
          node_.y,
          area.yMin,
          area.yMax,
          -dims.height / 2,
          dims.height / 2
        );
      });
    }

    // update this.state.*
    this.forceUpdate();
  }

  buildGraph() {
    const nodes = this.state.nodes;
    const rels = this.state.rels;
    const parameters = this.state.simulation;

    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-80))
      .force(
        'link',
        d3
          .forceLink(rels)
          .distance(20)
          .strength(1)
          .iterations(16)
      )
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .stop();

    d3.timeout(() => {
      // that's a really important stage of force graph simulation
      for (
        let i = 0,
          n = Math.ceil(
            Math.log(simulation.alphaMin()) /
              Math.log(1 - simulation.alphaDecay())
          );
        i < n;
        ++i
      ) {
        simulation.tick();
      }
    });

    this.forceUpdate();
  }

  render() {
    return <div />;
  }
}

export default BuildGraph2D;
