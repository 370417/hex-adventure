import { dir1, dir11, dir3, dir5, dir7, dir9 } from '../data/constants';
import { magic, move } from '../engine/player';
import { Display, loop, skip } from './display';

/** @file handles input */

const movement: {[code: string]: number} = {
    KeyA: dir9,
    KeyD: dir3,
    KeyE: dir1,
    KeyW: dir11,
    KeyX: dir5,
    KeyZ: dir7,
    Numpad1: dir7,
    Numpad3: dir5,
    Numpad4: dir9,
    Numpad6: dir3,
    Numpad7: dir11,
    Numpad9: dir1,
};

export function keydown(display: Display, e: KeyboardEvent) {
    skip(display);
    const direction = movement[e.code];
    if (direction) {
        move(display.game, display.game.player, direction);
        loop(display);
    }
    if (e.code === 'Digit1') {
        magic(display.game, display.game.player);
        loop(display);
    }
}
