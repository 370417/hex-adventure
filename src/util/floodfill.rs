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

pub trait FloodContainer {
    fn floodable(&self, pos: Pos) -> bool;
    fn flood(&mut self, pos: Pos);
}

struct FloodableGrid<'a, F> {
    flooded: &'a mut Grid<bool>,
    floodable_closure: F,
}

impl <'a, F: Fn(Pos) -> bool> FloodContainer for FloodableGrid<'a, F> {
    fn floodable(&self, pos: Pos) -> bool {
        self.flooded.contains(pos) && !self.flooded[pos] && (self.floodable_closure)(pos)
    }

    fn flood(&mut self, pos: Pos) {
        self.flooded[pos] = true
    }
}

pub fn flood<F, T>(origin: Pos, grid: &Grid<T>, floodable: &F) -> Grid<bool>
        where F: Fn(Pos) -> bool {
    let mut flooded = Grid::new(grid.width, grid.height, |_pos| false);
    {
        let mut container = FloodableGrid {
            flooded: &mut flooded,
            floodable_closure: floodable,
        };
        flood_scanline(origin, &mut container);
    }
    flooded
}

pub fn flood_scanline<FC: FloodContainer>(origin: Pos, container: &mut FC) {
    if !container.floodable(origin) {
        return;
    }
    container.flood(origin);
    let east_edge = flood_horiz(origin, Direction::East, container);
    let west_edge = flood_horiz(origin, Direction::West, container);
    let segment = Segment {
        start: east_edge,
        end: west_edge,
    };
    flood_vert(segment, FloodDirection::North, container);
    flood_vert(segment, FloodDirection::South, container);
}

/// Flood to the east or west of origin, excluding origin.
/// 
/// Returns the outermost flooded position.
fn flood_horiz<FC: FloodContainer>(origin: Pos, direction: Direction, container: &mut FC) -> Pos {
    let mut pos = origin + direction;
    while container.floodable(pos) {
        container.flood(pos);
        pos += direction;
    }
    pos - direction
}

fn flood_vert<FC: FloodContainer>(origin: Segment, direction: FloodDirection, container: &mut FC) {
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
    let subsegments = flood_segment(segment, container);
    if let Some(first) = subsegments.first() {
        if first.start == segment.start {
            let east_edge = flood_horiz(segment.start, Direction::East, container);
            let overhang = Segment {
                start: east_edge,
                end: segment.start + Direction::East,
            };
            flood_vert(overhang, direction.opposite(), container);
        }
    }
    if let Some(last) = subsegments.last() {
        if last.end == segment.end {
            let west_edge = flood_horiz(segment.end, Direction::West, container);
            let overhang = Segment {
                start: segment.end + Direction::West,
                end: west_edge,
            };
            flood_vert(overhang, direction.opposite(), container);
        }
    }
    for subsegment in subsegments {
        flood_vert(subsegment, direction, container);
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
fn flood_segment<FC: FloodContainer>(segment: Segment, container: &mut FC) -> Vec<Segment> {
    let mut start = None;
    let mut segments = Vec::new();
    for pos in segment {
        if container.floodable(pos) {
            container.flood(pos);
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
            end: segment.end,
        });
    }
    segments
}
