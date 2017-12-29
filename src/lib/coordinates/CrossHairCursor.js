"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import GenericComponent, { getMouseCanvas } from "../GenericComponent";

import { hexToRGBA, isDefined, isNotDefined, strokeDashTypes, getStrokeDasharray } from "../utils";

class CrossHairCursor extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	drawOnCanvas(ctx, moreProps) {
        const { dotRadius, dotFill, dotStroke, dotStrokeWidth } = this.props
		const lines = helper(this.props, moreProps);
		if (isDefined(lines)) {

			const { margin, ratio } = this.context;
			const originX = 0.5 * ratio + margin.left;
			const originY = 0.5 * ratio + margin.top;

			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(ratio, ratio);

			ctx.translate(originX, originY);
  
			lines.forEach(line => {
				const dashArray = getStrokeDasharray(line.strokeDasharray).split(",").map(d => +d);

                ctx.lineWidth = line.strokeWidth;
				ctx.strokeStyle = hexToRGBA(line.stroke, line.opacity);
				ctx.setLineDash(dashArray);
				ctx.beginPath();
				ctx.moveTo(line.x1, line.y1);
				ctx.lineTo(line.x2, line.y2);
				ctx.stroke();
			});

            ctx.beginPath();
            ctx.arc(lines[1].x1, lines[0].y1, dotRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle =  hexToRGBA(dotFill, 1);
            ctx.fill();
            ctx.lineWidth = dotStrokeWidth;
            ctx.strokeStyle = hexToRGBA(dotStroke, 1);
            ctx.stroke();          
			ctx.restore();
		}
	}
	renderSVG(moreProps) {
		const { className } = this.props;
		const lines = helper(this.props, moreProps);

		if (isNotDefined(lines)) return null;

		return (
			<g className={`react-stockcharts-crosshair ${className}`}>
				{lines.map(({ strokeDasharray, ...rest }, idx) =>
					<line
						key={idx}
						strokeDasharray={getStrokeDasharray(strokeDasharray)}
						{...rest} />)}
			</g>
		);
	}
	render() {
		return <GenericComponent
			svgDraw={this.renderSVG}
			clip={false}
			canvasDraw={this.drawOnCanvas}
			canvasToDraw={getMouseCanvas}
			drawOn={["mousemove", "pan", "drag"]}
		/>;
	}
}

CrossHairCursor.propTypes = {
	className: PropTypes.string,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),
    yAccessor: PropTypes.func
};

CrossHairCursor.contextTypes = {
	margin: PropTypes.object.isRequired,
	ratio: PropTypes.number.isRequired,
	// xScale for getting update event upon pan end, this is needed to get past the PureComponent shouldComponentUpdate
	// xScale: PropTypes.func.isRequired,
};

function customX(props, moreProps) {
	const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
	const { snapX } = props;
	const x = snapX
		? Math.round(xScale(xAccessor(currentItem)))
		: mouseXY[0];
	return x;
}

function customY(props, moreProps) {
	const { chartConfig: { yScale }, currentItem, mouseXY } = moreProps;
	const { snapY, yAccessor } = props;
	const y = snapY
		? Math.round(yScale(yAccessor(currentItem)))
		: mouseXY[1];
	return y;
}


CrossHairCursor.defaultProps = {
	strokeX: "#666666",
    strokeY: "#666666",
    strokeWidthX: 1,
    strokeWidthY: 1,
    dotFill: "#666666",
    dotRadius: 0.0,
    dotStroke: "#666666",
    dotStrokeWidth: 0.0,
	opacity: 0.3,
	strokeDasharray: "ShortDash",
	snapX: true,
    snapY: false,
	customX,
    customY
};

function helper(props, moreProps) {
	const {
		mouseXY, currentItem, show, height, width
	} = moreProps;

	const { customX, customY, strokeX, strokeY, strokeWidthX, strokeWidthY, 
        opacity, strokeDasharray } = props;

	if (!show || isNotDefined(currentItem)) return null;

	const x = customX(props, moreProps);
    const y = customY(props, moreProps);

	const line1 = {
		x1: 0,
		x2: width,
		y1: y,
		y2: y,
		stroke: strokeY, 
        strokeWidth: strokeWidthY,
        strokeDasharray, opacity,
	};

	const line2 = {
		x1: x,
		x2: x,
		y1: 0,
		y2: height,
		stroke: strokeX, 
        strokeWidth: strokeWidthX,
        strokeDasharray, opacity,
	};
	return [line1, line2];
}

export default CrossHairCursor;
