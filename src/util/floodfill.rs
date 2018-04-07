use util::grid::{Grid, Pos, Direction};
use std::iter::{Iterator, IntoIterator};

pub fn flood2<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Grid<bool>
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| false);
    flood_helper(origin, &floodable, &mut flooded);
    flooded
}

// pub fn flood_with_size<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> (u32, Grid<bool>)
//         where F: Fn(Pos) -> bool {
//     let mut flooded = Grid::new(grid.width, grid.height, |_pos| false);
//     let size = flood_with_size_helper(origin, &floodable, &mut flooded);
//     (size, flooded)
// }

pub fn flood_with_size<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> (u32, Grid<bool>)
        where F: Fn(Pos) -> bool {
    let flooded = flood(origin, grid, floodable);
    let mut size = 0;
    for &item in flooded.iter() {
        if item {
            size += 1;
        }
    }
    (size, flooded)
}

pub fn flood_all<F, T>(grid: &Grid<T>, equiv: &F) -> (u32, Grid<u32>)
        where F: Fn(Pos, Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| 0u32);
    let mut count = 0;
    for pos in grid.positions() {
        if flooded[pos] == 0 {
            count += 1;
            flooded[pos] = count;
            flood_all_helper(pos, equiv, &mut flooded, count);
        }
    }
    (count, flooded)
}

fn flood_helper<F>(pos: Pos, floodable: &F, flooded: &mut Grid<bool>)
        where F: Fn(Pos) -> bool {
    if flooded.contains(pos) && !flooded[pos] && floodable(pos) {
        flooded[pos] = true;
        for neighbor in pos.neighbors() {
            flood_helper(neighbor, floodable, flooded);
        }
    }
}

fn flood_with_size_helper<F>(pos: Pos, floodable: &F, flooded: &mut Grid<bool>) -> u32
        where F: Fn(Pos) -> bool {
    let mut size = 0u32;
    if flooded.contains(pos) && !flooded[pos] && floodable(pos) {
        flooded[pos] = true;
        size += 1;
        for neighbor in pos.neighbors() {
            size += flood_with_size_helper(neighbor, floodable, flooded);
        }
    }
    size
}

fn flood_all_helper<F>(pos: Pos, equiv: &F, flooded: &mut Grid<u32>, count: u32)
        where F: Fn(Pos, Pos) -> bool {
    for neighbor in pos.neighbors() {
        if flooded.contains(neighbor) && flooded[neighbor] == 0 && equiv(pos, neighbor) {
            flooded[neighbor] = count;
            flood_all_helper(neighbor, equiv, flooded, count);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::{Rng, thread_rng};

    #[test]
    fn test_flood_all_is_complete() {
        let mut rng = thread_rng();
        let mut grid = Grid::new(40, 40, |_pos| false);
        for b in grid.iter_mut() {
            *b = rng.gen();
        }
        let (count, flooded) = flood_all(&grid, &|a, b| a == b);
        for id in flooded {
            assert!(id > 0);
            assert!(id <= count);
        }
    }

    #[test]
    fn test_flood_all() {
        let grid = Grid::new(40, 40, |_pos| false);
        let (count, flooded) = flood_all(&grid, &|_a, _b| true);
        assert_eq!(count, 1);
        assert!(flooded.into_iter().all(|id| id == 1));
    }
}

trait FloodContainer {
    fn floodable(&self, pos: Pos) -> bool;
    fn flood(&mut self, pos: Pos);
}

struct FloodableGrid<F> {
    flooded: Grid<bool>,
    floodable: F,
}

impl <F: Fn(Pos) -> bool> FloodContainer for FloodableGrid<F> {
    fn floodable(&self, pos: Pos) -> bool {
        self.flooded.contains(pos) && !self.flooded[pos] && self.floodable(pos)
    }

    fn flood(&mut self, pos: Pos) {
        self[pos] = true
    }
}

pub fn flood<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Grid<bool>
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| false);
    flood_scanline(origin, &|pos| {
        flooded.contains(pos) && !flooded[pos] && floodable(pos)
    }, &mut |pos| {
        flooded[pos] = true;
    });
    flooded
}

