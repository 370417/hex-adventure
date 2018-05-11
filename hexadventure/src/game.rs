use fov::fov;
use grid::{Direction, Grid, Pos};
use level::Architect;
use level::tile::{FullTileView, Terrain, Tile, TileView};
use mob::Mob;
use rand::{thread_rng, Rng};
use store::{Id, Store};

#[derive(Serialize, Deserialize)]
pub struct Game {
    architect: Architect,
    level: Grid<Tile>,
    player_id: Id<Mob>,
    level_memory: Grid<TileView>,
    mobs: Store<Mob>,
}

impl Game {
    pub fn new(width: usize, height: usize) -> Self {
        let seed = thread_rng().gen();
        println!("SEED: {}", seed);
        let mut architect = Architect::new(seed, width, height);
        let mut level = architect.generate();
        let player_pos = place_player(&level);
        let player = Mob::Hero {
            pos: player_pos,
            facing: Direction::East,
        };
        let mut mobs = Store::new();
        let player_id = mobs.insert(player);
        level[player_pos].mob_id = Some(player_id);
        let level_memory = Grid::new(width, height, |_pos| TileView::None);
        let mut game = Game {
            architect,
            level,
            player_id,
            level_memory,
            mobs,
        };
        game.next_turn();
        game
    }

    pub fn positions(&self) -> impl Iterator<Item = Pos> {
        self.level.positions()
    }

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

    pub fn move_player(&mut self, direction: Direction) {
        {
            let player = self.mobs.get_mut(self.player_id).unwrap();
            self.level[player.pos()].mob_id = None;
            let target_pos = player.pos() + direction;
            if self.level[target_pos].terrain.passable() {
                player.move_by(direction);
            } else if self.level[target_pos].terrain == Terrain::Exit {
                self.level = self.architect.generate();
                player.move_by(direction);
                for i in 3..9 {
                    let pos = target_pos + direction.rotate(i);
                    if self.level[pos].terrain.passable() {
                        player.move_by(direction.rotate(i));
                        break;
                    }
                }
                for tile_view in self.level_memory.iter_mut() {
                    *tile_view = TileView::None;
                }
            } else {
                self.level[player.pos()].mob_id = Some(self.player_id);
                return;
            }
            self.level[player.pos()].mob_id = Some(self.player_id);
        }
        self.next_turn();
    }

    fn next_turn(&mut self) {
        let level = &self.level;
        let memory = &mut self.level_memory;
        for pos in memory.positions() {
            if memory[pos] == TileView::Seen {
                memory[pos] = TileView::Remembered(level[pos].terrain);
            }
        }
        let player = self.mobs.get_mut(self.player_id).unwrap();
        fov(
            player.pos(),
            |pos| level[pos].terrain.transparent(),
            |pos| memory[pos] = TileView::Seen,
        );
    }
}

fn place_player(level: &Grid<Tile>) -> Pos {
    let center = level.center();
    level
        .positions()
        .filter(|&pos| level[pos].terrain.passable())
        .min_by_key(|&pos| pos.distance(center))
        .unwrap()
}
