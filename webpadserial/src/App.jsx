import React from 'react';
import './App.scss';
import GamepadViz from './GamepadViz'
import { ControllerIndicator }  from './GamepadViz'
import * as cjs from './Controller.js';


function BlimpButton(props) {
  return (
    <div className="BlimpButton" draggable="true">
      <div className="BlimpIndex">{props.blimpIndex || "X"}</div>
      <h3> {props.mode || "Undefined"} </h3>
      <ControllerIndicator index={props.controllerIndex || "X"} />
    </div>
  );
}

function ControllerButton(props) {
  const c = props.controller;
  return (
    <div className="ControllerButton footerButton" draggable="true">
      <GamepadViz c={c} showIndex={true} />
      {props.blimpNumber && ("Blimp " + props.blimpNumber)}
    </div>
  );
}

const allControllerEvents = [
  'gc.controller.found',
  'gc.controller.lost',
  'gc.button.press',
  'gc.button.hold',
  'gc.button.release',
  'gc.analog.change',
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serialSupported: false,
      serialConnected: false,
      port: null,
      reader: null,
      writer: null,
      blimps: null,
      controllers: null,
    }
    this._handleControllerChange = this.handleControllerChange.bind(this);
  }

  componentDidMount() {
    cjs.Controller.search();  // Start Controller.js and constantly poll controllers
    // Check for controller support
    window.addEventListener('load', function() {
        console.log("Checking for gamepad support");
        if (cjs.Controller.supported) {
            document.body.setAttribute('data-supported', 'true');
            console.log("Gamepad support detected");
        } else {
            document.body.setAttribute('data-supported', 'false');
        }
    }, {passive: false, once: true});
    // Install event listeners for controller events
    for (const es of allControllerEvents) {
      window.addEventListener(es, this._handleControllerChange, false);
    }
  }
  componentWillUnmount() {
    console.log("unmounting app");
    for (const es of allControllerEvents) {
      window.removeEventListener(es, this._handleControllerChange);
    }
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
    const controllers = this.state.controllers?.map((obj, i) => {return (
      <ControllerButton key={obj.index} controller={obj} />
    )}) || null;

    return (
    <div className="App">
      <div className="App-container">
        <div className="Dashboard-container">
          <div className="Timekeeper"> </div>
          <div className="BlimpGrid">
            <BlimpButton controllerIndex={null} blimpIndex={null} mode="Autonomous" />
          </div>
        </div>
      </div>
      <footer className="App-footer">
        <div className="ConnectionContainer">
          <div className={'ConnectButton footerButton' + (this.state.serialConnected ? ' connected' : ' disconnected')}
              onClick={() => this.handleConnectButtonClick()}>
            <h2> {this.state.serialConnected ? 'Connected' : 'Disconnected'} </h2>
            <span>115200 Baud</span>
          </div>
        </div>
        <div className="controllers">
          {controllers}
        </div>
      </footer>
    </div>
  );}
}

export default App;
