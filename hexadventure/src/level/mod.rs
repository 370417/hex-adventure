//! Level generation.

pub mod basic;
pub mod exit;
pub mod tile;

use self::tile::Tile;
use grid::Grid;

use rand::IsaacRng;
use std::mem::replace;

#[derive(Serialize, Deserialize)]
pub struct Architect {
    rng: IsaacRng,
    next_level: Option<Grid<Tile>>,
    width: usize,
    height: usize,
}

impl Architect {
    pub fn new(seed: u64, width: usize, height: usize) -> Self {
        Architect {
            rng: IsaacRng::new_from_u64(seed),
            next_level: None,
            width,
            height,
        }
    }

    pub fn generate(&mut self) -> Grid<Tile> {
        match self.next_level {
            Some(ref mut next_level) => {
                let new_next_level = exit::add_exit(next_level, &mut self.rng);
                replace(next_level, new_next_level)
            }
            None => {
                let mut level = basic::generate(self.width, self.height, &mut self.rng);
                self.next_level = Some(exit::add_exit(&mut level, &mut self.rng));
                level
            }
        }
    }
}
