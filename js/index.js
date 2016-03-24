import createGame from "./game";
import createDisplay from "./display";
// import aStar from "a-star";

const display = createDisplay({
	root: document.getElementById("game"),
});

let game = createGame({
	display: display,
});
