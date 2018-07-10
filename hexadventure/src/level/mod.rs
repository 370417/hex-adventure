//! Level generation.

mod basic;
mod exit;
mod grass;
mod lake;
mod populate;
pub mod tile;

use self::populate::populate;
use self::tile::{Terrain, Tile};
use prelude::*;
use rand::IsaacRng;
use std::mem::replace;
use world::mob::Npcs;

/// Responsible for generating levels.
#[derive(Serialize, Deserialize)]
pub(super) struct Architect {
    rng: IsaacRng,
    next_level: Grid<Terrain>,
}

impl Architect {
    pub fn new(seed: u64) -> Self {
        let mut rng = IsaacRng::new_from_u64(seed);
        let next_level = basic::generate(&mut rng)
            .iter()
            .map(|&t| Terrain::from(t))
            .collect();
        Architect { rng, next_level }
    }

    pub fn generate(&mut self) -> (Grid<Tile>, Npcs) {
        let new_next_level = exit::add_exit(&mut self.next_level, &mut self.rng);
        lake::add_lakes(&mut self.next_level, &mut self.rng);
        // grass::add_grass(next_level, &mut self.rng);
        populate(replace(&mut self.next_level, new_next_level), &mut self.rng)
    }
}
