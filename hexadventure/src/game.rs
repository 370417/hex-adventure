use level::basic;
use level::tile::{Tile, TileMemory};
use player::Player;
use util::fov::fov;
use util::grid::{Grid, Pos};

pub struct Game {
    pub level: Grid<Tile>,
    pub player: Player,
    pub level_memory: Grid<TileMemory>,
}

impl Game {
    pub fn new(width: usize, height: usize) -> Self {
        let level = basic::generate(width, height, [1, 2, 3, 12]);
        let player_pos = place_player(&level);
        let mut level_memory = Grid::new(width, height, |_pos| TileMemory::new(Tile::Wall, 0));
        fov(
            player_pos,
            |pos| level[pos].transparent(),
            |pos| level_memory[pos] = TileMemory::new(level[pos], 1),
        );
        Game {
            level,
            player: Player::new(player_pos),
            level_memory,
        }
    }
}

fn place_player(level: &Grid<Tile>) -> Pos {
    let center = level.center();
    *level
        .positions()
        .iter()
        .filter(|&&pos| level[pos].passable())
        .min_by_key(|&pos| pos.distance(center))
        .unwrap()
}
