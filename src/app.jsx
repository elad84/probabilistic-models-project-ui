import React from 'react';
import '../styles/index.scss';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NetworkTypeSelect from './create/NetworkTypeSelect'
import GraphComponent from './graph/GraphComponent'
import NodeInput from './create/NodeInput'
import CreateNetworkPage from './routes/CreateNetwork'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

let graph = {
	nodes: [
		{id: 1, label: 'Node 1', color: '#e04141'},
		{id: 2, label: 'Node 2', color: '#e09c41'},
		{id: 3, label: 'Node 3', color: '#e0df41'},
		{id: 4, label: 'Node 4', color: '#7be041'},
		{id: 5, label: 'Node 5', color: '#41e0c9'}
	],
	edges: [
		{from: 1, to: 2},
		{from: 1, to: 3},
		{from: 2, to: 4},
		{from: 2, to: 5}
	]
};

export default class App extends React.Component {
  render() {
    return (
      <div>
				<MuiThemeProvider>
					<CreateNetworkPage/>
					{/*<NetworkTypeSelect />*/}
					{/*<GraphComponent initialGraph={graph}/>*/}
					{/*<NodeInput/>*/}
				</MuiThemeProvider>
      </div>
    )
  }
}
