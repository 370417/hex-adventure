/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console */

game.mode.start = {
    init: function() {
        'use strict';
        document.getElementById('shadow').innerHTML = 'Press [space] to begin';
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
                game.mode.play.init({
                    openness: undefined
                });
            } catch (err) {
                console.log(err);
            }
        }
    }
};

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
rlt.loadImg('res/tileset.png', function() {
    'use strict';
    game.spritesheet = this;
    game.tiles.cache(game.spritesheet, game.tileWidth, game.tileHeight);
    game.mode.start.init();
}, 104, 104);
