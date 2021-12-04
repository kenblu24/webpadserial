import { ControllerIndicator } from './FooterBarComponents'
import './BlimpGridComponents.scss'

export function BlimpButton(props) {
  return (
      <div className="BlimpButton" draggable="true" >
        <div className="BlimpIndex">{props.blimpIndex}</div>
        <h3> {props.mode || "Undefined"} </h3>
        <ControllerIndicator value={props.controllerId} />
      </div>
  );
}
