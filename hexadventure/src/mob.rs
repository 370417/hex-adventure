use grid::{Direction, Pos};

#[derive(Serialize, Deserialize)]
pub struct Mob {
    pub pos: Pos,
    pub facing: Direction,
    pub kind: Type,
}

#[derive(Serialize, Deserialize)]
pub enum Type {
    Hero,
    Archer,
}

impl Mob {
    pub fn move_by(&mut self, direction: Direction) {
        self.pos += direction;
        self.facing = direction;
    }
}
