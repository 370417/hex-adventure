use grid::{Pos, Direction, DIRECTIONS};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap, VecDeque};

pub(super) fn jps<FP, FH>(origin: Pos, goal: Pos, passable: FP, heuristic: FH) -> Option<Vec<Pos>>
where
    FP: Fn(Pos) -> bool,
    FH: Fn(Pos) -> u32,
{
    let mut open = BinaryHeap::with_capacity(6);
    let origin_heuristic = heuristic(origin);
    for &direction in DIRECTIONS.iter() {
        open.push(MinHeapItem {
            node: JumpPoint {
                pos: origin,
                direction,
                chirality: Chirality::Clockwise,
            },
            priority: origin_heuristic,
        });
    }
    let mut closed: HashMap<Pos, Parent> = HashMap::with_capacity(6);
    closed.insert(origin, Parent {
        node: None,
        total_cost: 0,
        stem_cost: 0,
        leaf_cost: 0,
    });
    while let Some(MinHeapItem { node, .. }) = open.pop() {
        if node.pos == goal {
            return Some(construct_path(closed, goal));
        }
        for neighbor in node.neighbors(goal, &passable) {
            let new_cost = closed.get(&node.pos).unwrap().total_cost + neighbor.stem_cost + neighbor.leaf_cost;
            if let Some(parent) = closed.get(&neighbor.node.pos) {
                if new_cost >= parent.total_cost {
                    continue;
                }
            }
            open.push(MinHeapItem {
                node: neighbor.node,
                priority: new_cost + heuristic(neighbor.node.pos),
            });
            closed.insert(neighbor.node.pos, Parent {
                node: Some(node),
                total_cost: new_cost,
                stem_cost: neighbor.stem_cost,
                leaf_cost: neighbor.leaf_cost,
            });
        }
    }
    None
}

fn construct_path(parents: HashMap<Pos, Parent>, goal: Pos) -> Vec<Pos> {
    let mut path = VecDeque::with_capacity(parents.get(&goal).unwrap().total_cost as usize);
    path.push_back(goal);
    let mut pos = goal;
    while let Some(&Parent {
        node: Some(jump_point),
        stem_cost,
        leaf_cost,
        ..
    }) = parents.get(&pos) {
        let leaf_direction = rotate(jump_point.direction, 1, jump_point.chirality);
        for y in 0..stem_cost {
            path.push_back(jump_point.pos + jump_point.direction * y);
        }
        let stem_tip = jump_point.pos + jump_point.direction * stem_cost;
        for x in 0..leaf_cost {
            path.push_back(stem_tip + leaf_direction * x);
        }
        pos = jump_point.pos;
    }
    Vec::from(path)
}

#[derive(PartialEq, Eq)]
struct Parent {
    node: Option<JumpPoint>,
    total_cost: u32,
    stem_cost: u32,
    leaf_cost: u32,
}

#[derive(PartialEq, Eq)]
struct MinHeapItem {
    node: JumpPoint,
    priority: u32,
}

fn reverse(ordering: Ordering) -> Ordering {
    match ordering {
        Ordering::Equal => Ordering::Equal,
        Ordering::Greater => Ordering::Less,
        Ordering::Less => Ordering::Greater,
    }
}

impl PartialOrd for MinHeapItem {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(reverse(self.priority.cmp(&other.priority)))
    }
}

impl Ord for MinHeapItem {
    fn cmp(&self, other: &Self) -> Ordering {
        reverse(self.priority.cmp(&other.priority))
    }
}

#[derive(PartialEq, Eq, Hash, Copy, Clone)]
struct JumpPoint {
    pos: Pos,
    direction: Direction,
    chirality: Chirality,
}

struct Neighbor {
    node: JumpPoint,
    stem_cost: u32,
    leaf_cost: u32,
}

