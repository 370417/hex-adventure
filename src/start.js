/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console */

game.mode.start = {
    init: function() {
        'use strict';
        game.ctx.fillStyle = '#000000';
        game.ctx.fillRect(0, 0, game.width * game.tileWidth, game.height * game.tileHeight);
        game.ctx.fillStyle = '#eeeeee';
        game.ctx.font = '16px/2 monospace';
        game.ctx.fillText('Press [space] to begin', 0, 32);
        document.body.addEventListener('keydown', game.mode.start.keydown, false);
    },
    close: function() {
        'use strict';
        document.body.removeEventListener('keydown', game.mode.start.keydown, false);
    },
    keydown: function(e) {
        'use strict';
        var key = game.key[e.keyCode] || e.key;
        if (key === ' ') {
            game.mode.start.close();
            try {
                game.mode.play.init();
            } catch (err) {
                console.log(err);
            }
        }
    }
};
