import React, { useState, useEffect } from 'react';
import './FooterBarComponents.scss';
import { useTransition, animated } from 'react-spring'

export function ConnectButton(props) {
  const connectButtonClasses = (() => {
    const baseClasses = 'ConnectButton footerButton';
    if (props.serialSupported)
      return baseClasses + (props.serialConnected ? ' connected' : ' disconnected');
    else
      return baseClasses + ' unsupported';
  }) ();

  const onClick = (event) => {
    if (props.serialSupported)
      props.doSerialConnect(event)
    // else if not supported, do nothing
  }

  return(
    <div className={connectButtonClasses} onClick={onClick}>
      <h2>
        {(() => {
          if (props.serialSupported)
            return props.serialConnected ? 'Connected' : 'Disconnected';
          else
            return "Web Serial Unsupported";
        }) ()}
      </h2>
      <span>115200 Baud</span>
    </div>
  );
}

export function ControllerIndicator(props) {
  const transitions = useTransition(props.value, {
    from: {scale: 0},
    enter: {scale: 1},
    leave: {scale: 0},
    config: {
        mass: 1,
        tension: 380,
        friction: 12,
    },
  });
  return transitions( (styles, item) => {
    return (
      <animated.div className={"ControllerIndicator"}
        style={{
          scale: styles.scale.to(x => (x >= 0) ? x : 0),  // clamp to positive scale only
        }}
      >
        <svg
          id="prefix__ControllerIndicator"
          xmlns="http://www.w3.org/2000/svg"
          x={0}
          y={0}
          viewBox="0 0 300 240"
          xmlSpace="preserve"
        >
          <style>
            {
              // ".prefix__st0{stroke:#000;stroke-miterlimit:10}.prefix__st0,.prefix__st1{fill:#fff}"
            }
          </style>
          <path
            className="prefix__ControllerIndicator"
            d="M150 58c73.1 0 92.1-.9 106 23.3s27 63.6 29.2 75.2c2.2 11.6 16.9 71.4-19.8 71.4-8.3 0-40.2-28.9-53.1-38-12.9-9.2-37.7-7.3-62.3-7.3M150 58c-73.1 0-92.1-.9-106 23.3s-27 63.6-29.2 75.2C12.5 168.2-2.1 228 34.5 228c8.3 0 40.2-28.9 53.1-38 12.9-9.2 37.7-7.3 62.3-7.3"
          />
          <text
            className="controllerIndex"
            x="150"
            y="140"
            fontSize="75"
            fontWeight="700"
            textAnchor="middle"
          >
            {item == null ? null : (parseInt(item) + 1)}
          </text>
        </svg>
      </animated.div>
    );
  });
}

