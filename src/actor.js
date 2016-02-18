/* jshint undef: true, shadow: true, strict: true */
/* globals rlt, game, document, console */

game.actorMixins = {
    act: function() {
        'use strict';
        if (this.dead) {
            game.schedule.advance()();
            return;
        }
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
        } else if (game.map[this.x + dx][this.y + dy].actor) {
            var opponent = game.map[this.x + dx][this.y + dy].actor;
            opponent.gainHp(-1);
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
    gainHp: function(hp) {
        'use strict';
        this.hp += hp;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        if (this.hp < 0) {
            this.hp = 0;
        }
        if (this.name === 'player') {
            console.log('yo!');
            document.getElementById('hp-val').innerHTML = this.hp;
            document.getElementById('hp-progress').style.width = 100 - 100 * this.hp / this.maxHp + '%';
        }
        if (this.hp === 0) {
            this.die();
        }
    },
    die: function() {
        'use strict';
        this.dead = true;
        game.map[this.x][this.y].actor = undefined;
        game.player.gainXp(60);
    },
    gainXp: function(xp) {
        'use strict';
        this.xp += xp;
        if (this.xp > this.maxXp) {
            this.xp = this.maxXp;
            document.getElementById('level').style.color = 'gold';
            document.getElementById('level').style.borderColor = 'gold';
        }
        if (this.xp < 0) {
            this.xp = 0;
        }
        document.getElementById('xp-progress').style.width = 100 - 100 * this.xp / this.maxXp + '%';
        document.getElementById('xp-val').innerHTML = this.xp;
    },
    levelUp: function() {
        'use strict';
        this.level++;
        document.getElementById('level').innerHTML = this.level;
        document.getElementById('level').style.color = '';
        document.getElementById('level').style.borderColor = '';
        this.maxXp = 100 * Math.log(this.level + Math.E - 1);
        this.gainXp(-this.maxXp);
        document.getElementById('xp-max').innerHTML = Math.round(this.maxXp);
        this.maxHp += 10;
        this.gainHp(this.maxHp);
        document.getElementById('hp-max').innerHTML = this.maxHp;
    },
    see: function() {
        'use strict';
        for (var x = 0; x < game.width; x++) {
            for (var y = 0; y < game.height; y++) {
                game.map[x][y].visible = false;
            }
        }
        rlt.shadowcast(game.player.x, game.player.y, function(x, y) {
            return !(game.map[x][y].actor && game.map[x][y].actor.name === 'giant') && game.transparent(x, y);
        }, function(x, y) {
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
        if (game.map[this.x][this.y].visible) {
            this.state = 'playerSeen';
            this.act();
            return;
        }
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
    },
    braveWandering: function() {
        'use strict';
        if (game.map[this.x][this.y].visible) {
            this.state = 'playerSeen';
            this.act();
            return;
        }
        var goal = this.goal;
        if (goal.x === this.x && goal.y === this.y) {
            this.state = 'waiting';
            this.act();
            return;
        }
        var tile = rlt.astar(this.x, this.y, function(x, y) {
            // cost
            if (game.passable(x, y)) {
                return 1.01 - game.map[x][y].light;
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
    },
    fleeing: function() {
        'use strict';
        if (!game.map[this.x][this.y].visible) {
            this.goal = game.getRandTile(game.passable, function() { return 1; });
            this.state = 'wandering';
            this.act();
            return;
        }
        var path = rlt.astar(this.x, this.y, function(x, y) {
            // cost
            return game.passable(x, y) ? 1 : -1;
        }, function(x, y) {
            // heuristic
            return game.map[x][y].visible ? 0.01 : 0;
        }, rlt.dir8);
        if (path.x) {
            while (path.parent && path.parent.parent) {
                path = path.parent;
            }
            this.move(path.x - this.x, path.y - this.y);
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
    act: game.actorMixins.playerAct,
    gainHp: game.actorMixins.gainHp,
    die: game.actorMixins.die,
    gainXp: game.actorMixins.gainXp,
    levelUp: game.actorMixins.levelUp
};

game.Actors3 = {
    vanilla: {
        name: 'vanilla',
        state: 'waiting',
        act: game.actorMixins.act,
        move: game.actorMixins.move,
        canMove: game.actorMixins.canMove,
        gainHp: game.actorMixins.gainHp,
        die: game.actorMixins.die,
        states: {
            sleeping: game.actorMixins.sleeping,
            waiting: game.actorMixins.waiting,
            wandering: game.actorMixins.sneakyWandering,
            playerSeen: game.actorMixins.fleeing
        }
    },
    giant: {
        name: 'giant',
        state: 'waiting',
        act: game.actorMixins.act,
        move: game.actorMixins.move,
        canMove: game.actorMixins.canMove,
        gainHp: game.actorMixins.gainHp,
        die: game.actorMixins.die,
        states: {
            sleeping: game.actorMixins.sleeping,
            waiting: game.actorMixins.waiting,
            wandering: game.actorMixins.braveWandering,
            playerSeen: game.actorMixins.fleeing
        }
    },
    // large, bright snakes colored in burnished red, black and gold
    // young ones pose less of a threat, but they are indistinguishable from the smaller fallow snakes that are highly venemous.
    jacksnake: {
        name: 'jacksnake',
        state: 'waiting',
        act: game.actorMixins.act,
        move: game.actorMixins.move,
        canMove: game.actorMixins.canMove,
        gainHp: game.actorMixins.gainHp,
        die: game.actorMixins.die,
        states: {
            sleeping: game.actorMixins.sleeping,
            waiting: game.actorMixins.waiting,
            wandering: game.actorMixins.sneakyWandering,
            playerSeen: game.actorMixins.fleeing
        }
    }
};
