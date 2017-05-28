import { HEIGHT, WIDTH } from '../data/constants';
import { transparency } from '../data/tile';
import { reschedule, schedule } from './behavior';
import { createEntity } from './entity';
import { shadowcast } from './fov';
import { Game } from './game';
import { walk } from './mob';
import { xy2pos } from './position';

/** @file manipulates the player character */

/** move the player */
export function move(game: Game, player: number, direction: number) {
    walk(game, player, direction);
    look(game, player);
    reschedule(game);
}

export function look(game: Game, self: number) {
    game.fov = {};
    shadowcast(
        game.prop.pos[self],
        (pos) => transparency[game.level.tiles[pos]] > 0,
        (pos) => game.memory[pos] = game.level.tiles[pos],
    );
    shadowcast(
        game.prop.pos[self],
        (pos) => transparency[game.level.tiles[pos]] === 2,
        (pos) => game.fov[pos] = true,
    );
}

export function magic(game: Game, player: number) {
    reschedule(game);
    const spike = createEntity(game);
    schedule(game, spike);
    game.prop.pos[spike] = game.prop.pos[player] + 1;
    game.prop.velocity[spike] = 1;
    game.prop.behavior[spike] = 'spike';
}
