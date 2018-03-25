//! Generate a level of only wall and floor.

use rand::{XorShiftRng, SeedableRng};

use util::grid::Grid;

enum Tile {
    Wall, Floor
}

fn generate(width: u32, height: u32, seed: [u32; 4]) {
    let grid = Grid::new(width, height, |i, pos| Tile::Wall);
    let rand: XorShiftRng = SeedableRng::from_seed(seed);
}
