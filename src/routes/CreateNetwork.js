import React, {Component} from 'react';
import NetworkTypeSelect from '../create/NetworkTypeSelect'
import NodeInput from '../create/NodeInput'
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

export default class CreateNetworkPage extends Component {
	constructor() {
		super();
		this.state = {
		};
	}

	render() {
		return (
			<div>
				<NetworkTypeSelect/>
				<NodeInput/>
			</div>
		);
	}
}
