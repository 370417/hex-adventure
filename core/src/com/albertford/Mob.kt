package com.albertford

interface Mob {
    var pos: Pos
    var facingRight: Boolean
}

class Player(override var pos: Pos, override var facingRight: Boolean) : Mob
