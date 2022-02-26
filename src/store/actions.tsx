import {action} from 'typesafe-actions';
import {Constants} from "./types";

export function setPlaying(playing: boolean) {
    return action(Constants.SET_PLAYING, {playing});
}

export function setVolume(volume: number) {
    return action(Constants.SET_VOLUME, {volume});
}
