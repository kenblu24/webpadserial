import { ControllerIndicator } from './FooterBarComponents'
import './BlimpGridComponents.scss'

export function BlimpButton(props) {
  return (
      <div className="BlimpButtonContainer" draggable="true" >
        <ControllerIndicator value={props.controllerId} />
        <div className="mask">
          <div className="BlimpButtonTop">
            <div className="BlimpIndex">{props.blimpIndex}</div>
            <h3> {props.mode || "Undefined"} </h3>
          </div>
          {props.sendHistory.length ? (
            <pre className="BlimpButtonBottom">
              {props.sendHistory.slice(-3)}
            </pre>) : null
          }
        </div>
      </div>
  );
}
