/** @file constants related to visual style */

export const xu = 18;
export const smallyu = 16;
export const bigyu = 24;

export type SpriteName = 'wall' | 'floor' | 'shortGrass' | 'tallGrass' | 'spikes' | 'player';
export const spriteNames: SpriteName[] = ['wall', 'floor', 'shortGrass', 'tallGrass', 'spikes', 'player'];

export const color: any = {
    floor: 0xFFFFFF,
    player: 0xFFFFFF,
    shortGrass: 0x008800,
    spikes: 0xEEEEEE,
    tallGrass: 0x008800,
    wall: 0xEEEEEE,
};
