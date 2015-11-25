'use strict'

require("babel/register")

let React = require('react')

class Icon extends React.Component {
  constructor() {
    super()
  }

  render() {
    let iconClasses = 'img-circle media-object pull-left icon-bean'
    return (
      <img className={iconClasses} src="assets/img/bean-full.png"></img>
    )
  }
}

module.exports = Icon