export function ControllerButton(props) {
  const [inputValue, setInputValue] = useState("");
  const c = props.controller;
  const dynClasses = (""
    + (props.active ? " active" : "")
  );

  const handleInputChange = e => {
    const newValue = e.nativeEvent.target.value;
    setInputValue(newValue.match(/\d+/) || "")
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      setInputValue(inputValue.toString().match(/\d+/) || "");
      props.onClick();  // select all in text field
      props.onEnter && props.onEnter(e, inputValue);
    }
  }

  // Taken from arduino's map function
  let remap = function(x, in_min, in_max, out_min, out_max) {
    return Math.ceil((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
  }

  const watchedInputs = [
    c.inputs.analogSticks.LEFT_ANALOG_STICK.position,
    c.inputs.analogSticks.RIGHT_ANALOG_STICK.position,
    c.inputs.buttons.DPAD_DOWN.value,
    c.inputs.buttons.DPAD_LEFT.value,
    c.inputs.buttons.DPAD_RIGHT.value,
    c.inputs.buttons.DPAD_UP.value,
    c.inputs.buttons.FACE_1.value,
    c.inputs.buttons.FACE_2.value,
    c.inputs.buttons.FACE_3.value,
    c.inputs.buttons.FACE_4.value,
    c.inputs.buttons.HOME.value,
    c.inputs.buttons.LEFT_ANALOG_BUTTON.value,
    c.inputs.buttons.LEFT_SHOULDER.value,
    c.inputs.buttons.LEFT_SHOULDER_BOTTOM.value,
    c.inputs.buttons.RIGHT_ANALOG_BUTTON.value,
    c.inputs.buttons.RIGHT_SHOULDER.value,
    c.inputs.buttons.RIGHT_SHOULDER_BOTTOM.value,
    c.inputs.buttons.SELECT.value,
    c.inputs.buttons.START.value,
  ];

  useEffect(() => {
    if (c.attachedBlimp >= 0) {
      // console.log("controlBlimpsViaOverride", blimp)
      // console.log("after check", blimp.controllerId)
      const buttons = c.inputs.buttons;
      const sticks = c.inputs.analogSticks;
      const stickDeadzone = 40;

      let vertical = remap(sticks.RIGHT_ANALOG_STICK.position.y, -1, 1, -511, 511);
      let forwards = remap(buttons.RIGHT_SHOULDER_BOTTOM.value - buttons.LEFT_SHOULDER_BOTTOM.value, -1, 1, -511, 511);
      let tail_angle = remap(sticks.LEFT_ANALOG_STICK.position.x, -1, 1, -90, 90);
      let grabberStatus = buttons.RIGHT_SHOULDER.value - buttons.LEFT_SHOULDER.value;

      if (Math.abs(vertical) < stickDeadzone)
        vertical = 0;
      if (Math.abs(tail_angle) < stickDeadzone)
        tail_angle = 0;

      if (buttons.SELECT.pressed) {
        props.setBlimpMode(c.attachedBlimp, "Autonomous");
      } else if (buttons.START.pressed) {
        props.setBlimpMode(c.attachedBlimp, "Manual");
      } else {
        props.handleInput(c.attachedBlimp, `[${c.attachedBlimp},${tail_angle},${forwards},${vertical},${grabberStatus}]\n`)
      }
    }
  }, watchedInputs);

  return (
    <div className={"ControllerButton-wrapper" + dynClasses} index={c.index.toString()}>
      <div className="blimpSelector-positioner">
        <div className="blimpSelector-container" onClickCapture={props.onClick} >
          <input
            value={inputValue}
            ref={props.focuser}
            placeholder="Blimp Number"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <div
        className={"ControllerButton footerButton" + dynClasses}
        draggable="true"
        onClick={props.onClick}
        title={c.id}  // controller vendor name
      >
        <GamepadViz c={c} showIndex={true} />
        {c.attachedBlimp && ("Blimp " + c.attachedBlimp)}
      </div>
    </div>
  );
}

export function GamepadViz(props) {
  const aMax = 9.5;
  const la = props.c.inputs?.analogSticks?.LEFT_ANALOG_STICK?.position;
  const ra = props.c.inputs?.analogSticks?.RIGHT_ANALOG_STICK?.position;
  const b = props.c.inputs?.buttons;
  return (
    <div className="GamepadViz-container">
      <svg
        id="prefix__Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        x={0}
        y={0}
        viewBox="0 0 300 240"
        xmlSpace="preserve"
      >
        <path
          className="prefix__st1 lb"
          d="M50.5 72.3s1.3-3.2 3.7-9.3c2.8-7.1 38.2-15 43.5-9.1 3.8 4.2 7.9 4.7 7.9 4.7"
        />
        <path
          className="prefix__st1 rb"
          d="M249.5 72.3s-1.3-3.2-3.7-9.3c-2.8-7.1-38.2-15-43.5-9.1-3.8 4.2-7.9 4.7-7.9 4.7"
        />
        <path
          className="prefix__st0 on lb"
          d="M50.5 72.3s1.3-3.2 3.7-9.3c2.8-7.1 38.2-15 43.5-9.1 3.8 4.2 7.9 4.7 7.9 4.7"
          fillOpacity={b.LEFT_SHOULDER?.value || 0}
        />
        <path
          className="prefix__st0 on rb"
          d="M249.5 72.3s-1.3-3.2-3.7-9.3c-2.8-7.1-38.2-15-43.5-9.1-3.8 4.2-7.9 4.7-7.9 4.7"
          fillOpacity={b.RIGHT_SHOULDER?.value || 0}
        />
        <path
          className="prefix__st1"
          d="M150 58c73.1 0 92.1-.9 106 23.3s27 63.6 29.2 75.2c2.2 11.6 16.9 71.4-19.8 71.4-8.3 0-40.2-28.9-53.1-38-12.9-9.2-37.7-7.3-62.3-7.3M150 58c-73.1 0-92.1-.9-106 23.3s-27 63.6-29.2 75.2C12.5 168.2-2.1 228 34.5 228c8.3 0 40.2-28.9 53.1-38 12.9-9.2 37.7-7.3 62.3-7.3"
        />
        <path
          className="prefix__st2"
          d="M150 58c73.1 0 92.1-.9 106 23.3s27 63.6 29.2 75.2c2.2 11.6 16.9 71.4-19.8 71.4-8.3 0-40.2-28.9-53.1-38-12.9-9.2-37.7-7.3-62.3-7.3M150 58c-73.1 0-92.1-.9-106 23.3s-27 63.6-29.2 75.2C12.5 168.2-2.1 228 34.5 228c8.3 0 40.2-28.9 53.1-38 12.9-9.2 37.7-7.3 62.3-7.3"
        />
        <circle className="prefix__st0 la_ring" cx={79} cy={100} r={25} />
        <circle className="prefix__st0 on la ls" r={15}
          cx={79 + aMax * (la?.x || 0)} cy={100 + aMax * (la?.y || 0)}
          fillOpacity={b.LEFT_ANALOG_BUTTON?.value || 0}
        />
        <circle className="prefix__st0 ra_ring" cx={189} cy={145} r={25} />
        <circle className="prefix__st0 on ra rs" r={15}
          cx={189 + aMax * (ra?.x || 0)} cy={145 + aMax * (ra?.y || 0)}
          fillOpacity={b.RIGHT_ANALOG_BUTTON?.value || 0}
        />
        <circle className="prefix__st0 on du" cx={121}    cy={130.5}  r={7.5} fillOpacity={b.DPAD_UP?.value || 0} />
        <circle className="prefix__st0 on dr" cx={136}    cy={145}    r={7.5} fillOpacity={b.DPAD_RIGHT?.value || 0} />
        <circle className="prefix__st0 on dd" cx={121}    cy={160.5}  r={7.5} fillOpacity={b.DPAD_DOWN?.value || 0} />
        <circle className="prefix__st0 on dl" cx={106}    cy={145}    r={7.5} fillOpacity={b.DPAD_LEFT?.value || 0} />
        <circle className="prefix__st0 on lm" cx={125}    cy={90}     r={5}   fillOpacity={b.SELECT?.value || 0} />
        <circle className="prefix__st0 on rm" cx={180}    cy={90}     r={5}   fillOpacity={b.START?.value  || 0} />
        <circle className="prefix__st0 on 0y" cx={227.5}  cy={85}     r={7.5} fillOpacity={b.FACE_4?.value || 0} />
        <circle className="prefix__st0 on 0b" cx={242.5}  cy={100}    r={7.5} fillOpacity={b.FACE_2?.value || 0} />
        <circle className="prefix__st0 on 0a" cx={227.5}  cy={115}    r={7.5} fillOpacity={b.FACE_1?.value || 0} />
        <circle className="prefix__st0 on 0x" cx={212.5}  cy={100}    r={7.5} fillOpacity={b.FACE_3?.value || 0} />
        <path
          className="prefix__st1 lt rt"
          d="M65.7 17.2c-4 2-13.6 30.5 3.5 27.3S79 26.7 79.3 15.7c-4.3-.9-9.6-.5-13.6 1.5zM234.3 17.2c4 2 13.6 30.5-3.5 27.3s-9.8-17.8-10.1-28.8c4.3-.9 9.6-.5 13.6 1.5z"
        />
        <path
          className="prefix__st0 on lt"
          d="M65.7 17.2c-4 2-13.6 30.5 3.5 27.3S79 26.7 79.3 15.7c-4.3-.9-9.6-.5-13.6 1.5z"
          fillOpacity={b.LEFT_SHOULDER_BOTTOM?.value || 0}
        />
        <path
          className="prefix__st0 on rt"
          d="M234.3 17.2c4 2 13.6 30.5-3.5 27.3s-9.8-17.8-10.1-28.8c4.3-.9 9.6-.5 13.6 1.5z"
          fillOpacity={b.RIGHT_SHOULDER_BOTTOM?.value || 0}
        />
        <text
          className="controllerIndex"
          x="150"
          y="218"
          fontSize="36"
          fontWeight="700"
          textAnchor="middle"
        >
          {props.showIndex ? (parseInt(props.c.index) + 1) : null}
        </text>
      </svg>
    </div>
  );
}
