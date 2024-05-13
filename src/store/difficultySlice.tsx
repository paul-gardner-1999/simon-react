import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Difficulty} from "./types";

interface DifficultyState {
    value: Difficulty
}

const difficultySlice = createSlice({
    name: 'difficulty',
    initialState: {
        value: 'normal'
    } as DifficultyState,
    reducers: {
        setDifficulty(state, action: PayloadAction<Difficulty>) {
            state.value = action.payload
        },
    },
})

export const { setDifficulty} = difficultySlice.actions
export const selectDifficulty = (state: any) : Difficulty => state.difficulty.value

export default difficultySlice.reducer

