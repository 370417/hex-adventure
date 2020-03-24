use super::Pos;
use std::iter::{IntoIterator, Iterator};

/// A segment of positions from start to end inclusive.
pub struct Line {
    pub start: Pos,
    pub end: Pos,
}

pub struct LineIterator {
    start: Pos,
    end: Pos,
    length: u32,
    progress: u32,
}

impl IntoIterator for Line {
    type Item = Pos;
    type IntoIter = LineIterator;

    fn into_iter(self) -> Self::IntoIter {
        LineIterator {
            start: self.start,
            end: self.end,
            length: (self.end - self.start).distance(),
            progress: 0,
        }
    }
}

impl Iterator for LineIterator {
    type Item = Pos;

    fn next(&mut self) -> Option<Self::Item> {
        if self.progress > self.length {
            None
        } else {
            let pos = self.start + ((self.end - self.start) * self.progress / self.length).round();
            self.progress += 1;
            Some(pos)
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        let size = self.length - self.progress;
        (size as usize, Some(size as usize))
    }
}
