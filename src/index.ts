import * as Game from './engine/game';
import * as Display from './ui/display';

/** @file entry point */

Display.create(Game.get(), document.body);