impl JumpPoint {
    fn neighbors<FP>(&self, goal: Pos, passable: &FP) -> Vec<Neighbor>
    where
        FP: Fn(Pos) -> bool,
    {
        let mut neighbors = Vec::new();
        let leaf_direction = rotate(self.direction, 1, self.chirality);
        let leaf_block_in = rotate(leaf_direction, 2, self.chirality);
        let leaf_forced_in = rotate(leaf_direction, 1, self.chirality);
        let leaf_block_out = rotate(leaf_direction, -2, self.chirality);
        let leaf_forced_out = rotate(leaf_direction, -1, self.chirality);
        let stem_block = rotate(self.direction, -2, self.chirality);
        let stem_forced = rotate(self.direction, -1, self.chirality);
        for y in 1.. {
            let stem_pos = self.pos + self.direction * y;
            if !passable(stem_pos) {
                break;
            }
            if stem_pos == goal {
                return vec![Neighbor {
                    node: JumpPoint {
                        pos: goal,
                        direction: self.direction,
                        chirality: self.chirality,
                    },
                    stem_cost: y,
                    leaf_cost: 0,
                }];
            }
            if !passable(stem_pos + stem_block) && passable(stem_pos + stem_forced) {
                neighbors.push(Neighbor {
                    node: JumpPoint {
                        pos: stem_pos,
                        direction: stem_forced,
                        chirality: self.chirality,
                    },
                    stem_cost: y,
                    leaf_cost: 0,
                });
            }
            for x in 1.. {
                let leaf_pos = stem_pos + leaf_direction * x;
                if !passable(leaf_pos) {
                    break;
                }
                if leaf_pos == goal {
                    return vec![Neighbor {
                        node: JumpPoint {
                            pos: goal,
                            direction: self.direction,
                            chirality: self.chirality,
                        },
                        stem_cost: y,
                        leaf_cost: x,
                    }];
                }
                if !passable(leaf_pos + leaf_block_in) && passable(leaf_pos + leaf_forced_in) {
                    neighbors.push(Neighbor {
                        node: JumpPoint {
                            pos: leaf_pos,
                            direction: leaf_forced_in,
                            chirality: self.chirality.opposite(),
                        },
                        stem_cost: y,
                        leaf_cost: x,
                    });
                }
                if !passable(leaf_pos + leaf_block_out) && passable(leaf_pos + leaf_forced_out) {
                    neighbors.push(Neighbor {
                        node: JumpPoint {
                            pos: leaf_pos,
                            direction: leaf_forced_out,
                            chirality: self.chirality,
                        },
                        stem_cost: y,
                        leaf_cost: x,
                    });
                }
            }
        }
        neighbors
    }
}

#[derive(PartialEq, Eq, Hash, Copy, Clone)]
enum Chirality {
    Clockwise,
    Counterclockwise,
}

impl Chirality {
    fn opposite(&self) -> Self {
        match self {
            Chirality::Clockwise => Chirality::Counterclockwise,
            Chirality::Counterclockwise => Chirality::Clockwise,
        }
    }
}

fn rotate(direction: Direction, n: i32, chirality: Chirality) -> Direction {
    match chirality {
        Chirality::Clockwise => direction.rotate(n),
        Chirality::Counterclockwise => direction.rotate(-n),
    }
}

// pub(super) fn jps<FP, FH>(origin: Pos, goal: Pos, passable: FP, heuristic: FH) -> Option<(Vec<Pos>, u32)>
// where
//     FP: Fn(Pos) -> bool,
//     FH: Fn(Pos) -> u32,
// {
//     let node_path = astar(
//         &Node::Start(origin),
//         |n| n.neighbors(goal, passable),
//         |n| n.heuristic(heuristic),
//         |n| n.success(goal)
//     );
//     match node_path {
//         Some((path, cost)) => {
//             let pos_path = Vec::with_capacity(cost as usize);
//             for i in 1..pos_path.len() - 1 {
//                 let target = pos_path[i + 1];
//             }
//             panic!()
//         }
//         None => None,
//     }
// }

