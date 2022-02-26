import {combineReducers, createStore} from "redux";
import {IGameState} from "./types";
import {gameStateReducer} from "./reducer";

export interface IRootState {
    game: IGameState
}
const store = createStore<IRootState, any, any, any>(
    combineReducers({
        game: gameStateReducer
    }));

export default store;