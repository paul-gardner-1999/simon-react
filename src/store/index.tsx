import {IGameState} from "./types";
import {gameStateReducer} from "./reducer";
import {combineReducers, configureStore} from '@reduxjs/toolkit';

export interface IRootState {
    game: IGameState
}
const store = configureStore({
    reducer: combineReducers({
        game: gameStateReducer
    })
})

export default store;