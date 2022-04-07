import React from 'react';
import { Transition, animated, config } from 'react-spring'
import './App.scss';
import { ConnectButton, ControllerButton } from './FooterBarComponents'
import { BlimpButton } from './BlimpGridComponents'
import * as cjs from './Controller.js';

const utilizeFocus = () => {
  //https://stackoverflow.com/questions/28889826/how-to-set-focus-on-an-input-field-after-rendering
  const ref = React.createRef();
  const setFocus = () => {if (ref.current) {
    ref.current.focus();
    ref.current.select();
  }};

  return {setFocus, ref};
}

const generalControllerEvents = [
  'gc.button.press',
  'gc.button.hold',
  'gc.button.release',
  'gc.analog.change',
];

class Blimp {
  constructor(id) {
    this.id = id;
    this.controllerId = null;
    this.isControllerAttached = false;
    this.isAutonomous = true;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serialSupported: false,
      serialConnected: false,
      port: null,
      portParameters: null,
      blimps: null,
      controllers: null,
      selectedController: null,
    }
  }

  componentDidMount() {
    let state = this.state;
    state.serialSupported = 'serial' in navigator;
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
    for (const es of generalControllerEvents) {
      window.addEventListener(es, this.handleControllerChange, false);
    }
    window.addEventListener('gc.controller.found', this.handleControllerFound);
    window.addEventListener('gc.controller.lost', this.handleControllerLost);
    this.setState(state);
  }
  componentWillUnmount() {
    console.log("unmounting app");
    for (const es of generalControllerEvents) {
      window.removeEventListener(es, this.handleControllerChange);
    }
    window.removeEventListener('gc.controller.found', this.handleControllerFound);
    window.removeEventListener('gc.controller.lost', this.handleControllerLost);
  }

  handleControllerChange = (event) => {
    let state = this.state;
    state.controllers = Object.values(cjs.Controller.controllers) || null;
    this.setState(state);
  }
  handleControllerFound = (event) => {
    let state = this.state;
    state.controllers = Object.values(cjs.Controller.controllers) || null;
    this.setState(state);
    const i = this.getControllersIndexById(event.detail.controller.index);  // index of new controller in state.controllers[]
    state.controllers[i].focuser = utilizeFocus();  // set focus ref.
    this.setState(state);
  }
  handleControllerLost = (event) => {
    let state = this.state;
    state.controllers = Object.values(cjs.Controller.controllers) || null;
    this.setState(state);
    for (let controller of state.controllers) {
      if (state.selectedController === controller.index)
        return;
    }
    state.selectedController = null;
    this.setState(state);
  }

  trySerialConnect = async (event, args) => {
    let state = this.state;
    if (state.serialConnected === false) {
      try {
        // try to connect to port
        const port = await navigator.serial.requestPort();
        state.port = port;
        state.port.open({baudRate: 115200});
        state.serialConnected = true;
      } catch (error) {
        console.log(error);
      }
    }
    else {
      try {
        state.serialConnected = false;
        state.port.close();
      } catch (error) {
        state.serialConnected = true;
        console.error(error);
      }
    }
    this.setState(state);
  }

  selectController(i, e=null, targetSelector=null) {
    let state = this.state;
    if (e && e.target.matches(targetSelector)) {console.log(e)}
    state.selectedController = parseInt(i);
    this.setState(state);
  }

  // given controller.index (managed by controller.js), find the i to access this controller in this.state.controllers[i]
  getControllersIndexById = controllerId => {
    for (let i in this.state.controllers)
      if (this.state.controllers[i].index === controllerId) return parseInt(i);
  }
  // given a blimp number, find the i to access the associated controller in this.state.controllers[i]. returns null if no controller
  getControllersIndexAttachedToBlimp = blimpId => {
    for (let i in this.state.controllers)
      if (this.state.controllers[i].attachedBlimp === blimpId) return parseInt(i);
  }

  attachControllerToBlimp = (e, blimpId, controller) => {
    const id = parseInt(blimpId);
    // create blimp if it doesn't exist
    if (this.state.blimps == null || !(id in this.state.blimps))
      this.addBlimp(id);
    let state = this.state;  // grab state after blimp added
    // remove this controller from all blimps
    for (let i in state.blimps)
      if (state.blimps[i].controllerId === controller.index) {
        state.blimps[i].controllerId = null;
        this.setBlimpToAutonmous(state.blimps[i]);
      }
    // unset this blimp from all controllers
    for (let i in state.controllers)
      if (state.controllers[i].attachedBlimp === id)
        state.controllers[i].attachedBlimp = null;
    // add this controller to the desired blimp
    state.blimps[id].controllerId = controller.index;
    this.setBlimpToOverride(state.blimps[id]);
    // associate desired blimp with desired controller
    state.controllers[this.getControllersIndexById(controller.index)].attachedBlimp = id;
    this.setState(state);
  }

  addBlimp = id => {
    let state = this.state;
    if (state.blimps == null)
      state.blimps = [];
    state.blimps[id] = (new Blimp(id));
    this.setState(state);
  }

  // Taken from arduino's map function
	remap(x, in_min, in_max, out_min, out_max) {
		return Math.ceil((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
	}

  // Writes output to serial if any serial port is connected
  serialWrite(value) {
    console.log(value);
    if (!this.state.serialConnected) { return; }

    const encoder = new TextEncoder();
    const writer = this.state.port?.writable?.getWriter();
    writer.write(encoder.encode(value));
    writer?.releaseLock();
  }

  setBlimpToAutonmous(blimp) {
    this.serialWrite(`<${blimp.id}`);
    blimp.isAutonomous = true;
  }

  setBlimpToOverride(blimp) {
    this.serialWrite(`>${blimp.id}]`);
    blimp.isAutonomous = false;
  }

  // Polls inputs and outputs them to a serial port based on the blimp's controller id.
  // If no controller id was found, the blimp is probably autonomous somehow.
	controlBlimpsViaOverride(blimp) {
		if (blimp.controllerId == null) { return; }

    const stickDeadzone = 40;
		const buttons = this.state.controllers[blimp.controllerId].inputs.buttons;
		const sticks = this.state.controllers[blimp.controllerId].inputs.analogSticks;

		let thrust = this.remap(sticks.RIGHT_ANALOG_STICK.position.y, -1, 1, -255, 255);
		let dir = this.remap(buttons.RIGHT_SHOULDER_BOTTOM.value - buttons.LEFT_SHOULDER_BOTTOM.value, -1, 1, -128, 128);
		let tail = this.remap(sticks.RIGHT_ANALOG_STICK.position.x, -1, 1, -90, 90);
		let grabberStatus = buttons.RIGHT_SHOULDER.value - buttons.LEFT_SHOULDER.value;

		if (Math.abs(thrust) < stickDeadzone)
			thrust = 0;
		if (Math.abs(tail) < stickDeadzone)
			tail = 0;

		if (buttons.SELECT.pressed) {
			this.setBlimpToAutonmous(blimp);
		} else if (buttons.START.pressed) {
			this.setBlimpToOverride(blimp);
		} else {
      // Outputs information to serial in this format: [blimpid, thrust, dir, tail, grabberstatus]
      this.serialWrite(`[${blimp.id},${thrust},${dir},${tail},${grabberStatus}]`);
		}
	}

/*
== == == == == == == ==
region: Render Main App
== == == == == == == ==
*/

  render() {
    const controllers = this.state.controllers?.map(obj => {return (
      <ControllerButton
        key={obj.index}
        controller={obj}
        active={obj.index === this.state.selectedController}
        onClick={(event) => {
          this.selectController(obj.index, event);
          obj.focuser.setFocus();
        }}
        focuser={obj.focuser?.ref}
        onEnter={(e, value) => {
          this.attachControllerToBlimp(e, value, obj);
        }}
      />
    )}) || null;

    // remap blimp array since react doesn't like missing indices
    let blimps = [];
    if (this.state.blimps) {
      for (let index in this.state.blimps) {
        const blimp = this.state.blimps[index];

        // This is here because it's in the render loop and this is the loop going over every blimp.
				this.controlBlimpsViaOverride(blimp);

        blimps.push(
          <BlimpButton
            key={blimp.id}
            controllerId={this.getControllersIndexAttachedToBlimp(blimp.id)}
            blimpIndex={blimp.id}
            mode={blimp.isAutonomous ? "Autonomous" : "Human-Override"}
          />
        );
      }
    }

    return (
    <div className="App">
      <div className="App-container" onClick={(e) => this.selectController(null)} >
        <div className="Dashboard-container">
          <div className="Timekeeper"> </div>
          <div className="BlimpGrid">
            <Transition
              keys={blimps?.map(obj => obj.key)}
              items={blimps}
              from={{opacity: 0}}
              enter={{opacity: 1}}
              leave={{opacity: 0}}
              config={config.default}
              delay={200}
            >{(styles, item) => {
              if (item != null) {
                return <animated.div key={parseInt(item.key)} style={styles}> {item} </animated.div>
              }
            }}</Transition>
          </div>
        </div>
      </div>
      <footer className="App-footer" >
        <div className="Connection-container">
          <ConnectButton
            serialSupported={this.state.serialSupported}
            serialConnected={this.state.serialConnected}
            doSerialConnect={this.trySerialConnect}
          />
        </div>
        <div className="controllers" onClickCapture={(e) => this.selectController(null)} >
          {controllers}
        </div>
      </footer>
    </div>
  );}
// endregion
}

export default App;
