use grid::{decompose, Direction, Pos, DIRECTIONS};
use minheap::MinHeap;
use std::collections::HashMap;

//  # # # # # # # # # #
// # . # 5 . # 6 . . . #
//  @ - X - - X # . . #
// # . \ \ \ \ \ # . . #
//  # # X # \ \ \ # . #
// # . 1 \ # \ \ \ # # #
//  # . . \ # # \ X 4 #
// # . . . # # # X # # #
//  # . . . . . 2 X 3 #
// # . . . . . . . \ . #
//  # # # # # # # # # #

#[derive(Eq, PartialEq)]
enum OpenNode {
    Goal(Pos),
    JumpPoint(JumpPoint),
}

#[derive(Eq, PartialEq, Clone)]
struct JumpPoint {
    pos: Pos,
    direction: Direction,
    chirality: Chirality,
}

#[derive(Eq, PartialEq, Copy, Clone)]
enum Chirality {
    Clockwise,
    Counterclockwise,
}

impl<'a, G: JPSGrid> Neighborhood for (JumpPoint, &'a G) {
    fn passable(&self, x: i32, y: i32) -> bool {
        self.1.passable(self.0.pos(x, y))
    }

    fn is_goal(&self, x: i32, y: i32) -> bool {
        self.1.is_goal(self.0.pos(x, y))
    }

    fn goal_neighbor(&self, x: i32, y: i32) -> OpenNode {
        OpenNode::Goal(self.0.pos(x, y))
    }

    fn start_neighbor(&self, x: i32, y: i32) -> OpenNode {
        OpenNode::JumpPoint(JumpPoint {
            pos: self.0.pos(x + 1, y - 1),
            direction: self.0.rotated_dir(2),
            chirality: self.0.chirality.flip(),
        })
    }
    fn end_neighbor(&self, x: i32, y: i32) -> OpenNode {
        OpenNode::JumpPoint(JumpPoint {
            pos: self.0.pos(x, y - 1),
            direction: self.0.direction,
            chirality: self.0.chirality,
        })
    }

    fn stem_neighbor(&self, x: i32) -> OpenNode {
        OpenNode::JumpPoint(JumpPoint {
            pos: self.0.pos(x - 1, 0),
            direction: self.0.rotated_dir(-1),
            chirality: self.0.chirality,
        })
    }
}

trait Neighborhood {
    fn passable(&self, x: i32, y: i32) -> bool;
    fn is_goal(&self, x: i32, y: i32) -> bool;
    fn goal_neighbor(&self, x: i32, y: i32) -> OpenNode;
    fn start_neighbor(&self, x: i32, y: i32) -> OpenNode;
    fn end_neighbor(&self, x: i32, y: i32) -> OpenNode;
    fn stem_neighbor(&self, x: i32) -> OpenNode;

    fn stem_len(&self) -> i32 {
        let mut x = 1;
        while self.passable(x, 0) && !self.is_goal(x, 0) {
            x += 1;
        }
        x
    }

    fn for_each_neighbor<F>(&self, mut callback: F) where F: FnMut(OpenNode) {
        let stem_len = self.stem_len();
        let stem_end_is_goal = self.is_goal(stem_len, 0);
        if stem_end_is_goal {
            callback(self.goal_neighbor(stem_len, 0));
        }
        self.foo(1, 0, stem_len, true, stem_end_is_goal, &mut callback);
        self.bar(stem_len, &mut callback);
    }

    fn bar<F>(&self, stem_len: i32, callback: &mut F) where F: FnMut(OpenNode) {
        let mut prev_passable = true;
        for x in 1..=stem_len {
            let curr_passable = self.passable(x, -1);
            if curr_passable && !prev_passable {
                callback(self.stem_neighbor(x));
            }
            prev_passable = curr_passable;
        }
    }

