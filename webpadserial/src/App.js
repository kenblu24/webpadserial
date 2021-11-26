import React from 'react';
import './App.scss';
import GamepadViz from './gamepadViz'
import * as cjs from './Controller.js';

function ControllerButton(props) {
  const c = props.controller;
  return (
    <div className="ControllerButton footerButton" draggable="true">
      <GamepadViz c={c} />
      {props.controller.index}

    </div>
  );
}

function ConnectionContainer(props) {
  return (
    <div className="ConnectionContainer">
      <div className={'ConnectButton footerButton' + (props.connected ? ' connected' : ' disconnected')}
          onClick={props.onClick}>
        <h2> {props.connected ? 'Connected' : 'Disconnected'} </h2>
        <span>115200 Baud</span>
      </div>
    </div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serialConnected: false,
      port: null,
      reader: null,
      writer: null,
      blimps: Array(2).fill(null),
      controllers: null,
    }
    this._handleControllerChange = this.handleControllerChange.bind(this);
  }

  componentDidMount() {
    cjs.Controller.search();

    window.addEventListener('load', function() {
        console.log("Checking for gamepad support");
        if (cjs.Controller.supported) {
            document.body.setAttribute('data-supported', 'true');
            console.log("Gamepad support detected");
        } else {
            document.body.setAttribute('data-supported', 'false');
        }
    }, {passive: false, once: true});
    // Controller events
    window.addEventListener('gc.controller.found', this._handleControllerChange, false);
    window.addEventListener('gc.controller.lost', this._handleControllerChange, false);
    // Input events
    window.addEventListener('gc.button.press', this._handleControllerChange, false);
    window.addEventListener('gc.button.hold', this._handleControllerChange, false);
    window.addEventListener('gc.button.release', this._handleControllerChange, false);
    window.addEventListener('gc.analog.change', this._handleControllerChange, false);
  }
  componentWillUnmount() {
    console.log("unmounting app");
    window.removeEventListener('gc.controller.found', this._handleControllerChange);
    window.removeEventListener('gc.controller.lost', this._handleControllerChange);
    window.removeEventListener('gc.button.press', this._handleControllerChange);
    window.removeEventListener('gc.button.hold', this._handleControllerChange);
    window.removeEventListener('gc.button.release', this._handleControllerChange);
    window.removeEventListener('gc.analog.change', this._handleControllerChange);
  }

  async handleConnectButtonClick() {
    let state = this.state;
    if (state.serialConnected === false) {
      const ports = await navigator.serial.requestPort();
      state.port = ports;
      state.port.open({baudRate: 115200});
      state.serialConnected = true;
    }
    else {
      state.serialConnected = false;
      state.port.close();
    }
    this.setState(state);
  }
  handleControllerChange(event) {
    var state = this.state;
    state.controllers = Object.values(cjs.Controller.controllers);
    this.setState(state);
  }

  render() {
    const controllers = this.state.controllers ? this.state.controllers.map((obj, i) => {return (
      <ControllerButton key={obj.index} controller={obj} />
    )}) : null;

    return (
    <div className="App">
      <div className="App-container">
        <div className="Dashboard-container">
          <div className="Timekeeper"> </div>
          <div className="BlimpGrid"> </div>
        </div>
      </div>
      <footer className="App-footer">
        <ConnectionContainer connected={this.state.serialConnected} onClick={() => this.handleConnectButtonClick()}/>
        <div className="controllers">
          {controllers}
        </div>
      </footer>
    </div>
  );}
}

export default App;
