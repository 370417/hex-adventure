use fov::fov;
use grid::{self, Direction, Grid, Pos};
use level::tile::{FullTileView, Terrain, Tile, TileView};
use level::Architect;
use mob::{self, Mob};
use rand::{thread_rng, Rng};
use store::{Id, Store};

#[derive(Serialize, Deserialize)]
pub struct Game {
    level: Grid<Tile>,
    architect: Architect,
    player: Id<Mob>,
    level_memory: Grid<TileView>,
    mobs: Store<Mob>,
    animated: Vec<()>,
}

impl Game {
    // returns # of ticks until player's turn
    pub fn tick(&mut self) -> u32 {
        for mob in self.mobs.keys() {
            let action = Action::Rest;
            self.execute(action, mob);
        }
        0
    }

    pub fn play(&mut self, action: Action) {
        let player = self.player;
        // FIXME: NLL (self.execute(action, self.player))
        let mut action = ActionResult::Alt(action);
        while let ActionResult::Alt(alt) = action {
            action = self.execute(alt, player);
        }
        self.next_turn();
        self.tick();
    }

    pub fn new() -> Self {
        let seed = thread_rng().gen();
        println!("SEED: {}", seed);
        let mut architect = Architect::new(seed);
        let level = architect.generate();
        let mut mobs = Store::new();
        let mut level = mobs.import_level(level);
        let player_pos = place_player(&level);
        let player = Mob {
            pos: player_pos,
            facing: Direction::East,
            kind: mob::Type::Hero,
        };
        let player_id = mobs.insert(player);
        level[player_pos].mob_id = Some(player_id);
        let level_memory = Grid::new(|_pos| TileView::None);
        let mut game = Game {
            architect,
            level,
            player: player_id,
            level_memory,
            mobs,
            animated: Vec::new(),
        };
        game.next_turn();
        game
    }

    // pub fn positions(&self) -> impl Iterator<Item = Pos> {
    //     self.level.positions()
    // }

    pub fn tile(&self, pos: Pos) -> FullTileView {
        match self.level_memory[pos] {
            TileView::Seen => FullTileView::Seen {
                terrain: self.level[pos].terrain,
                mob: match self.level[pos].mob_id {
                    Some(mob_id) => self.mobs.get(mob_id),
                    None => None,
                },
            },
            TileView::Remembered(terrain) => FullTileView::Remembered(terrain),
            TileView::None => FullTileView::None,
        }
    }

    // fn execute(action: &Action) {}

    // fn move_mob(&mut self, mob: &mut Mob, direction: Direction) {

    // }

    fn depopulate(&mut self) {
        let mob_ids: Vec<_> = self.mobs.keys();
        for mob_id in mob_ids {
            self.mobs.remove(mob_id);
        }
    }

    // pub fn move_player(&mut self, direction: Direction) {
    //     {
    //         let player_pos = self.mobs[self.player].pos;
    //         self.level[player_pos].mob_id = None;
    //         let target_pos = player_pos + direction;
    //         let target_terrain = self.level[player_pos + direction].terrain;
    //         if target_terrain.passable() {
    //             self.mobs.move_by(self.player, direction);
    //         } else if target_terrain == Terrain::Exit {
    //             self.depopulate();
    //             self.level = self.mobs.import_level(self.architect.generate());
    //             self.mobs.move_by(self.player, direction);
    //             for i in 3..9 {
    //                 let pos = target_pos + direction.rotate(i);
    //                 if self.level[pos].terrain.passable() {
    //                     self.mobs.move_by(self.player, direction.rotate(i));
    //                     break;
    //                 }
    //             }
    //             for tile_view in self.level_memory.iter_mut() {
    //                 *tile_view = TileView::None;
    //             }
    //         } else {
    //             self.level[player_pos].mob_id = Some(self.player);
    //             return;
    //         }
    //         self.level[self.mobs[self.player].pos].mob_id = Some(self.player);
    //     }
    //     self.next_turn();
    // }

    fn next_turn(&mut self) {
        let level = &self.level;
        let memory = &mut self.level_memory;
        for pos in grid::positions() {
            if memory[pos] == TileView::Seen {
                memory[pos] = TileView::Remembered(level[pos].terrain);
            }
        }
        let player = &mut self.mobs[self.player];
        fov(
            player.pos,
            |pos| level[pos].terrain.transparent(),
            |pos| memory[pos] = TileView::Seen,
        );
    }
}

fn place_player(level: &Grid<Tile>) -> Pos {
    let center = grid::center();
    grid::positions()
        .filter(|&pos| level[pos].terrain.passable())
        .min_by_key(|&pos| pos.distance(center))
        .unwrap()
}

pub enum Action {
    Walk(Direction),
    MeleeAttack(Direction), // LastHit { dmg, direction }
    Rest,
}

enum ActionResult {
    Ok,
    Err,
    Alt(Action),
}

impl Game {
    fn execute(&mut self, action: Action, actor: Id<Mob>) -> ActionResult {
        let mob_pos = self.mobs[actor].pos;
        match action {
            Action::Walk(direction) => {
                let target_pos = mob_pos + direction;
                if self.level[target_pos].mob_id.is_some() {
                    ActionResult::Alt(Action::MeleeAttack(direction))
                } else if self.level[target_pos].terrain.passable() {
                    self.level[self.mobs[actor].pos].mob_id = None;
                    self.mobs[actor].pos += direction;
                    self.mobs[actor].facing = direction;
                    self.level[self.mobs[actor].pos].mob_id = Some(actor);
                    ActionResult::Ok
                } else {
                    ActionResult::Alt(Action::Rest)
                }
            }
            Action::MeleeAttack(direction) => {
                let target_pos = mob_pos + direction;
                if let Some(mob) = self.level[target_pos].mob_id {
                    println!("Boink!");
                    self.mobs[actor].facing = direction;
                    ActionResult::Ok
                } else {
                    ActionResult::Alt(Action::Rest)
                }
            }
            Action::Rest => ActionResult::Ok,
        }
    }
}
