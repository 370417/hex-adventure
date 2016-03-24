import createLevel from "./level";

export default ({seed = 0, display, width = 40, height = 30}) => {
	display.setDimensions(width, height, 8, 2);
	let level = createLevel({
		width: width,
		height: height,
	});

	display.load("tileset.png", display.draw.bind(display, level));
};