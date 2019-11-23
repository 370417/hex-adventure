use prelude::*;
use std::ops::{Index, IndexMut};
use super::ai::AIState;

pub const PLAYER_ID: MobId = MobId {
    inner: InnerMobId::Player,
};

/// Represents a mob, or "moving object," i.e. the player or a monster
#[derive(Serialize, Deserialize)]
pub struct Mob {
    pub pos: Pos,
    pub facing: Direction,
    pub species: Species,
    pub guard: u32,
    pub guard_recovery: u32,
    pub health: u32,
    pub alive: bool,
    pub path: Option<Vec<Pos>>,
    pub ai_state: AIState,
}

/// The identity of a mob
///
/// Mob identites are used instead of regular rust references to maintain
/// interior mutability. Instead of using Cell or Refcell, this interior
/// mutability is achieved with a central mob owner whose mutability follows
/// regular borrow checker rules.
#[derive(Copy, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct MobId {
    inner: InnerMobId,
}

/// A vector that owns all non-player mobs
///
/// This struct wraps a vec in order to keep in private, preventing access
/// of mobs without using their id.
#[derive(Serialize, Deserialize)]
pub struct Npcs {
    npcs: Vec<Mob>,
}

#[derive(Copy, Clone, Serialize, Deserialize)]
pub enum Species {
    Hero,
    Bat,
    Rat,
}

/// Identifies a mob
#[derive(Copy, Clone, Serialize, Deserialize, Eq, PartialEq)]
enum InnerMobId {
    Player,
    Npc(usize),
}

impl Mob {
    pub fn new(pos: Pos, species: Species, ai_state: AIState) -> Self {
        Mob {
            pos,
            facing: Direction::East,
            species,
            guard: mob_guard(species),
            guard_recovery: 0,
            health: mob_health(species),
            alive: true,
            path: None,
            ai_state,
        }
    }

    pub fn can_fly(&self) -> bool {
        match self.species {
            Species::Bat => true,
            _ => false,
        }
    }
}

impl MobId {
    pub fn is_player(&self) -> bool {
        match self.inner {
            InnerMobId::Player => true,
            InnerMobId::Npc(_) => false,
        }
    }

    pub fn die(self, world: &mut World) {
        let mob_pos = world[self].pos;
        world.level[mob_pos].mob_id = None;
        world[self].alive = false;
    }

    fn new(index: usize) -> Self {
        MobId {
            inner: InnerMobId::Npc(index),
        }
    }
}

impl Npcs {
    /// Creates a new empty Npcs struct
    pub fn new() -> Self {
        Npcs { npcs: Vec::new() }
    }

    /// Inserts a new mob and returns its id
    pub fn insert(&mut self, mob: Mob) -> MobId {
        let id = MobId::new(self.npcs.len());
        self.npcs.push(mob);
        id
    }
}

/// Iterates over each npc
///
/// Since the closure needs to be able to borrow World mutably, this
/// function can't borrow MobOwner. That's why we use a while loop instead
/// of an iterator and why this function is implemented for World.
pub fn for_each_mut<F>(world: &mut World, mut f: F)
where
    F: FnMut(MobId, &mut World),
{
    let mut i = 0;
    while i < world.npcs.npcs.len() {
        let id = MobId::new(i);
        f(id, world);
        i += 1;
    }
}

pub fn for_each<F>(world: &World, mut f: F)
where
    F: FnMut(MobId),
{
    let mut i = 0;
    while i < world.npcs.npcs.len() {
        let id = MobId::new(i);
        f(id);
        i += 1;
    }
}

pub fn mob_health(species: Species) -> u32 {
    match species {
        Species::Hero => 100,
        Species::Bat => 40,
        Species::Rat => 40,
    }
}

pub fn mob_guard(species: Species) -> u32 {
    match species {
        Species::Hero => 100,
        Species::Bat => 40,
        Species::Rat => 40,
    }
}

impl Index<MobId> for World {
    type Output = Mob;

    fn index(&self, id: MobId) -> &Mob {
        match id.inner {
            InnerMobId::Player => &self.player,
            InnerMobId::Npc(index) => &self.npcs.npcs[index],
        }
    }
}

impl IndexMut<MobId> for World {
    fn index_mut(&mut self, id: MobId) -> &mut Mob {
        match id.inner {
            InnerMobId::Player => &mut self.player,
            InnerMobId::Npc(index) => &mut self.npcs.npcs[index],
        }
    }
}
