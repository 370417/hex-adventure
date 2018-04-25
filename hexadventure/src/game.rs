use fov::fov;
use grid::{Direction, Grid, Pos, DIRECTIONS};
use level::Architect;
use level::tile::{Tile, TileView};
use player::Player;
use rand::{thread_rng, Rng};

#[derive(Serialize, Deserialize)]
pub struct Game {
    architect: Architect,
    pub level: Grid<Tile>,
    pub player: Player,
    pub level_memory: Grid<TileView>,
}

impl Game {
    pub fn new(width: usize, height: usize) -> Self {
        let seed = thread_rng().gen();
        println!("SEED: {}", seed);
        let mut architect = Architect::new(seed, width, height);
        let level = architect.generate();
        let player_pos = place_player(&level);
        let level_memory = Grid::new(width, height, |_pos| TileView::None);
        let mut game = Game {
            architect,
            level,
            player: Player::new(player_pos),
            level_memory,
        };
        game.next_turn();
        game
    }

    // fn execute(action: &Action) {}

    // fn move_mob(&mut self, mob: &mut Mob, direction: Direction) {

    // }

    pub fn move_player(&mut self, direction: Direction) {
        let target_pos = self.player.pos + direction;
        if self.level[target_pos].passable() {
            self.player.pos = target_pos;
            self.player.facing = direction;
            self.next_turn();
        } else if self.level[target_pos] == Tile::Exit {
            self.level = self.architect.generate();
            if self.level[self.player.pos].passable() {
                self.player.facing = direction.rotate(3);
            } else {
                for &direction in DIRECTIONS.iter() {
                    if self.level[target_pos + direction].passable() {
                        self.player.pos = target_pos + direction;
                        self.player.facing = direction;
                        break;
                    }
                }
            }
            for tile_view in self.level_memory.iter_mut() {
                *tile_view = TileView::None;
            }
            self.next_turn();
        }
    }

    fn next_turn(&mut self) {
        let level = &self.level;
        let memory = &mut self.level_memory;
        for tile_view in memory.iter_mut() {
            if let TileView::Seen(tile) = *tile_view {
                *tile_view = TileView::Remembered(tile);
            }
        }
        fov(
            self.player.pos,
            |pos| level[pos].transparent(),
            |pos| memory[pos] = TileView::Seen(level[pos]),
        );
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
