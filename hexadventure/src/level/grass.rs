use super::basic::calc_shuffled_positions;
use super::tile::Terrain;
use fov::FOVGrid;
use grid::{Grid, Pos};
use rand::Rng;

pub(super) fn _add_grass<R: Rng>(level: &mut Grid<Terrain>, rng: &mut R) {
    let positions = calc_shuffled_positions(rng);
    for &pos in &positions {
        if level[pos] == Terrain::Floor {
            let fov_size = _calc_fov_size(level, pos);
            if fov_size > 60 {
                level[pos] = Terrain::ShortGrass;
            }
        }
    }
}

fn _calc_fov_size(level: &Grid<Terrain>, pos: Pos) -> u32 {
    let mut fov_grid = (0, level);
    fov_grid.calc_fov(pos);
    fov_grid.0
}

impl FOVGrid for (u32, &Grid<Terrain>) {
    fn transparent(&self, pos: Pos) -> bool {
        match self.1[pos] {
            Terrain::Floor | Terrain::ShortGrass | Terrain::TallGrass => true,
            _ => false,
        }
    }

    fn reveal(&mut self, _pos: Pos) {
        self.0 += 1;
    }
}
