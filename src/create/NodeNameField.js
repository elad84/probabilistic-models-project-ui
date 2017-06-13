import React, {Component} from 'react';
import TextField from 'material-ui/TextField';

export default class NodeNameField extends Component {
	constructor(props){
		super(props);
	}
	render(){
		return (
		<TextField
			floatingLabelText="Node Name"
			value={this.props.val}
		/>
		)
	}
}
