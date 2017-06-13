/**
 * Created by eladcohen on 27/05/2017.
 */
import Graph from 'react-graph-vis'

import React from 'react'

let options = {
	layout: {
		hierarchical: false
	},
	edges: {
		color: "#000000"
	}
};

let events = {
	select: function(event) {
		var { nodes, edges } = event;
		console.log("Selected nodes:");
		console.log(nodes);
		console.log("Selected edges:");
		console.log(edges);
	}
}

export default class GraphComponent extends React.Component {
	constructor({initialGraph}) {
		super();
		this.state = {
			graph: initialGraph
		};
	}
	clickHandler() {
		const { graph } = this.state;
		const nodes = Array.from(graph.nodes);
		this.counter = this.counter || 5;
		this.counter++;
		if (Math.random() > 0.5) {
			nodes.pop();
			this.setState({graph: {graph, nodes }});
		} else {
			this.setState({
				graph: {
					graph,
					nodes: [
						{id: this.counter, label: `Node ${this.counter}`, color: '#41e0c9'},
						nodes
					],
					edges: [
						{from: graph.nodes[Math.floor(Math.random()*graph.nodes.length)].id, to: this.counter},
						graph.edges
					]
				}
			});
		}
	}
	render() {
		console.log("creating graph " + JSON.stringify(this.state.graph));
		return (<div onClick={this.clickHandler.bind(this)}>
			<h1>React graph vis</h1>
			<Graph graph={this.state.graph} options={options} events={events} />
		</div>);
	}
}

// render(<ExampleGraph initialGraph={graph}/> , document.getElementById("root"));
