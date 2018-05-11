use grid::{Direction, Pos};

#[derive(Serialize, Deserialize)]
pub enum Mob {
    Hero { pos: Pos, facing: Direction },
}

impl Mob {
    pub fn pos(&self) -> Pos {
        match *self {
            Mob::Hero { pos, .. } => pos,
        }
    }

    pub fn pos_mut(&mut self) -> &mut Pos {
        match self {
            Mob::Hero { pos, .. } => pos,
        }
    }

    pub fn facing(&self) -> Direction {
        match *self {
            Mob::Hero { facing, .. } => facing,
        }
    }

    pub fn facing_mut(&mut self) -> &mut Direction {
        match self {
            Mob::Hero { facing, .. } => facing,
        }
    }

    pub fn move_by(&mut self, direction: Direction) {
        {
            let pos = self.pos_mut();
            *pos += direction;
        }
        {
            let facing = self.facing_mut();
            *facing = direction;
        }
    }
}
