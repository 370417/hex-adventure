import { Game } from './game'

/** @file Handles entity creation */

export function createEntity(game: Game) {
    return game.nextEntity++
}
