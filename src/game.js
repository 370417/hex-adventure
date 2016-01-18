/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, document */

var game = {
    width: 40,
    height: 25,
    tileWidth: 16,
    tileHeight: 16,
    mode: {},
    monsters: [],
    schedule: rlt.Schedule(),
    key: {
        '27': 'Escape',
        '32': ' ',
        '37': 'ArrowLeft',
        '38': 'ArrowUp',
        '39': 'ArrowRight',
        '40': 'ArrowDown',
        '65': 'a',
        '66': 'b',
        '67': 'c',
        '68': 'd',
        '69': 'e',
        '70': 'f',
        '71': 'g',
        '72': 'h',
        '73': 'i',
        '74': 'j',
        '75': 'k',
        '76': 'l',
        '77': 'm',
        '78': 'n',
        '79': 'o',
        '80': 'p',
        '81': 'q',
        '82': 'r',
        '83': 's',
        '84': 't',
        '85': 'u',
        '86': 'v',
        '87': 'w',
        '88': 'x',
        '89': 'y',
        '90': 'z',
        '96': '0',
        '97': '1',
        '98': '2',
        '99': '3',
        '100': '4',
        '101': '5',
        '102': '6',
        '103': '7',
        '104': '8',
        '105': '9',
        '190': '.',
        '191': '/'
    },
    directionPressed: function(mode, key, callback) {
        'use strict';
        if (key === '1') {
            callback.call(game.player, -1, 1);
        }
        else if (key === '2') {
            callback.call(game.player, 0, 1);
        }
        else if (key === '3') {
            callback.call(game.player, 1, 1);
        }
        else if (key === '4') {
            callback.call(game.player, -1, 0);
        }
        else if (key === '5') {
            callback.call(game.player, 0, 0);
        }
        else if (key === '6') {
            callback.call(game.player, 1, 0);
        }
        else if (key === '7') {
            callback.call(game.player, -1, -1);
        }
        else if (key === '8') {
            callback.call(game.player, 0, -1);
        }
        else if (key === '9') {
            callback.call(game.player, 1, -1);
        }

        else if (key === 'Up' || key === 'ArrowUp') {
            if (mode.pressed === '') {
                    mode.pressed = 'up';
            } else if (mode.pressed === 'left') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, -1, -1);
            } else if (mode.pressed === 'right') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, 1, -1);
            } else if (mode.pressed === 'down') {
                    mode.movedDiagonally = true;
            }
        }
        else if (key === 'Left' || key === 'ArrowLeft') {
            if (mode.pressed === '') {
                    mode.pressed = 'left';
            } else if (mode.pressed === 'up') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, -1, -1);
            } else if (mode.pressed === 'down') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, -1, 1);
            } else if (mode.pressed === 'right') {
                    mode.movedDiagonally = true;
            }
        }
        else if (key === 'Down' || key === 'ArrowDown') {
            if (mode.pressed === '') {
                    mode.pressed = 'down';
            } else if (mode.pressed === 'left') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, -1, 1);
            } else if (mode.pressed === 'right') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, 1, 1);
            } else if (mode.pressed === 'up') {
                    mode.movedDiagonally = true;
            }
        }
        else if (key === 'Right' || key === 'ArrowRight') {
            if (mode.pressed === '') {
                    mode.pressed = 'right';
            } else if (mode.pressed === 'up') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, 1, -1);
            } else if (mode.pressed === 'down') {
                    mode.movedDiagonally = true;
                    callback.call(game.player, 1, 1);
            } else if (mode.pressed === 'left') {
                    mode.movedDiagonally = true;
            }
        }
    },
    directionReleased: function(mode, key, callback) {
        'use strict';
        if (mode.pressed === 'up' && (key === 'Up' || key === 'ArrowUp')) {
            mode.pressed = '';
            if (!mode.movedDiagonally) {
                    callback.call(game.player, 0, -1);
            }
            mode.movedDiagonally = false;
        }
        else if (mode.pressed === 'left' && (key === 'Left' || key === 'ArrowLeft')) {
            mode.pressed = '';
            if (!mode.movedDiagonally) {
                    callback.call(game.player, -1, 0);
            }
            mode.movedDiagonally = false;
        }
        else if (mode.pressed === 'down' && (key === 'Down' || key === 'ArrowDown')) {
            mode.pressed = '';
            if (!mode.movedDiagonally) {
                    callback.call(game.player, 0, 1);
            }
            mode.movedDiagonally = false;
        }
        else if (mode.pressed === 'right' && (key === 'Right' || key === 'ArrowRight')) {
            mode.pressed = '';
            if (!mode.movedDiagonally) {
                    callback.call(game.player, 1, 0);
            }
            mode.movedDiagonally = false;
        }
    }
};

// init game canvas
game.canvas = document.getElementById('canvas');
game.canvas.width = game.width * game.tileWidth;
game.canvas.height = game.height * game.tileHeight;
game.ctx = game.canvas.getContext('2d');

// init background canvas
document.getElementById('shadow').style.width = game.width * game.tileWidth + 'px';
document.getElementById('shadow').style.height = game.height * game.tileHeight + 'px';
game.bgCanvas = document.getElementById('bg-canvas');
game.bgCanvas.width = game.width * game.tileWidth;
game.bgCanvas.height = game.height * game.tileHeight;
game.bgCtx = game.bgCanvas.getContext('2d');

// init overlay canvas
game.overlayCanvas = document.getElementById('overlay');
game.overlayCanvas.width = game.width * game.tileWidth;
game.overlayCanvas.height = game.height * game.tileHeight;
game.overlayCtx = game.overlayCanvas.getContext('2d');
