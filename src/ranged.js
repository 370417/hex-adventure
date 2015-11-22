/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console, window */

game.mode.ranged = {
    open: function() {
        'use strict';
        game.mode.ranged.x = game.player.x;
        game.mode.ranged.y = game.player.y;
        game.mode.ranged.pathx = [];
        game.mode.ranged.pathy = [];
        window.addEventListener('keydown', game.mode.ranged.keydown, false);
        window.addEventListener('keyup', game.mode.ranged.keyup, false);
        game.mode.ranged.draw();
    },
    close: function() {
        'use strict';
        game.overlayCtx.clearRect(0, 0, game.tileWidth * game.width, game.tileHeight * game.height);
        window.removeEventListener('keydown', game.mode.ranged.keydown, false);
        window.removeEventListener('keyup', game.mode.ranged.keyup, false);
    },
    // coordinates of targeting reticle
    x: 0,
    y: 0,
    // list of coordinates of projectile path
    pathx: [],
    pathy: [],
    // draw code
    draw: function() {
        'use strict';
        var ctx = game.overlayCtx;
        var mode = game.mode.ranged;
        ctx.clearRect(0, 0, game.tileWidth * game.width, game.tileHeight * game.height);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillRect(game.tileWidth * mode.x, game.tileHeight * mode.y, game.tileWidth, game.tileHeight);
        for (var i = 0; i < mode.pathx.length; i++) {
            var x = mode.pathx[i];
            var y = mode.pathy[i];
            if (game.visible(x, y)) {
                ctx.fillRect(game.tileWidth * x, game.tileHeight * y, game.tileWidth, game.tileHeight);
            }
        }
    },
    // move reticle
    move: function(x, y) {
        'use strict';
        var mode = game.mode.ranged;
        mode.x += x;
        mode.y += y;
        mode.pathx = [];
        mode.pathy = [];
        rlt.linecast(game.player.x, game.player.y, mode.x, mode.y, game.passable, function(x, y) {
            mode.pathx.push(x);
            mode.pathy.push(y);
        });
        mode.draw();
    },
    // input
    pressed: '',
    movedDiagonally: false,
    keydown: function(e) {
        'use strict';
        var key = game.key[e.keyCode] || e.key;
        game.directionPressed(game.mode.ranged, key, game.mode.ranged.move);
        // exit
        if (key === 'Escape') {
            game.mode.ranged.close();
            game.mode.play.open();
        }
    },
    keyup: function(e) {
        'use strict';
        var key = game.key[e.keyCode] || e.key;
        game.directionReleased(game.mode.ranged, key, game.mode.ranged.move);
    }
};
