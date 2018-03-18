package com.albertford

import com.albertford.display.Display
import com.badlogic.gdx.ApplicationAdapter
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.g2d.TextureAtlas

class Game(private val width: Int, private val height: Int) : ApplicationAdapter() {
    private lateinit var batch: SpriteBatch
    private lateinit var atlas: TextureAtlas
    private lateinit var font: Texture

    private lateinit var gameState: GameState

    private lateinit var display: Display

    override fun create() {
        batch = SpriteBatch()
        atlas = TextureAtlas("atlas/oryx.atlas")
        font = Texture("font/font.png")

        gameState = GameState(width, height)
        display = Display(gameState, atlas, font)

        Gdx.graphics.isContinuousRendering = false
        Gdx.graphics.requestRendering()
    }

    override fun render() {
        Gdx.gl.glClearColor(0f, 0f, 0f, 1f)
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT)
        batch.begin()
        display.render(batch)
        batch.end()
    }

    override fun dispose() {
        batch.dispose()
        atlas.dispose()
        font.dispose()
    }
}
