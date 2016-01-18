/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console */

game.Actor = {
    move: function(dx, dy) {
        'use strict';
        if (this.canMove(dx, dy)) {
            game.map[this.x][this.y].actor = null;
            this.x += dx;
            this.y += dy;
            game.map[this.x][this.y].actor = this;
            this.recolor(game.map[this.x][this.y].light);
            if (this.name === 'player') {
                this.see();
                game.mode.play.draw(game.map);
            }
        }
    },
    canMove: function(dx, dy) {
        'use strict';
        var newx = this.x + dx;
        var newy = this.y + dy;
        if (game.passable(newx, newy)) {
            return true;
        } else {
            return false;
        }
    },
    recolor: function(light) {
        'use strict';
        this.tile.color = rlt.arr2rgb([
            Math.round(150 + 100 * light),
            Math.round(150 + 100 * light),
            Math.round(150 + 100 * light)
        ]);
    }
};

game.Player = Object.create(game.Actor);
game.Player.name = 'player';
game.Player.see = function() {
    'use strict';
    for (var x = 0; x < game.width; x++) {
        for (var y = 0; y < game.height; y++) {
            game.map[x][y].visible = false;
        }
    }
    rlt.shadowcast(game.player.x, game.player.y, game.transparent, function(x, y) {
        game.map[x][y].visible = true;
        game.map[x][y].seen = true;
    });
};

game.Actors2 = {
    act: function() {
        'use strict';
        var stateFunction = this.states[this.state];
        if (typeof stateFunction === 'function') {
            stateFunction.call(this);
        } else {
            console.log('Error: the state "' + this.state + '" does not correspond to a function.');
            console.log(this);
        }
    },
    move: function(dx, dy) {
        'use strict';
        var newx = this.x + dx;
        var newy = this.y + dy;
    }
};

game.Actors3 = {};
game.Actors3.vanilla = {
    act: game.Actors2.act
};
