use fov::fov;
use grid::{Direction, Grid, Pos, DIRECTIONS};
use level::Architect;
use level::tile::{Tile, TileMemory};
use player::Player;
use rand::{thread_rng, Rng};

#[derive(Serialize, Deserialize)]
pub struct Game {
    pub turn: u32,
    pub first_turn: u32,
    architect: Architect,
    pub level: Grid<Tile>,
    pub player: Player,
    pub level_memory: Grid<TileMemory>,
}

impl Game {
    pub fn new(width: usize, height: usize) -> Self {
        let seed = thread_rng().gen();
        println!("SEED: {}", seed);
        let mut architect = Architect::new(seed, width, height);
        let level = architect.generate();
        let player_pos = place_player(&level);
        let level_memory = Grid::new(width, height, |_pos| TileMemory::new(Tile::Wall, 0));
        let mut game = Game {
            turn: 0,
            first_turn: 1,
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
            self.first_turn = self.turn;
            self.turn += 1;
            self.next_turn();
        }
    }

    fn next_turn(&mut self) {
        self.turn += 1;
        let level = &self.level;
        let memory = &mut self.level_memory;
        let turn = self.turn;
        fov(
            self.player.pos,
            |pos| level[pos].transparent(),
            |pos| memory[pos] = TileMemory::new(level[pos], turn),
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
