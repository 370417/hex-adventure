//! Store the sprite sheet inside the web assembly binary, and allow the js to
//! view it in canvas's rgba format through `expose_sprites()`.

use image::{load_from_memory_with_format, ImageFormat};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawImage {
    pub width: u32,
    pub height: u32,
    pub rgba: *const u8,
    pub size: usize,
    // We carry an owned vec of rgba data around so that it doesn't get dropped
    // before the rgba pointer is used.
    _rgba_owned: Vec<u8>,
}

pub fn expose_sprites() -> RawImage {
    let sprites = include_bytes!("sprites.png");
    let dynamic_image = load_from_memory_with_format(sprites, ImageFormat::Png)
        .expect("Failed to load sprites from png.")
        .into_rgba();
    let dimensions = dynamic_image.dimensions();
    let rgba = dynamic_image.into_raw();
    let len = rgba.len();
    RawImage {
        width: dimensions.0,
        height: dimensions.1,
        rgba: rgba.as_ptr(),
        size: len,
        _rgba_owned: rgba,
    }
}