pub fn flood_scanline<F, G>(origin: Pos, floodable: &F, flood: &mut G)
        where F: Fn(Pos) -> bool, G: FnMut(Pos) -> () {
    if !floodable(origin) {
        return;
    }
    flood(origin);
    let east_edge = flood_horiz(origin, Direction::East, floodable, flood);
    let west_edge = flood_horiz(origin, Direction::West, floodable, flood);
    let segment = Segment {
        start: east_edge,
        end: west_edge,
    };
    flood_vert(segment, FloodDirection::North, floodable, flood);
    flood_vert(segment, FloodDirection::South, floodable, flood);
}

/// Flood to the east or west of origin, excluding origin.
/// 
/// Returns the outermost flooded position.
fn flood_horiz<F, G>(origin: Pos, direction: Direction, floodable: &F, flood: &mut G) -> Pos
        where F: Fn(Pos) -> bool, G: FnMut(Pos) -> () {
    let mut pos = origin + direction;
    while floodable(pos) {
        flood(pos);
        pos += direction;
    }
    pos - direction
}

fn flood_vert<F, G>(origin: Segment, direction: FloodDirection, floodable: &F, flood: &mut G)
        where F: Fn(Pos) -> bool, G: FnMut(Pos) -> () {
    let segment = match direction {
        FloodDirection::North => Segment {
            start: origin.start + Direction::Northeast,
            end: origin.end + Direction::Northwest,
        },
        FloodDirection::South => Segment {
            start: origin.start + Direction::Southeast,
            end: origin.end + Direction::Southwest,
        },
    };
    let subsegments = flood_segment(segment, floodable, flood);
    if let Some(first) = subsegments.first() {
        if first.start == segment.start {
            let east_edge = flood_horiz(segment.start, Direction::East, floodable, flood);
            let overhang = Segment {
                start: east_edge,
                end: segment.start + Direction::East,
            };
            flood_vert(overhang, direction.opposite(), floodable, flood);
        }
    }
    if let Some(last) = subsegments.last() {
        if last.end == segment.end {
            let west_edge = flood_horiz(segment.end, Direction::West, floodable, flood);
            let overhang = Segment {
                start: segment.end + Direction::West,
                end: west_edge,
            };
            flood_vert(overhang, direction.opposite(), floodable, flood);
        }
    }
    for subsegment in subsegments {
        flood_vert(subsegment, direction, floodable, flood);
    }
}

#[derive(Copy, Clone)]
enum FloodDirection {
    North, South
}

impl FloodDirection {
    fn opposite(&self) -> Self {
        match *self {
            FloodDirection::North => FloodDirection::South,
            FloodDirection::South => FloodDirection::North,
        }
    }
}

/// A horizontal segment of positions from start to end inclusive.
#[derive(Copy, Clone)]
struct Segment {
    start: Pos,
    end: Pos,
}

struct SegmentIterator {
    pos: Pos,
    stop: Pos,
}

impl IntoIterator for Segment {
    type Item = Pos;
    type IntoIter = SegmentIterator;

    fn into_iter(self) -> Self::IntoIter {
        SegmentIterator {
            pos: self.start,
            stop: self.end + Direction::West,
        }
    }
}

impl Iterator for SegmentIterator {
    type Item = Pos;

    fn next(&mut self) -> Option<Self::Item> {
        if self.pos == self.stop {
            None
        } else {
            let old_pos = self.pos;
            self.pos += Direction::West;
            Some(old_pos)
        }
    }
}

/// Flood from east_edge to west_edge inclusive
fn flood_segment<F, G>(segment: Segment, floodable: &F, flood: &mut G) -> Vec<Segment>
        where F: Fn(Pos) -> bool, G: FnMut(Pos) -> () {
    let mut start = None;
    let mut segments = Vec::new();
    let end_pos = segment.end;
    for pos in segment {
        if floodable(pos) {
            flood(pos);
            if start.is_none() {
                start = Some(pos);
            }
        } else {
            if let Some(start_pos) = start {
                segments.push(Segment {
                    start: start_pos,
                    end: pos,
                });
                start = None;
            }
        }
    }
    if let Some(start_pos) = start {
        segments.push(Segment {
            start: start_pos,
            end: end_pos,
        });
    }
    segments
}
