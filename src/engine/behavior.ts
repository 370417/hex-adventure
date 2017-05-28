import { canWalk } from '../data/tile';
import { random } from '../lib/alea';
import { Game } from './game';
import { forEachPos } from './level';
import { look } from './player';
import { calcDistancePos } from './position';

/** @file specify actor behavior */

export type Behavior = 'player' | 'snake' | 'environment' | 'spike';

export const behaviors: Record<Behavior, (game: Game, self: number) => number> = {
    environment: (game, self) => {
        forEachPos((pos) => {
            if (game.level.tiles[pos] === 'shortGrass' && game.level.grassDelay[pos] !== undefined) {
                game.level.grassDelay[pos] -= 1;
                if (game.level.grassDelay[pos] === 0) {
                    game.level.grassDelay[pos] = undefined;
                    game.level.tiles[pos] = 'tallGrass';
                }
            }
        });
        reschedule(game);
        return 0;
    },
    player: (game, self) => {
        // initialize fov if uninitiazlied
        if (!game.fov[game.prop.pos[self]]) {
            look(game, self);
        }
        return Infinity;
    },
    snake: (game, self) => {
        reschedule(game);
        return 0;
    },
    spike: (game, self) => {
        const pos = game.prop.pos[self];
        if (canWalk[game.level.tiles[pos]]) {
            game.level.tiles[pos] = 'spikes';
            game.prop.pos[self] += game.prop.velocity[self];
            look(game, game.player);
        } else {
            unschedule(game);
        }
        return 6;
    },
};

/** Add a new entity in the schedule before the current actor */
export function schedule(game: Game, entity: number) {
    game.schedule.unshift(entity);
}

/** End current actor's turn and setup its next turn */
export function reschedule(game: Game) {
    const entity = game.schedule.shift();
    game.schedule.push(entity);
}

/** End current actor's turn and remove it from the schedule */
export function unschedule(game: Game) {
    game.schedule.shift();
}

export function step(game: Game) {
    const entity = game.schedule[0];
    const behavior = game.prop.behavior[entity];
    return behaviors[behavior](game, entity);
}
