"use strict"

import Dispatcher from 'dispatcher'

// Actions
const SERVER_DEVICE_FOUND = 'SERVER_DEVICE_FOUND';


function doServerAction(action, args) {
  Actions[action].apply(args)
}

function doClientAction(action, args) {
  Actions[action].apply(args)
}

let Actions = {

  SERVER_DEVICE_FOUND: (device)=> {
    console.log('-------------')
    console.log(device)
    Dispatcher.dispatch({
      actionType: SERVER_DEVICE_FOUND
    });
  }

}

module.exports = Actions
