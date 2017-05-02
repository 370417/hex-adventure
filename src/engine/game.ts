import { TileName } from '../data/tile'
import { WIDTH, HEIGHT } from '../data/constants'

import { xy2pos } from './position'
import { Behavior } from './behavior'
import * as Level from './level'

import * as Alea from '../lib/alea'

/** @file handles game creation, saving, and loading */

interface Entity  {
    position: number
    behavior: Behavior
    velocity: number
}

interface Tile {
    tiles: TileName,
    mobs: number,
    grassDelay: number,
}

interface GameState {
    version: string
    seed: number
    schedule: number[]
    components: {
        [Component in keyof Entity]: {[entity: number]: Entity[Component]}
    }
    nextEntity: number
    player: number
    fov: {[pos: number]: boolean}
    memory: {[pos: number]: TileName}
    level: {
        [Prop in keyof Tile]: {[pos: number]: Tile[Prop]}
    }
    alea: Alea.RandState
}

const VERSION = '0.1.3'
const SAVE_NAME = 'hex adventure'

export class Game {
    private state: GameState

    constructor() {
        this.state = load() || create(Date.now())
        if (this.state.version !== VERSION) {
            console.warn('Save game is out of date');
        }
        console.log('Seed:', this.state.seed)
    }

    getPlayer(): number {
        return this.state.player
    }

    getPosition(entity: number): number {
        return this.state.components.position[entity]
    }

    setPosition(entity: number, position: number) {
        this.state.components.position[entity] = position
    }

    offsetPosition(entity: number, delta: number) {
        this.state.components.position[entity] += delta
    }

    getVelocity(entity: number): number {
        return this.state.components.velocity[entity]
    }

    setVelocity(entity: number, velocity: number) {
        this.state.components.velocity[entity] = velocity
    }

    getBehavior(entity: number): Behavior {
        return this.state.components.behavior[entity]
    }

    setBehavior(entity: number, behavior: Behavior) {
        this.state.components.behavior[entity] = behavior
    }

    getTile(position: number) {
        return this.state.level.tiles[position]
    }

    setTile(position: number, tile: TileName) {
        this.state.level.tiles[position] = tile
    }

    getGrassDelay(position: number): number {
        return this.state.level.grassDelay[position]
    }

    setGrassDelay(position: number, delay: number) {
        this.state.level.grassDelay[position] = delay
    }

    getMob(position: number): number {
        return this.state.level.mobs[position]
    }

    getMobType(entity: number): Behavior {
        return this.state.components.behavior[entity]
    }

    removeMob(position: number) {
        this.state.level.mobs[position] = undefined
    }

    setMob(position: number, entity: number) {
        this.state.level.mobs[position] = entity
    }

    getFov(position: number): boolean {
        return this.state.fov[position]
    }

    clearFov() {
        for (let strPos in this.state.fov) {
            const pos = Number(strPos)
            this.setMemory(pos, this.state.level.tiles[pos])
        }
        this.state.fov = {}
    }

    addFov(position: number) {
        this.state.fov[position] = true
    }

    getMemory(position: number): TileName {
        return this.state.memory[position]
    }

    setMemory(position: number, tile: TileName) {
        this.state.memory[position] = tile
    }

    createEntity(): number {
        return this.state.nextEntity++
    }

    /** add a new entity in the schedule before the current actor */
    schedule(entity: number) {
        this.state.schedule.unshift(entity)
    }

    /** end current actor's turn and setup its next turn */
    reschedule() {
        const entity = this.state.schedule.shift()
        this.state.schedule.push(entity)
    }

    /** end current actor's turn and remove it from the schedule */
    unschedule() {
        this.state.schedule.shift()
    }

    getCurrentEntity() {
        return this.state.schedule[0]
    }

    save() {
        localStorage[SAVE_NAME] = JSON.stringify(this.state)
    }

    random() {
        return Alea.random(this.state.alea)
    }
}

/** create a new game */
function create(seed: number): GameState {
    const center = xy2pos(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2))
    const level = Level.create(seed, center)
    return {
        version: VERSION,
        seed,
        schedule: [1, 2],
        components: {
            position: {
                '1': level.playerPos,
            },
            behavior: {
                '1': 'player',
                '2': 'environment',
            },
            velocity: {},
        },
        nextEntity: 3,
        player: 1,
        fov: {},
        memory: {},
        level: {
            tiles: level.tiles,
            mobs: {
                [level.playerPos]: 1,
            },
            grassDelay: {},
        },
        alea: Alea.seed(seed),
    }
}

/** load the saved game if it exists */
function load(): GameState {
    const saveFile = localStorage[SAVE_NAME]
    return saveFile && JSON.parse(saveFile)
}
