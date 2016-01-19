/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document */

// init loading screen
game.mode.loading = {
    init: function() {
        'use strict';
        game.ctx.fillStyle = '#888';
        game.ctx.fillRect(0, 0, game.width * game.tileWidth, game.height * game.tileHeight);
        game.ctx.fillStyle = '#eeeeee';
        game.ctx.font = '16px/2 monospace';
        game.ctx.fillText('Loading...', 0, 32);
    },
    close: function() {}
};
game.mode.loading.init();

// load the spritesheet
rlt.loadImg('res/terminal8x8_aa_as.png', function() {
    'use strict';
    game.spritesheet = this;
    game.tiles.cache(game.spritesheet, 8, 8, 2);
    game.mode.start.init();
}, 128, 128);
