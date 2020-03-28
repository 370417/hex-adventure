pub mod tile;

mod basic;
mod stairs;

pub use tile::{Terrain, Tile};

use crate::prelude::*;
use rand_xoshiro::{rand_core::SeedableRng, Xoshiro256StarStar};

pub struct Level {
    terrain: Grid<Terrain>,
}

/// Responsible for generating levels.
///
/// Architect owns its own rng so that other random effects don't effect future
/// level generation.
#[derive(Serialize, Deserialize)]
pub struct Architect {
    rng: Xoshiro256StarStar,
    next_level: Grid<Terrain>,
}

impl Architect {
    pub fn new(seed: u64) -> Architect {
        let mut rng = Xoshiro256StarStar::seed_from_u64(seed);
        let mut next_level = basic::generate(&mut rng);
        stairs::generate_entrance(&mut next_level, &mut rng);
        Architect { rng, next_level }
    }

    pub fn generate(&mut self) -> Grid<Terrain> {
        let new_next_level = stairs::generate_next(&mut self.next_level, &mut self.rng);
        std::mem::replace(&mut self.next_level, new_next_level)
    }
}
