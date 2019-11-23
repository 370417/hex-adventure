use self::mob::{Mob, Npcs, Species::Hero, PLAYER_ID};
use fov::calc_fov;
use level::place_mob;
use level::tile::{Tile, TileView};
use level::Architect;
use prelude::*;
use rand::{thread_rng, Rng};
use self::ai::AIState;

pub mod action;
pub mod ai;
pub mod mob;
mod schedule;

#[derive(Serialize, Deserialize)]
pub struct World {
    pub level: Grid<Tile>,
    pub fov: Grid<TileView>,
    pub player: Mob,
    npcs: Npcs,
    architect: Architect,
}

pub enum Action {}

pub enum Result {}

impl World {
    pub fn new() -> Self {
        let seed = thread_rng().gen();
        let mut architect = Architect::new(seed);
        let (mut level, npcs) = architect.generate();
        let player_pos = place_mob(&mut level, grid::center(), PLAYER_ID, &mut thread_rng());
        let mut world = World {
            level,
            player: Mob::new(player_pos, Hero, AIState::Player),
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
            if fov[pos].is_visible() {
                fov[pos] = TileView::Remembered(self.level[pos].terrain);
            }
        }
        calc_fov(
            self.player.pos,
            |pos| level[pos].terrain.transparent(),
            |pos| fov[pos] = TileView::Visible,
        );
    }
}
