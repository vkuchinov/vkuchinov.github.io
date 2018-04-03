import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import PropTypes from "prop-types";
    
import data from 'components/GraphVisualisations3D/data/example5.json';
import data2 from 'components/GraphVisualisations3D/data/example3.json';

import GraphVisualisation3D from 'components/GraphVisualisations3D';


class Preloader extends React.Component {
    
  constructor(props) {
    super(props);

    this.state = {
        
        dataIndex : 0

    };
  }
    
    
  loadData  = () => {
      
      this.setState({dataIndex : 1});
      this.forceUpdate();
  }
  
  render() {
      
    const { dataIndex, } = this.state;
      
    console.log(dataIndex);
      
    if(dataIndex === 0){
      
    return ( 
        <div>
        <button onClick={this.loadData}>LOAD NEXT</button>
        <GraphVisualisation3D data={data2} />
        </div>
    
    );
        
    } else {
        
        return ( 
        <div>
        <GraphVisualisation3D data={data} />
        </div>
    
    );
        
    }
  }
}

export default Preloader;
