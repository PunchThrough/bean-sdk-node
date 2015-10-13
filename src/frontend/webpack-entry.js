var React = require('react')
var ReactDOM = require('react-dom')

//ReactDOM.render(
//  <div>
//    <h1>Hello, world!</h1>
//    <p>This was rendered by React.</p>
//  </div>,
//  document.getElementById('content')
//)

var Hello = React.createClass({displayName: 'Hello',
  render: function() {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

ReactDOM.render(
  React.createElement(Hello, {name: "World"}),
  document.getElementById('content')
);
