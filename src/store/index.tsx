import gameStateReducer from "./gameStatusSlice";
import difficultyReducer from "./difficultySlice"
import volumeReducer from "./volumeSlice"
import {configureStore} from '@reduxjs/toolkit';

export default configureStore({
    reducer: {
        gameState: gameStateReducer,
        difficulty: difficultyReducer,
        volume: volumeReducer,
    },
});


