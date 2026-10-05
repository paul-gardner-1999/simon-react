
// Simple Audio controller

import {createContext} from "react";

export class Audio {

    private oscillator: OscillatorNode | undefined ;
    private audioCtx: AudioContext | undefined;
    private gainNode: GainNode | undefined;
    private volume = 0.1;

    constructor() {
        this.oscillator = undefined
        this.audioCtx = undefined
        this.gainNode = undefined
    }
    ensureAudio() {
        if (this.audioCtx === undefined) {
            this.audioCtx = new AudioContext();
            this.gainNode = this.audioCtx.createGain();

            // connect oscillator to gain node to speakers
            this.gainNode.connect(this.audioCtx.destination);
            this.gainNode.gain.value = this.volume;
        }
    }

    play(frequency: number | undefined) {
        if (frequency === undefined) {
            this.stop()
            return
        }
        this.ensureAudio();
        this.stop(); // Clear any existing oscillator
        if (this.audioCtx === undefined || this.gainNode === undefined) { return; }
        this.oscillator = this.audioCtx.createOscillator();
        this.oscillator.connect(this.gainNode);
        this.oscillator.type = 'square';
        this.oscillator.frequency.value = frequency; // value in hertz
        this.oscillator.start();
    }

    stop() {
        if (this.oscillator !== undefined) {
            this.oscillator.stop();
            this.oscillator = undefined;
        }
    }

    getVolume() {
        return this.gainNode?.gain.value || 0;
    }
    setVolume(volume: number) {
        this.volume = volume;
        if (this.gainNode !== undefined) {
            this.gainNode.gain.value = volume;
        }
    }
}

// Single shared player; components read it with useContext(AudioPlayerContext)
export const AudioPlayerContext = createContext(new Audio());
