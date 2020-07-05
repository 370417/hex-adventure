//! Field of view calculation.
//!
//! A position is considered to be in field of view from an origin
//! if and only if the position is on a line with an endpoint at the
//! origin not blocked by any wall.

use crate::prelude::*;
use num_rational::Ratio;
use num_traits::identities::{One, Zero};

/// Implementing FOVGrid for a struct makes it possible to calculate FOV for
/// that struct.
pub trait FOVGrid {
    fn transparent(&self, pos: Pos) -> bool;

    fn reveal(&mut self, pos: Pos);

    fn calc_fov(&mut self, center: Pos)
    where
        Self: std::marker::Sized,
    {
        self.reveal(center);
        for &direction in &DIRECTIONS {
            Sextant {
                grid: self,
                center,
                direction,
            }
            .scan_row(1, Ratio::zero(), Ratio::one());
        }
    }
}

/// Represents one sixth of a grid, like an infinite pie slice.
///
/// To form the sextant, the direction stored in the struct is swept clockwise.
struct Sextant<'a, G> {
    grid: &'a mut G,
    center: Pos,
    direction: Direction,
}

impl<'a, G: FOVGrid> Sextant<'a, G> {
    /// Translate abstract x & y coordinates to real positions
    /// in order to determine whether the position is transparent.
    fn transparent(&self, x: u32, y: u32) -> bool {
        let dx = self.direction.rotate(2);
        let dy = self.direction;
        self.grid.transparent(self.center + dx * x + dy * y)
    }

    /// Translate abstract x & y coordinates to real positions
    /// in order to reveal the position.
    fn reveal(&mut self, x: u32, y: u32) {
        let dx = self.direction.rotate(2);
        let dy = self.direction;
        self.grid.reveal(self.center + dx * x + dy * y)
    }

    /// Scan a sextant using recursive shadowcasting.
    ///
    /// Each call scans one row, and recursion extends the scan to the entire
    /// sextant.
    /// y represents the distance between the row and the sextant origin.
    fn scan_row(&mut self, y: u32, mut start: Ratio<u32>, end: Ratio<u32>) {
        let min_x = round_tie_high(start * y);
        let max_x = round_tie_low(end * y);

        self.reveal(min_x, y);
        let mut prev_transparent = self.transparent(min_x, y);

        for x in min_x + 1..=max_x {
            self.reveal(x, y);
            let curr_transparent = self.transparent(x, y);

            if !prev_transparent && curr_transparent {
                start = slope(x, y);
            }
            if prev_transparent && !curr_transparent {
                self.scan_row(y + 1, start, slope(x, y));
            }

            prev_transparent = curr_transparent;
        }

        if prev_transparent {
            self.scan_row(y + 1, start, end);
        }
    }
}

/// Returns the slope of the ray flush with the left side of (x, y).
/// Here left means the side of (x, y) on the x-axis with the smaller x-value.
///
/// When (x, y) corresponds to a wall, the result represents the largest possible end slope.
/// When it corresponds to a floor, the result represents the smallest possible start slope.
fn slope(x: u32, y: u32) -> Ratio<u32> {
    Ratio::new_raw(2 * x - 1, 2 * y)
}

/// Rounds a ratio. Ties are rounded up.
fn round_tie_high(x: Ratio<u32>) -> u32 {
    x.round().to_integer()
}

/// Rounds a ratio. Ties are rounded down.
fn round_tie_low(x: Ratio<u32>) -> u32 {
    (x - Ratio::new_raw(1, 2)).ceil().to_integer()
}
