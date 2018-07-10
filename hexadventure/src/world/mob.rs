use prelude::*;
use std::ops::{Index, IndexMut};

pub const PLAYER_ID: MobId = MobId {
    inner: InnerMobId::Player,
};

/// Represents a mob, or "moving object," i.e. the player or a monster
#[derive(Serialize, Deserialize)]
pub struct Mob {
    pub pos: Pos,
    pub facing: Direction,
    pub species: Species,
}

/// The identity of a mob
/// 
/// Mob identites are used instead of regular rust references to maintain
/// interior mutability. Instead of using Cell or Refcell, this interior
/// mutability is achieved with a central mob owner whose mutability follows
/// regular borrow checker rules.
#[derive(Copy, Clone, Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize)]
pub enum Species {
    Hero,
}

/// Identifies a mob
#[derive(Copy, Clone, Serialize, Deserialize)]
enum InnerMobId {
    Player,
    Npc(usize),
}

impl Mob {
    pub fn new(pos: Pos, species: Species) -> Self {
        Mob {
            pos,
            facing: Direction::East,
            species,
        }
    }
}

impl MobId {
    fn new(index: usize) -> Self {
        MobId {
            inner: InnerMobId::Npc(index),
        }
    }
}

impl Npcs {
    /// Creates a new empty Npcs struct
    pub fn new() -> Self {
        Npcs {
            npcs: Vec::new(),
        }
    }

    /// Inserts a new mob and returns its id
    pub fn insert(&mut self, mob: Mob) -> MobId {
        let id = MobId::new(self.npcs.len());
        self.npcs.push(mob);
        id
    }
}

impl World {
    /// Iterates over each npc
    /// 
    /// Since the closure needs to be able to borrow World mutably, this
    /// function can't borrow MobOwner. That's why we use a while loop instead
    /// of an iterator and why this function is implemented for World.
    pub fn for_each_npc<F>(&mut self, mut f: F)
    where
        F: FnMut(MobId, &mut World),
    {
        let mut i = 0;
        while i < self.npcs.npcs.len() {
            let id = MobId::new(i);
            f(id, self);
            i += 1;
        }
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
