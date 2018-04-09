export type Grid<T> = Array<{[x: number]: T}>;

export interface Game {
    version: string;
    seed: number;
    player: Player;
    schedule: number[];
    mobs: {[id: number]: Mob};
    nextMobId: number;
}

export interface Player {
    fov: Grid<boolean>
    memory: Grid<Cell> 
}

export interface Mob {
    x: number;
    y: number;
}
