use self::mob::{Mob, Npcs, Species::Hero, PLAYER_ID};
use fov::calc_fov;
use level::tile::{Tile, TileView};
use level::Architect;
use prelude::*;
use rand::{thread_rng, Rng};

pub mod action;
pub mod mob;

#[derive(Serialize, Deserialize)]
pub struct World {
    pub level: Grid<Tile>,
    pub fov: Grid<TileView>,
    player: Mob,
    npcs: Npcs,
    architect: Architect,
}

fn place_player(level: &mut Grid<Tile>) -> Pos {
    for r in 0.. {
        for pos in grid::center().ring(r) {
            if level[pos].terrain.passable() {
                level[pos].mob_id = Some(PLAYER_ID);
                return pos;
            }
        }
    }
    unreachable!()
}

impl World {
    pub fn new() -> Self {
        let seed = thread_rng().gen();
        let mut architect = Architect::new(seed);
        let (mut level, npcs) = architect.generate();
        let player_pos = place_player(&mut level);
        let mut world = World {
            level,
            player: Mob::new(player_pos, Hero),
            npcs,
            fov: Grid::new(|_| TileView::None),
            architect,
        };
        world.update_fov();
        world
    }

    fn update_fov(&mut self) {
        let level = &self.level;
        let fov = &mut self.fov;
        for pos in grid::positions() {
            if fov[pos] == TileView::Seen {
                fov[pos] = TileView::Remembered(self.level[pos].terrain);
            }
        }
        calc_fov(
            self.player.pos,
            |pos| level[pos].terrain.transparent(),
            |pos| fov[pos] = TileView::Seen,
        );
    }
}
