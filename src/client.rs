// The most efficient way to communicate between web assembly and javascript
// is probably exposing an in-memory array. That means either limiting our
// Rust types to javascript's level or copying our data into a js-compatible
// format. Instead, we can use a function call for each piece of data to make
// representing the data simpler at the cost of some overhead.

use crate::game::{grid, Game};
use ron::{de::from_str, ser::to_string};
use wasm_bindgen::prelude::*;

mod sprites;

/// A user-facing interface over game state. It should tightly mirror the GUI.
#[wasm_bindgen]
pub struct Client {
    game: Game,
}

#[wasm_bindgen]
impl Client {
    /// Create a new game client from a seed.
    pub fn new(seed: u64) -> Client {
        Client {
            game: Game::new(seed),
        }
    }

    /// Load a game client from a RON string.
    pub fn load(state: &str) -> Option<Client> {
        match from_str(state) {
            Ok(game) => Some(Client { game }),
            Err(_) => None,
        }
    }

    /// Serialize game state into a string using RON.
    /// Returns an empty string if serialization fails.
    pub fn save(&self) -> Option<String> {
        to_string(&self.game).ok()
    }

    pub fn restart(&mut self, seed: u64) {
        self.game = Game::new(seed);
    }

    pub fn descend(&mut self) {
        self.game.descend();
    }

    pub fn expose_sprites() -> sprites::RawImage {
        sprites::expose_sprites()
    }

    pub fn level_width() -> usize {
        grid::WIDTH
    }

    pub fn level_height() -> usize {
        grid::HEIGHT
    }

    pub fn location(row: usize, col: usize) -> Location {
        use grid::{index_to_pos, pos_to_location, Index2d};
        let location = pos_to_location(index_to_pos(Index2d { row, col }));
        Location {
            x: location.x * Client::col_width() as i32,
            y: location.y * Client::row_height() as i32,
        }
    }

    pub fn texture_location(&self, row: usize, col: usize) -> Location {
        use grid::{index_to_pos, Index2d};
        let pos = index_to_pos(Index2d { row, col });
        self.game.level[pos].to_location()
    }

    pub fn color(&self, row: usize, col: usize) -> String {
        use grid::{index_to_pos, Index2d};
        let pos = index_to_pos(Index2d { row, col });
        self.game.level[pos].to_color()
    }

    pub fn level_pixel_width() -> u32 {
        use grid::{index_to_pos, pos_to_location, Index2d, HEIGHT, WIDTH};
        // This pos is out of bounds, but it won't cause errors unless
        // we use it to access a grid. Just doing math on it here is fine.
        let location = pos_to_location(index_to_pos(Index2d {
            row: HEIGHT + 1,
            col: WIDTH,
        }));
        location.x as u32 * Client::col_width()
    }

    pub fn level_pixel_height() -> u32 {
        use grid::{index_to_pos, pos_to_location, Index2d, HEIGHT, WIDTH};
        // This pos is out of bounds, but it won't cause errors unless
        // we use it to access a grid. Just doing math on it here is fine.
        let location = pos_to_location(index_to_pos(Index2d {
            row: HEIGHT + 1,
            col: WIDTH,
        }));
        location.y as u32 * Client::row_height()
    }

    pub fn sprite_width() -> u32 {
        18
    }

    pub fn sprite_height() -> u32 {
        24
    }

    /// Rectangular sprites overlap to form a hexagonal grid. Row height
    /// describes the non-overlapping height of each sprite.
    pub fn row_height() -> u32 {
        16
    }

    /// Rectangular sprites overlap to form a hexagonal grid. Column width
    /// describes the non-overlapping width of each sprite.
    pub fn col_width() -> u32 {
        Client::sprite_width() / 2
    }
}

#[wasm_bindgen]
pub struct Location {
    pub x: i32,
    pub y: i32,
}
