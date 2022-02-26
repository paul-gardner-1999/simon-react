
// Simple Audio library
export class Audio {

    private oscillator: OscillatorNode | undefined ;
    private audioCtx: AudioContext | undefined;
    private gainNode: GainNode | undefined;

    ensureAudio() {
        if (this.audioCtx === undefined) {
            let AudioContext = window.AudioContext;// || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.gainNode = this.audioCtx.createGain();

            // connect oscillator to gain node to speakers
            this.gainNode.connect(this.audioCtx.destination);
            this.gainNode.gain.value = 0.1;
        }
    }

    // setVolume(volume: number) {
    //     this.gainNode.
    // }

    play(frequency: number) {
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
        }
    }

    getVolume() {
        return this.gainNode?.gain.value || 0;
    }
    setVolume(volume: number) {
        if (this.gainNode != undefined) {
            this.gainNode.gain.value = volume;
        }
    }
}