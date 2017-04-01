import { Game } from './game'

/** @file handles entity creation */
export const create = function(game: Game) {
    return game.nextEntity++
}
