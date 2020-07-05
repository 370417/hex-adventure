use crate::prelude::*;
use rand_xoshiro::{rand_core::SeedableRng, Xoshiro256StarStar};
use serde::{Deserialize, Serialize};

pub mod grid;
pub mod level;
pub mod mob;
pub mod util;

/// Contains game state
#[derive(Serialize, Deserialize)]
pub struct Game {
    pub rng: Xoshiro256StarStar,
    pub level: Grid<Terrain>,
    architect: level::Architect,
}

impl Game {
    /// Create a new game from a seed.
    pub fn new(seed: u64) -> Game {
        let mut rng = Xoshiro256StarStar::seed_from_u64(seed);
        let mut architect = level::Architect::new(rng.gen());
        let level = architect.generate();
        Game {
            rng,
            level,
            architect,
        }
    }

    /// Replace the current level with the next depth
    pub fn descend(&mut self) {
        self.level = self.architect.generate();
    }
}
