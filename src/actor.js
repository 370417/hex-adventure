/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console */

game.actorMixins = {
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
    playerAct: function() {
        'use strict';
        this.see();
        game.mode.play.draw(game.map);
    },
    move: function(dx, dy) {
        'use strict';
        if (this.canMove(dx, dy)) {
            game.map[this.x][this.y].actor = null;
            this.x += dx;
            this.y += dy;
            game.map[this.x][this.y].actor = this;
            //this.recolor(game.map[this.x][this.y].light);
        }
        game.schedule.add(this.act.bind(this), 100);
        game.schedule.advance()();
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
    see: function() {
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
    },
    recolor: function(light) {
        'use strict';
        this.tile.color = rlt.arr2rgb([
            Math.round(150 + 100 * light),
            Math.round(150 + 100 * light),
            Math.round(150 + 100 * light)
        ]);
    },
    sleeping: function() {
        'use strict';
        game.schedule.add(this.act.bind(this), 100);
        game.schedule.advance()();
    },
    waiting: function() {
        'use strict';
        if (Math.random() < 1/3) {
            this.goal = game.getRandTile(game.passable, function() { return 1; });
            this.state = 'wandering';
        }
        game.schedule.add(this.act.bind(this), 100);
        game.schedule.advance()();
    },
    sneakyWandering: function() {
        'use strict';
        var goal = this.goal;
        if (goal.x === this.x && goal.y === this.y) {
            this.state = 'waiting';
            this.act();
            return;
        }
        var tile = rlt.astar(this.x, this.y, function(x, y) {
            // cost
            if (game.passable(x, y)) {
                return 0.01 + game.map[x][y].light;
            } else {
                return -1;
            }
        }, function(x, y) {
            // heuristic
            return Math.max(Math.abs(x - goal.x), Math.abs(y - goal.y));
        }, rlt.dir8);
        if (tile.x) {
            while (tile.parent && tile.parent.parent) {
                tile = tile.parent;
            }
            this.move(tile.x - this.x, tile.y - this.y);
        } else {
            console.log('destination unreachable');
            this.state = 'waiting';
            this.act();
            return;
        }
    }
};

game.Player = {
    move: game.actorMixins.move,
    canMove: game.actorMixins.canMove,
    recolor: game.actorMixins.recolor,
    see: game.actorMixins.see,
    act: game.actorMixins.playerAct
};

game.Actors3 = {};
game.Actors3.vanilla = {
    act: game.actorMixins.act,
    move: game.actorMixins.move,
    canMove: game.actorMixins.canMove,
    states: {
        sleeping: game.actorMixins.sleeping,
        waiting: game.actorMixins.waiting,
        wandering: game.actorMixins.sneakyWandering
    },
    state: 'waiting'
};
