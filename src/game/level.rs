pub mod tile;

mod basic;

pub use tile::{Terrain, Tile};

use crate::prelude::*;

pub fn generate<R: Rng>(rng: &mut R) -> Grid<Terrain> {
    basic::generate(rng).map(|&terrain| match terrain {
        basic::Terrain::Floor => Terrain::Floor,
        basic::Terrain::Wall => Terrain::Wall,
    })
}
