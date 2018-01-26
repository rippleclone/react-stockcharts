"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";

import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";
import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";

import { isNotDefined } from "../utils";

class MouseCoordinateY extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	drawOnCanvas(ctx, moreProps) {
		const props = helper(this.props, moreProps);
		if (isNotDefined(props)) return null;

		drawOnCanvas(ctx, props);
	}
	renderSVG(moreProps) {
		const props = helper(this.props, moreProps);
		if (isNotDefined(props)) return null;

		return renderSVG(props);
	}
	render() {
		return <GenericChartComponent
			clip={false}
			svgDraw={this.renderSVG}
			canvasDraw={this.drawOnCanvas}
			canvasToDraw={getMouseCanvas}
			drawOn={["mousemove", "pan", "drag"]}
		/>;
	}
}

function customY(props, moreProps) {
	const { chartConfig: { yScale }, currentItem, mouseXY } = moreProps;
	const { snapY, yAccessor } = props;
	const y = snapY
		? yScale(yAccessor(currentItem))
		: mouseXY[1];

	// const { displayXAccessor } = moreProps;
	const { displayFormat } = props;
	const coordinate = snapY
		? displayFormat(yAccessor(currentItem))
		: displayFormat(yScale.invert(y));
	return { y, coordinate };
}

MouseCoordinateY.propTypes = {
	displayFormat: PropTypes.func.isRequired,
	yAxisPad: PropTypes.number,
	rectWidth: PropTypes.number,
	rectHeight: PropTypes.number,
	orient: PropTypes.oneOf(["bottom", "top", "left", "right"]),
	at: PropTypes.oneOf(["bottom", "top", "left", "right"]),
	dx: PropTypes.number,
	fill: PropTypes.string,
	opacity: PropTypes.number,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	textFill: PropTypes.string,
};

MouseCoordinateY.defaultProps = {
	yAxisPad: 0,
	rectWidth: 50,
	rectHeight: 20,
	orient: "left",
	at: "left",
	dx: 0,
	arrowWidth: 10,
	fill: "#525252",
	opacity: 1,
	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
	fontSize: 13,
	textFill: "#FFFFFF",

	// stroke: "#684F1D",
	strokeOpacity: 1,
	strokeWidth: 1,
	snapY: false,
	customY: customY
};

function helper(props, moreProps) {
	const { chartId, width } = moreProps;
	const { show, currentCharts, mouseXY } = moreProps;

	if (isNotDefined(mouseXY)) return null;

	if (currentCharts.indexOf(chartId) < 0) return null;

	const { orient, at, rectWidth, rectHeight, dx } = props;
	const { fill, opacity, fontFamily, fontSize, textFill, arrowWidth } = props;
	const { stroke, strokeOpacity, strokeWidth } = props;

	const { customY } = props;
	const {
		y,
		coordinate
	 } = customY(props, moreProps);

	const x1 = 0, x2 = width;
	const edgeAt = (at === "right")
		? width
		: 0;

	const type = "horizontal";
	const hideLine = true;

	const coordinateProps = {
		coordinate,
		show,
		type,
		orient,
		edgeAt,
		hideLine,
		fill, opacity, fontFamily, fontSize, textFill,
		stroke, strokeOpacity, strokeWidth,
		rectWidth,
		rectHeight,
		arrowWidth,
		dx,
		x1,
		x2,
		y1: y,
		y2: y,
	};
	return coordinateProps;
}

export default MouseCoordinateY;
