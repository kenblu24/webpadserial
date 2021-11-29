import React from 'react';
import './GamepadViz.scss';

function GamepadViz(props) {
	const aMax = 9.5;
	const la = props.c.inputs?.analogSticks?.LEFT_ANALOG_STICK?.position;
	const ra = props.c.inputs?.analogSticks?.RIGHT_ANALOG_STICK?.position;
	const b = props.c.inputs?.buttons;
	return (
		<div className="GamepadVizContainer">
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
				<circle className="prefix__st0 on du" cx={121}		cy={130.5}	r={7.5} fillOpacity={b.DPAD_UP?.value || 0} />
				<circle className="prefix__st0 on dr" cx={136}		cy={145}		r={7.5} fillOpacity={b.DPAD_RIGHT?.value || 0} />
				<circle className="prefix__st0 on dd" cx={121}		cy={160.5}	r={7.5} fillOpacity={b.DPAD_DOWN?.value || 0} />
				<circle className="prefix__st0 on dl" cx={106}		cy={145}		r={7.5} fillOpacity={b.DPAD_LEFT?.value || 0} />
				<circle className="prefix__st0 on lm" cx={125}		cy={90}			r={5}   fillOpacity={b.SELECT?.value || 0} />
				<circle className="prefix__st0 on rm" cx={180}		cy={90}			r={5}   fillOpacity={b.START?.value  || 0} />
				<circle className="prefix__st0 on 0y" cx={227.5}	cy={85}			r={7.5} fillOpacity={b.FACE_4?.value || 0} />
				<circle className="prefix__st0 on 0b" cx={242.5}	cy={100}		r={7.5} fillOpacity={b.FACE_2?.value || 0} />
				<circle className="prefix__st0 on 0a" cx={227.5}	cy={115}		r={7.5} fillOpacity={b.FACE_1?.value || 0} />
				<circle className="prefix__st0 on 0x" cx={212.5}	cy={100}		r={7.5} fillOpacity={b.FACE_3?.value || 0} />
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
					{props.showIndex ? (props.c.index + 1) : null}
				</text>
			</svg>
		</div>
	)
}

export function ControllerIndicator(props) {
	const classes = ("ControllerIndicator"
		+ (!props.active && " hide")
	);
	return(
		<div className={classes}>
			<svg
				id="prefix__ControllerIndicator"
				xmlns="http://www.w3.org/2000/svg"
				x={0}
				y={0}
				viewBox="0 0 300 240"
				xmlSpace="preserve"
				{...props}
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
					{props.index}
				</text>
			</svg>

		</div>
	);
}

export default GamepadViz;
