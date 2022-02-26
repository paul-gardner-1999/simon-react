import {ActionType} from "typesafe-actions";
import * as actions from './actions';

export enum Constants {
    SET_VOLUME = 'SET_VOLUME',
    SET_PLAYING = 'SET_PLAYING'
}

export interface IGameState {
    playing: boolean;
    volume: number
}

export type GameActions = ActionType<typeof actions>;