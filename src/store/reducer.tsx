import {IGameState, Constants} from "./types";


const init: IGameState = {
    playing: false,
    volume: 0.2,
    difficulty: 'normal'
};

export function gameStateReducer(state: IGameState = init, action: any): IGameState {
    switch (action.type) {
        case Constants.SET_VOLUME:
            return { ...state, volume: action.payload.volume} as IGameState;
        case Constants.SET_PLAYING:
            return { ...state, playing: action.payload.playing} as IGameState;
        case Constants.SET_DIFFICULTY:
            return { ...state, difficulty: action.payload.difficulty} as IGameState;
        default:
            return state;
    }
}