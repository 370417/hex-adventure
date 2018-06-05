use astar::jps;
use fov::fov;
use grid::{self, Direction, Grid, Pos};
use level::tile::{FullTileView, Terrain, Tile, TileView};
use level::Architect;
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
    pub fn foo(&mut self) {
        let player = self.mobs.get(self.player_id).unwrap();
        // let node = JumpPoint {
        //     pos: player.pos(),
        //     direction: player.facing(),
        // };
        // for pos in self.level.inner_positions() {
        //     if self.level[pos].terrain == Terrain::ShortGrass {
        //         self.level[pos].terrain = Terrain::Floor;
        //     }
        // }
        // for node in node.neighbors(&|_| false, &|pos| self.level[pos].terrain == Terrain::Floor) {
        //     self.level[node.pos].terrain = Terrain::ShortGrass;
        // }
        let exit_pos: Pos = grid::inner_positions()
            .find(|&pos| self.level[pos].terrain == Terrain::Exit)
            .unwrap();
        let path = jps(
            player.pos(),
            |pos| pos == exit_pos,
            |pos| self.level[pos].terrain != Terrain::Wall,
            |pos| pos.distance(exit_pos),
        );
        for pos in grid::inner_positions() {
            if self.level[pos].terrain == Terrain::ShortGrass {
                self.level[pos].terrain = Terrain::Floor;
            }
        }
        if let Some(path) = path {
            for pos in path {
                if self.level[pos].terrain == Terrain::Floor {
                    self.level[pos].terrain = Terrain::ShortGrass;
                }
            }
        }
    }

    pub fn new() -> Self {
        let seed = thread_rng().gen();
        println!("SEED: {}", seed);
        let mut architect = Architect::new(seed);
        let mut level = architect.generate();
        let player_pos = place_player(&level);
        let player = Mob::Hero {
            pos: player_pos,
            facing: Direction::East,
        };
        let mut mobs = Store::new();
        let player_id = mobs.insert(player);
        level[player_pos].mob_id = Some(player_id);
        let level_memory = Grid::new(|_pos| TileView::None);
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
        for pos in grid::positions() {
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
    let center = grid::center();
    grid::positions()
        .filter(|&pos| level[pos].terrain.passable())
        .min_by_key(|&pos| pos.distance(center))
        .unwrap()
}
