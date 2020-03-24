use rand_xoshiro::{rand_core::SeedableRng, Xoshiro256StarStar};
use serde::{Deserialize, Serialize};

pub mod grid;
pub mod level;
pub mod util;

/// Contains game state
#[derive(Serialize, Deserialize)]
pub struct Game {
    pub rng: Xoshiro256StarStar,
}

impl Game {
    /// Create a new game from a seed.
    pub fn new(seed: u64) -> Game {
        Game {
            rng: Xoshiro256StarStar::seed_from_u64(seed),
        }
    }
}
