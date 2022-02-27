import {ActionType} from "typesafe-actions";
import * as actions from './actions';

export enum Constants {
    SET_VOLUME = 'SET_VOLUME',
    SET_PLAYING = 'SET_PLAYING',
    SET_DIFFICULTY = 'SET_DIFFICULTY'
}

export interface IGameState {
    playing: boolean;
    volume: number;
    difficulty: 'easy' | 'normal' | 'hard';
}

export type GameActions = ActionType<typeof actions>;