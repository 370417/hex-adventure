use self::mob::{Mob, Npcs};
use prelude::*;
use level::tile::{Tile, TileView};

pub mod mob;

#[derive(Serialize, Deserialize)]
pub struct World {
    pub level: Grid<Tile>,
    pub fov: Grid<TileView>,
    player: Mob,
    npcs: Npcs,
    architect: (),
}

impl World {
    pub fn new() -> Self {
        World {
            level: panic!(),
            player: panic!(),
            npcs: panic!(),
            fov: panic!(),
            architect: (),
        }
    }
}
