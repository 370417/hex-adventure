/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, document */

var game = {
    width: 40,
    height: 25,
    tileWidth: 16,
    tileHeight: 16,
    mode: {},
    key: {
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
    }
};

// init game canvas
game.canvas = document.getElementById('canvas');
game.canvas.width = game.width * game.tileWidth;
game.canvas.height = game.height * game.tileHeight;
game.ctx = game.canvas.getContext('2d');
