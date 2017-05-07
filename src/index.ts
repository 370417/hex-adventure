import * as Display from './ui/display'
import * as Game from './engine/game'

/** @file entry point */

Display.create(Game.get(), document.body)
