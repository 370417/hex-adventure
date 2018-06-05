//! Level generation.

mod basic;
mod exit;
mod lake;
mod populate;
pub mod tile;

use self::populate::populate;

use self::tile::{Terrain, Tile};
use grid::Grid;

use rand::IsaacRng;
use std::mem::replace;

/// Responsible for generating levels.
#[derive(Serialize, Deserialize)]
pub(super) struct Architect {
    rng: IsaacRng,
    next_level: Option<Grid<Terrain>>,
}

impl Architect {
    pub fn new(seed: u64) -> Self {
        Architect {
            rng: IsaacRng::new_from_u64(seed),
            next_level: None,
        }
    }

    pub fn generate(&mut self) -> Grid<Tile> {
        match self.next_level {
            Some(ref mut next_level) => {
                let mut new_next_level = exit::add_exit(next_level, &mut self.rng);
                lake::add_lakes(next_level, &mut self.rng);
                populate(replace(next_level, new_next_level))
            }
            None => {
                let mut level = basic::generate(&mut self.rng)
                    .iter()
                    .map(|&t| Terrain::from(t))
                    .collect();
                self.next_level = Some(exit::add_exit(&mut level, &mut self.rng));
                populate(level)
            }
        }
    }
}