// #[derive(PartialEq, Eq, Hash, Clone)]
// enum Node {
//     Start(Pos),
//     JumpPoint {
//         pos: Pos,
//         direction: Direction,
//         chirality: Chirality,
//     }
// }

// #[derive(PartialEq, Eq, Hash, Clone)]
// enum Chirality {
//     Clockwise,
//     Counterclockwise,
// }



// impl Node {
//     fn neighbors<FP>(&self, goal: Pos, passable: FP) -> Vec<(Self, u32)>
//     where
//         FP: Fn(Pos) -> bool,
//     {
//         match *self {
//             Node::Start(pos) => {
//                 DIRECTIONS.into_iter().map(|&direction| (Node::JumpPoint {
//                     pos,
//                     direction,
//                     chirality: Chirality::Clockwise,
//                 }, 0)).collect()
//             }
//             Node::JumpPoint {
//                 pos,
//                 direction,
//                 chirality,
//             } => {
//                 let mut neighbors = Vec::new();
//                 let leaf_direction = rotate(direction, 1, chirality);
//                 let leaf_block_in = rotate(leaf_direction, 2, chirality);
//                 let leaf_forced_in = rotate(leaf_direction, 1, chirality);
//                 let leaf_block_out = rotate(leaf_direction, -2, chirality);
//                 let leaf_forced_out = rotate(leaf_direction, -1, chirality);
//                 let stem_block = rotate(direction, -2, chirality);
//                 let stem_forced = rotate(direction, -1, chirality);
//                 for y in 1.. {
//                     let stem_pos = pos + direction * y;
//                     if !passable(stem_pos) {
//                         break;
//                     }
//                     if stem_pos == goal {
//                         return vec![(Node::Start(stem_pos), y)]
//                     }
//                     if !passable(stem_pos + stem_block) && passable(stem_pos + stem_forced) {
//                         neighbors.push((Node::JumpPoint {
//                             pos: stem_pos,
//                             direction: rotate(direction, -1, chirality),
//                             chirality,
//                         }, y));
//                     }
//                     for x in 1.. {
//                         let leaf_pos = stem_pos + leaf_direction * x;
//                         if !passable(leaf_pos) {
//                             break;
//                         }
//                         if leaf_pos == goal {
//                             return vec![(Node::Start(leaf_pos), x + y)];
//                         }
//                         if !passable(leaf_pos + leaf_block_in) && passable(leaf_pos + leaf_forced_in) {
//                             neighbors.push((Node::JumpPoint {
//                                 pos: leaf_pos,
//                                 direction: rotate(leaf_direction, 1, chirality),
//                                 chirality: chirality.opposite(),
//                             }, x + y))
//                         }
//                         if !passable(leaf_pos + leaf_block_out) && passable(leaf_pos + leaf_forced_out) {
//                             neighbors.push((Node::JumpPoint {
//                                 pos: leaf_pos,
//                                 direction,
//                                 chirality,
//                             }, x + y))
//                         }
//                     }
//                 }
//                 neighbors
//             }
//         }
//     }

//     fn heuristic<FH>(&self, pos_heuristic: FH) -> u32
//     where
//         FH: Fn(Pos) -> u32,
//     {
//         match *self {
//             Node::Start(pos) => pos_heuristic(pos),
//             Node::JumpPoint { pos, .. } => pos_heuristic(pos),
//         }
//     }

//     fn success(&self, goal: Pos) -> bool {
//         match *self {
//             Node::Start(pos) => pos == goal,
//             Node::JumpPoint { pos, .. } => pos == goal,
//         }
//     }
// }

// impl Chirality {
//     fn opposite(&self) -> Self {
//         match self {
//             Chirality::Clockwise => Chirality::Counterclockwise,
//             Chirality::Counterclockwise => Chirality::Clockwise,
//         }
//     }
// }
