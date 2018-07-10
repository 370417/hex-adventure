//! Contains everything that mutates game state

use fov::fov;
use grid::{self, Direction, Grid, Pos};
use level::tile::{FullTileView, Tile, TileView};
use level::Architect;
use mob::{self, Mob};
use rand::{thread_rng, Rng};
use std::ops::{Index, IndexMut};

#[derive(Serialize, Deserialize)]
pub struct Mobs {
    pub player: Mob,
    pub npcs: Vec<Mob>,
}

impl Mobs {
    pub fn new(player: Mob, npcs: Vec<Mob>) -> Self {
        Mobs {
            player,
            npcs,
        }
    }

    pub fn insert(&mut self, npc: Mob) -> MobId {
        let id = MobId::Npc(self.npcs.len());
        self.npcs.push(npc);
        id
    }
}

impl Index<MobId> for Mobs {
    type Output = Mob;

    fn index(&self, id: MobId) -> &Mob {
        match id {
            MobId::Player => &self.player,
            MobId::Npc(index) => &self.npcs[index],
        }
    }
}

impl IndexMut<MobId> for Mobs {
    fn index_mut(&mut self, id: MobId) -> &mut Mob {
        match id {
            MobId::Player => &mut self.player,
            MobId::Npc(index) => &mut self.npcs[index],
        }
    }
}

#[derive(Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MobId {
    Player,
    Npc(usize),
}

#[derive(Serialize, Deserialize)]
pub struct Game {
    pub level: Grid<Tile>,
    architect: Architect,
    pub level_memory: Grid<TileView>,
    pub mobs: Mobs,
    animated: Vec<()>,
}

impl Game {
    // returns # of ticks until player's turn
    pub fn tick(&mut self) -> u32 {
        MobId::Player.post_act(self);
        // can't use a for loop because self.mobs might be mutated during the loop
        let mut i = 0;
        while i < self.mobs.npcs.len() {
            let mob = MobId::Npc(i);
            mob.act(self);
            mob.post_act(self);
            i += 1;
        }
        0
    }

    pub fn new() -> Self {
        let seed = thread_rng().gen();
        println!("SEED: {}", seed);
        let mut architect = Architect::new(seed);
        let (mut level, npcs) = architect.generate();
        let player_pos = place_player(&level);
        let player = Mob {
            pos: player_pos,
            facing: Direction::East,
            kind: mob::Type::Hero,
            guard: 100,
            guard_recovery: 0,
        };
        let mobs = Mobs::new(player, npcs);
        level[player_pos].mob_id = Some(MobId::Player);
        let level_memory = Grid::new(|_pos| TileView::None);
        let mut game = Game {
            architect,
            level,
            level_memory,
            mobs,
            animated: Vec::new(),
        };
        game.next_turn();
        game
    }

    pub fn tile(&self, pos: Pos) -> FullTileView {
        match self.level_memory[pos] {
            TileView::Seen => FullTileView::Seen {
                terrain: self.level[pos].terrain,
                mob: match self.level[pos].mob_id {
                    Some(mob_id) => Some(&self.mobs[mob_id]),
                    None => None,
                },
            },
            TileView::Remembered(terrain) => FullTileView::Remembered(terrain),
            TileView::None => FullTileView::None,
        }
    }

    pub fn walk(&mut self, direction: Direction) {
        if let Ok(_) = MobId::Player.walk(direction, self) {
            self.next_turn();
            self.tick();
        }
    }

    pub fn rest(&mut self) {
        if let Ok(_) = MobId::Player.rest(self) {
            self.next_turn();
            self.tick();
        }
    }

    fn next_turn(&mut self) {
        let level = &self.level;
        let memory = &mut self.level_memory;
        for pos in grid::positions() {
            if memory[pos] == TileView::Seen {
                memory[pos] = TileView::Remembered(level[pos].terrain);
            }
        }
        fov(
            self.mobs.player.pos,
            |pos| level[pos].terrain.transparent(),
            |pos| memory[pos] = TileView::Seen,
        );
    }

    pub fn descend(&mut self, direction: Direction) {
        self.mobs.player.guard = 100;
        let (level, npcs) = self.architect.generate();
        self.level = level;
        let player_pos = self.mobs.player.pos;
        let opposite: Pos = player_pos + direction * 2;
        let left: Pos = player_pos + direction.rotate(-1);
        let right: Pos = player_pos + direction.rotate(1);
        if self.level[player_pos].terrain.passable() {
            self.level[player_pos].mob_id = Some(MobId::Player);
            self.mobs.player.facing = direction.rotate(3);
        } else if self.level[opposite].terrain.passable() {
            self.level[opposite].mob_id = Some(MobId::Player);
            self.mobs.player.pos = opposite;
        } else if self.level[left].terrain.passable() {
            self.level[left].mob_id = Some(MobId::Player);
            self.mobs.player.pos = left;
            self.mobs.player.facing = direction.rotate(-2);
        } else if self.level[right].terrain.passable() {
            self.level[right].mob_id = Some(MobId::Player);
            self.mobs.player.pos = right;
            self.mobs.player.facing = direction.rotate(2);
        } else {
            panic!("Could not find spot to place player");
        }
        self.mobs.npcs = npcs;
        for pos in grid::positions() {
            self.level_memory[pos] = TileView::None;
        }
        self.next_turn();
    }
}

fn place_player(level: &Grid<Tile>) -> Pos {
    let center = grid::center();
    grid::positions()
        .filter(|&pos| level[pos].terrain.passable())
        .min_by_key(|&pos| pos.distance(center))
        .unwrap()
}
