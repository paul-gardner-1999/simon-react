import {createSlice} from '@reduxjs/toolkit'

interface GameStateSliceType {
    active: boolean
}

const gameStateSlice = createSlice({
    name: 'gameState',
    initialState: {
        active: false
    } as GameStateSliceType,
    reducers: {
        playGame(state) {
            state.active = true
        },
        stopGame(state) {
            state.active = false
        },
    },
})

export const { playGame, stopGame} = gameStateSlice.actions
export const selectGameActive = (state: any) : boolean => state.gameState.active

export default gameStateSlice.reducer

