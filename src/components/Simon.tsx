import React, { Component } from 'react';
import {Col, Container, Row, Alert} from 'reactstrap';
import './Simon.css';
import { GameBoard } from "./GameBoard";
import { Audio } from "./Audio";
import {Dispatch} from "redux";
import {GameActions} from "../store/types";
import * as actions from "../store/actions";
import {IRootState} from "../store";
import {connect} from "react-redux";
import {ProgressBar} from "./ProgressBar";
import {Constants} from './Constants';

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
    sleep?:number;
}

interface IRule {
    type: string;
    begin_state?: Function | IState;
    end_state?: Function | IState;
    countdown?: number;
    next: string;
}

type Frequencies = {
    [key: string]: number;
}

interface IDifficulty {
    sleep: number;
}

type IDifficulties = {
    [key: string]: IDifficulty;
}


const mapDispatcherToProps = (dispatch: Dispatch<GameActions>) => {
    return {
        setPlaying: (playing: boolean) => dispatch(actions.setPlaying(playing)),
        setVolume: (volume: number) => dispatch(actions.setVolume(volume)),
        setDifficulty: (difficulty: string) => dispatch(actions.setDifficulty(difficulty))
    }
}

const mapGameStateToProps = ({ game }: IRootState) => {
    const { playing, volume, difficulty } = game;
    return { playing, volume, difficulty };
}
type ReduxType = ReturnType<typeof mapGameStateToProps> & ReturnType<typeof mapDispatcherToProps>;

const MaxRounds: number = 20;

class Simon extends Component<ReduxType, IState> {
    private prev: IState;
    private audio: Audio | undefined;

    private readonly maxRounds: number;

    constructor(props: ReduxType) {
        super(props);
        this.prev = {} as IState;
        this.audio = undefined;
        this.maxRounds = MaxRounds;
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

    componentDidMount() {
        this.audio = new Audio();
        this.setVolume(this.props.volume);
    }
    componentWillUnmount() {
        this.stopAudio();
    }
    componentDidUpdate(prevProps: Readonly<ReduxType>, prevState: Readonly<IState>, snapshot?: any) {
        console.log("playing: " + prevProps.playing + "=>" + this.props.playing);
        console.log("volume: " + prevProps.volume + "=>" + this.props.volume);
        if (prevProps.volume !== this.props.volume) {
            this.setVolume(this.props.volume);
        }
        if (prevProps.playing !== this.props.playing) {
           if (this.props.playing) {
               this.startGame();
           }
        }
    }

    playAudio(frequency: number) {
        this.audio?.play(frequency);
    }

    stopAudio() {
        this.audio?.stop();
    }
    startGame() {
        console.log("Starting...");
        this.processGameState('start_game');
    }
    setVolume(volume: number) {
        this.audio?.setVolume(volume);
    }
    getVolume() {
        return this.audio?.getVolume() || 0;
    }

    
    static frequencies: Frequencies = {
        blue: 164.81, // E
        red: 110, // A
        green: 82.41, // E octave below
        yellow: 138.59, // c#
        fail: 49.0
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
        }, effectiveState.sleep || Constants.DEFAULT_SLEEP_MS);
    }
    static difficultySettings: IDifficulties = {
        easy : { sleep: 500 },
        normal: { sleep: 300 },
        hard: { sleep: 200 }
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
            begin_state: {
                sleep: Constants.GET_READY_SLEEP_MS,
                countdown: Constants.GET_READY_COUNTDOWN_STEPS
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
            begin_state: (dis: Simon, prev: IState) => {
                let notes = prev.notes;
                let count = (notes !== undefined) ? notes.length: 0;
                return {
                    message: "Listen",
                    countdown: count,
                    sleep: this.difficultySettings[dis.props.difficulty].sleep,
                    index: 0,
                } as IState;
            },
            countdown_function: (dis: Simon, prev: IState) => {
                let countdown = prev.countdown || 0;
                let index = prev.index || 0;
                let notes = prev.notes;
                let color = (notes !== undefined)?notes[index]:undefined;
                dis.stopAudio();
                if (color !== undefined) {
                    dis.playAudio(Simon.frequencies[color]);
                }
                return { 
                    selectedButton: color,
                    index: index + 1,
                    message: `Play Note! ${countdown}`,
                    countdown: countdown -1
                } as IState;
            },
            end_state: (dis: Simon) => {
                dis.stopAudio();
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
                message: "Now play back what you heard!",
                index:0
            }
            } as IRule,

        passed: {
            type: 'transient',
            next: 'start_round',
        } as IRule,
        
        failed: {
            type: 'countdown',
            begin_state: (dis: Simon, _: IState) => {
                dis.playAudio(Simon.frequencies['fail']);
                return {
                    selectedButton: undefined,
                    message: "You Lost",
                    sleep: Constants.LOST_MESSAGE_WAIT_TIME_MS,
                    countdown: 1
                } as IState;
            },
            countdown_function: (dis: Simon, prev: IState) => {
                let countdown = prev.countdown || 0;
                return {
                    countdown: countdown -1
                } as IState;
            },
            end_state: (dis: Simon, _: IState) => {
                dis.stopAudio();
                dis.props.setPlaying(false);
                return {message: "Game Over"} as IState;
            },
            next: 'attract'
        } as IRule
    }
    
    static timeout = 5;
    
    

    clickHandler(color: string) {
        console.log(`clickHandler(${color})`);
        console.log(`${this.state.activeGameStateName} : ${color}`);
        if (this.state.activeGameStateName === 'user_playback') {
            window.addEventListener('mouseup', () => {
                this.endClickHandler()
            }, {capture: true, once: true});
            this.playAudio(Simon.frequencies[color])
            this.setState({
                selectedButton: color
            });
        }
    }

    endClickHandler() {
        this.stopAudio();
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
            <Container >
                <Row >
                    <Col className="col-md-8 offset-md-2">
                            <GameBoard activeButton={this.state.selectedButton} clickHandler={(color:string)=>this.clickHandler(color)}/>
                    </Col>
                </Row>
                <Row className="padded-row">
                    <Col>
                        <div className="text-center">
                            Progress
                        </div>
                        <ProgressBar stage={this.state.round || 0} maxStages={this.maxRounds} />
                    </Col>
                </Row>
                <Row className="padded-row">
                    <Col className="col-md-8 offset-md-2">
                        {(this.state.message != null) &&
                            <Alert color="primary">
                                {this.state.message}
                            </Alert>
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}


export default connect(mapGameStateToProps, mapDispatcherToProps)(Simon);