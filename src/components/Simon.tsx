import React, { Component } from 'react';
import { Button } from 'reactstrap';
import './Simon.css';
import { GameBoard } from "./GameBoard";

interface IProps {
}

interface IState {
    activeGameStateName?: string;
    state?: string;
    timeout?: number;
    selectedButton?: string | undefined;
    message?: string;
    notes?: string[];
    index?: number;
    round?: number;
    audioCtx?: AudioContext;
    countdown?: number;
}

interface IRule {
    type: string;
    begin_state?: Function | IState;
    end_state?: Function | IState;
    sleep?: number;
    countdown?: number;
    next: string;
}

type Frequencies = {
    [key: string]: number;
}


export class Simon extends Component<IProps, IState> {
    private prev: IState;
    private oscillator: OscillatorNode | undefined ;
    private audioCtx: AudioContext | undefined;
    private gainNode: GainNode | undefined;

    constructor(props: IProps) {
        super(props);
        this.prev = {} as IState;
        this.oscillator = undefined;
        this.audioCtx = undefined;
        this.state = {
                state: "attract",
                timeout: 0,
                round: 0,
                selectedButton: undefined,
                message: undefined,
                notes: undefined,
                index: undefined
        }
    }

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
    playNote(frequency: number) {
        this.ensureAudio();
        if (this.audioCtx === undefined || this.gainNode === undefined) { return; }
        this.oscillator = this.audioCtx.createOscillator();
        this.oscillator.connect(this.gainNode);
        this.oscillator.type = 'square';
        this.oscillator.frequency.value = frequency; // value in hertz
        this.oscillator.start();
    }

    stopPlaying() {
        if (this.oscillator !== undefined) {
            this.oscillator.stop();
        }
    }
    
    static frequencies: Frequencies = {
        blue: 164.81, // E
        red: 110, // A
        green: 82.41, // E octave below
        yellow: 138.59, // c#
        fail: 50.0
    };

    static buttons = [ 'red', 'blue', 'green', 'yellow'];
        
    getEffectiveState() {
        return {...this.state, ...this.prev};
    }
    applyGameStateChange(ruleData: IRule, transitionName: string) {
        if (transitionName in ruleData) {
            if (this.prev === undefined) {
                this.prev = {};
            }
            // @ts-ignore
            let stateChange = ruleData[transitionName] as Function | IState;
            if (typeof stateChange === 'function') {
                stateChange = stateChange(this, this.getEffectiveState());
            }
            this.prev = { ...this.prev, ...stateChange};
        }
    }
    
    flushStateChanges() {
        if ('prev' in this) {
            this.setState(this.prev);
            this.prev = {} as IState;
        }
    }

