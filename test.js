/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, document, console */

try {

// namespace
var game = {};

game.Tiles = {
    wall: {
        transparent: false,
        passable: false,
        cost: 10,
        name: 'wall',
        char: '#'

    }
};

var d = rlt.Display();
document.body.appendChild(d.canvas);
console.log('!');

} catch (e) {
    console.log(e);
}
