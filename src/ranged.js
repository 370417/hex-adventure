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
    // draw code
    draw: function() {
        'use strict';
        var ctx = game.overlayCtx;
        ctx.clearRect(0, 0, game.width, game.height);
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(this.x, this.y, 1, 1);
        ctx.lineWidth = 0.5;
        if (game.map[this.x][this.y].visible) {
            ctx.beginPath();
            ctx.moveTo(0.5 + game.player.x, 0.5 + game.player.y);
            ctx.lineTo(0.5 +  this.x, 0.5 + this.y);
            ctx.stroke();
        }
    },
    // move reticle
    move: function(x, y) {
        'use strict';
        var mode = game.mode.ranged;
        mode.x += x;
        mode.y += y;
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