    processGameState(gameStateName: string) {
        console.log(`processGameState ${gameStateName}`);
        let gameStateRules = Simon.gameStates[gameStateName];
        this.prev.activeGameStateName = gameStateName;
        this.applyGameStateChange( gameStateRules,'begin_state');
        switch (gameStateRules.type) {
            case 'transient':
                this.processGameState(gameStateRules.next);
                break;
            case 'countdown':
                this.processCountdown(gameStateRules);
                break;
            default: break;
        }
        this.flushStateChanges();
    }
    processCountdown(gameStateRules: IRule) {
        let effectiveState = this.getEffectiveState();
        if ((effectiveState.countdown || 0) <= 0) {
            this.applyGameStateChange( gameStateRules,'end_state');
            this.processGameState(gameStateRules.next);
            return;
        }
        this.applyGameStateChange( gameStateRules,'countdown_function');
        this.flushStateChanges();
        const timer = setTimeout(() => {
            clearTimeout(timer);
            this.processCountdown(gameStateRules);
        }, gameStateRules.sleep);
    }
    static gameStates: { [name: string]: IRule } = {
        attract: {} as IRule,
        start_game: {
            type: 'transient',
            begin_state: () => {
                return {
                    notes: [],
                    round: 0
                };
            },
            next: 'start_round'
        } as IRule,
        start_round: {
            type: 'transient',
            begin_state: (dis: Simon, prev: IState) => {
                let note = Simon.buttons[Math.floor(Math.random() * Simon.buttons.length)];
                let notes = prev.notes;
                if (notes === undefined) {  notes = []; }
                notes.push(note);
                return {
                    notes: notes,
                    round: (prev.round || 0) +1
                } as IState;
            },
            next: 'ready'
        } as IRule,
        ready: {
            type: 'countdown',
            sleep: 500,
            begin_state: {
                countdown: 3
            },
            countdown_function: (dis: Simon, prev: IState) => {
                let countdown = prev.countdown || 0;
                return {
                    message: `Round ${prev.round}: Get Ready! ${countdown}`,
                    countdown: countdown -1
                } as IState;
            },
            end_state: {
                message: undefined
            },
            next: 'play_notes'
        } as IRule,
        play_notes: {
            type: 'countdown',
            sleep: 500,
            begin_state: (dis: Simon, prev: IState) => {
                let notes = prev.notes;
                let count = (notes !== undefined) ? notes.length: 0;
                return {
                    message: "Listen",
                    countdown: count,
                    index: 0,
                } as IState;
            },
            countdown_function: (dis: Simon, prev: IState) => {
                let countdown = prev.countdown || 0;
                let index = prev.index || 0;
                let notes = prev.notes;
                let color = (notes !== undefined)?notes[index]:undefined;
                dis.stopPlaying();
                if (color !== undefined) {
                    dis.playNote(Simon.frequencies[color]);
                }
                return { 
                    selectedButton: color,
                    index: index + 1,
                    message: `Play Note! ${countdown}`,
                    countdown: countdown -1
                } as IState;
            },
            end_state: (dis: Simon) => {
                dis.stopPlaying();
                return {
                    selectedButton: undefined,
                    message: undefined
                } as IState;
            },
            next: 'user_playback',
        } as IRule,
        user_playback: {
            type: 'user',
            next: 'passed',
            begin_state: {
                message: "Now repeat what you just heard!",
                index:0
            }
            } as IRule,

        passed: {
            type: 'transient',
            next: 'start_round',
        } as IRule,
        
        failed: {
            type: 'user',
            next: 'start_game',
            begin_state: {
                selectedButton: undefined,
                message: "You lost! Click play to start again."
            } as IState
        } as IRule
    }
    
    static timeout = 5;
    
    
    startGame() {
        this.processGameState('start_game');
    }

    clickHandler(color: string) {
        console.log(`clickHandler(${color})`);
        console.log(`${this.state.activeGameStateName} : ${color}`);
        if (this.state.activeGameStateName === 'user_playback') {
            window.addEventListener('mouseup', () => {
                this.endClickHandler()
            }, {capture: true, once: true});
            this.playNote(Simon.frequencies[color])
            this.setState({
                selectedButton: color
            });
        }
    }

    endClickHandler() {
        this.stopPlaying();
        let index = this.state.index;
        let color = this.state.selectedButton;
        let notes = this.state.notes;
        if (notes === undefined || index === undefined) {
            return;
        }
        console.log(`endClickHandler(${color},[${notes}][${index}])`);
        if (color === notes[index]) {
            index++;
            this.setState({
                index: index,
                selectedButton: undefined
            });
            if (index >= notes.length) {
                this.processGameState('passed');
            }
        } else {
            this.processGameState('failed');
        }

    }

    render () {
        return (
            <div>
                <h1>Simon</h1>
                <div>
                    {(this.state.state === "attract") &&
                        <Button key="play" onClick={this.startGame.bind(this)}>Start Playing</Button>
                    }
                    {(this.state.message != null) && 
                        <div>
                            {this.state.message}
                        </div>
                    }
                </div>
                <div className="game">
                    <GameBoard activeButton={this.state.selectedButton} clickHandler={(color:string)=>this.clickHandler(color)}/>
                </div>

            </div>
        );
    }
}