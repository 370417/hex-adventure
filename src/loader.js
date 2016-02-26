/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document */

// init loading screen
game.mode.loading = {
    init: function() {
        'use strict';
        document.getElementById('shadow').innerHTML = 'Loading...';
    },
    close: function() {}
};
game.mode.loading.init();

// load the spritesheet
rlt.loadImg('res/terminal8x8_aa_as.png', function() {
    'use strict';
    game.spritesheet = this;
    game.tiles.cache(game.spritesheet, game.tileWidth, game.tileHeight);
    game.mode.start.init();
}, 128, 128);