    fn foo<F>(
        &self,
        y: i32,
        mut start: i32,
        end: i32,
        prev_start_passable: bool,
        prev_end_passable: bool,
        callback: &mut F,
    ) where F: FnMut(OpenNode) {
        let mut start_passable = self.passable(start, y);
        if start_passable && !prev_start_passable {
            callback(self.start_neighbor(start, y));
        }
        let mut prev_passable = start_passable;
        for x in start + 1..=end {
            let curr_passable = self.passable(x, y);

            if self.is_goal(x, y) {
                callback(self.goal_neighbor(x, y));
                if prev_passable {
                    self.foo(y + 1, start, x, start_passable, true, callback);
                }
                return;
            }

            if curr_passable && !prev_passable {
                start = x - 1;
                start_passable = false;
            }
            if !curr_passable && prev_passable {
                self.foo(y + 1, start, x, start_passable, false, callback);
            }

            prev_passable = curr_passable;
        }
        let end_passable = prev_passable;
        if end_passable {
            if !prev_end_passable {
                callback(self.end_neighbor(end, y));
            }
            self.foo(y + 1, start, end, start_passable, true, callback);
        }
    }
}

trait JPSGrid {
    fn passable(&self, pos: Pos) -> bool;
    fn is_goal(&self, pos: Pos) -> bool;
    fn heuristic(&self, pos: Pos) -> u32;

    fn jps<'a>(&'a self, origin: Pos) -> Vec<Pos> where Self: std::marker::Sized {
        if self.is_goal(origin) {
            return vec!(origin);
        }

        let mut open = MinHeap::<OpenNode, u32>::new();
        let mut costs = HashMap::<Pos, u32>::new();
        let mut parents = HashMap::<Pos, JumpPoint>::new();

        let initial_priority = self.heuristic(origin);
        for &direction in &DIRECTIONS {
            open.push(JumpPoint {
                pos: origin,
                direction,
                chirality: Chirality::Clockwise,
            }, initial_priority);
        }

        while let Some(node) = open.pop() {
            match node {
                OpenNode::Goal(pos) => {
                    panic!();
                },
                OpenNode::JumpPoint(curr) => {
                    (curr.clone(), self).for_each_neighbor(|neighbor| {
                        let neighbor_pos = neighbor.pos();
                        let new_cost = costs[&curr.pos] + neighbor.pos().distance(curr.pos);
                        if let Some(&cost) = costs.get(&neighbor_pos) {
                            // normally we would skip a neighbor if its cost was equal to the cost found already
                            // here we don't because in this implementation of jps,
                            // multiple neighbors can be created for a single position
                            if new_cost > cost {
                                return;
                            }
                        }
                        open.push(neighbor, new_cost + self.heuristic(neighbor_pos));
                        parents.insert(neighbor_pos, curr.clone());
                        costs.insert(neighbor_pos, new_cost);
                    });
                },
            }
        }

        panic!();
    }
}

impl JumpPoint {
    fn rotated_dir(&self, n: i32) -> Direction {
        match self.chirality {
            Chirality::Clockwise => self.direction.rotate(n),
            Chirality::Counterclockwise => self.direction.rotate(-n),
        }
    }

    fn pos(&self, x: i32, y: i32) -> Pos {
        self.pos + self.direction * x + self.rotated_dir(1) * y
    }
}

impl Chirality {
    fn flip(self) -> Self {
        match self {
            Chirality::Clockwise => Chirality::Counterclockwise,
            Chirality::Counterclockwise => Chirality::Clockwise,
        }
    }
}

impl OpenNode {
    fn pos(&self) -> Pos {
        match self {
            OpenNode::Goal(pos) => *pos,
            OpenNode::JumpPoint(jump_point) => jump_point.pos,
        }
    }
}

impl From<JumpPoint> for OpenNode {
    fn from(jump_point: JumpPoint) -> Self {
        OpenNode::JumpPoint(jump_point)
    }
}

impl From<Pos> for OpenNode {
    fn from(pos: Pos) -> Self {
        OpenNode::Goal(pos)
    }
}
