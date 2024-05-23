import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Alert, Col, Container, Row} from 'reactstrap';
import './Simon.css';
import {GameBoard} from "./GameBoard";
import {AudioContext} from "./Audio";
import {useDispatch, useSelector} from "react-redux";
import {ProgressBar} from "./ProgressBar";
import {Constants} from './Constants';
import {selectVolume} from "../store/volumeSlice";
import {selectGameActive, stopGame} from "../store/gameStatusSlice";
import {selectDifficulty} from "../store/difficultySlice";

interface IState {
    stateName?: GameStateName
    difficulty?: string,
    state?: string
    selectedButton?: string | undefined
    message?: string
    notes?: string[]
    index?: number
    round?: number
    audio?: string
    playNoteCallback?:(c:string) => void
}

interface IMessageState {
    message: string | undefined
}

type IFrequencies = {
    [key: string]: number;
}

type IDifficulties = {
    [key: string]: number;
}

const DIFFICULTY_TO_PLAY_DURATION_MS: IDifficulties = {
    easy: 500,
    normal: 300,
    hard: 200
}

const AUDIO_FREQUENCY_MAP: IFrequencies = {
    blue: 164.81,   // E
    red: 110,       // A
    green: 82.41,   // E octave below
    yellow: 138.59, // C#
    fail: 49.0
};


export const BUTTONS = ["yellow", "green", "blue", "red"]

export enum GameStateName {
    Attract = 1,
    Start,
    BeginRound,
    GetReady,
    PlayNotes,
    RepeatNotes,
    Failure
}


export type IGameRules = {
    [key in GameStateName]?: (e: GameEngine) => void;
};

class GameEngine {

    private gameRules: IGameRules
    private state: IState
    private state_delta: IState
    private changeCallback: (state_changes: IState) => void
    readonly playDurationMs: () => number

    constructor(rules: IGameRules, change_callback: (state_changes: IState) => void, playDurationMs: () => number) {
        this.gameRules = rules
        this.state_delta = {} as IState
        this.state = {
            difficulty: "normal",
            round: 0,
            message: undefined,
            notes: undefined,
            index: undefined
        } as IState
        this.changeCallback = change_callback
        this.playDurationMs = playDurationMs
    }

    playNote(color: string) {
        const state = this.getEffectiveState()
        state.playNoteCallback?.(color)
    }

    async startGame() {
        await this.processGameState(GameStateName.Start)
    }

    async stopGame() {
        await this.processGameState(GameStateName.Attract)
    }

    flushStateChanges() {
        if (Object.keys(this.state_delta).length > 0) {
            this.state = this.getEffectiveState()
            this.changeCallback(this.state_delta)
            this.state_delta = {} as IState;
        }
    }

    async processGameState(gameStateName: GameStateName) {
        const gameStateRule = this.gameRules[gameStateName];
        if (gameStateRule === undefined) return;
        gameStateRule(this);
    }

    applyStateChange(changes: IState) {
        this.state_delta = {...this.state_delta, ...changes} as IState;
        this.flushStateChanges();

    }

    getEffectiveState(): IState {
        return {...this.state, ...this.state_delta} as IState;
    }

}

const GAME_RULES: IGameRules = {
    [GameStateName.Attract]: (engine: GameEngine) => {
    },
    [GameStateName.Start]: (engine: GameEngine) => {
        engine.applyStateChange({notes: [], round: 0, stateName: GameStateName.BeginRound})
    },
    [GameStateName.BeginRound]: (engine: GameEngine) => {
        let note = BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
        const state = engine.getEffectiveState()
        let notes = state.notes || [];
        notes.push(note);
        engine.applyStateChange({
            notes,
            round: (state.round || 0) + 1,
            stateName: GameStateName.GetReady
        })
    },
    [GameStateName.GetReady]: (engine: GameEngine): void => {
        const state = engine.getEffectiveState()
        const steps = async (countdown: number) => {
            if (countdown > 0) {
                const message = `Round ${state.round}: Get Ready! ${countdown}`
                engine.applyStateChange({message})
                setTimeout(() => {
                    steps(countdown - 1)
                }, 1000)
            } else {
                engine.applyStateChange(
                    {
                        message: undefined,
                        stateName: GameStateName.PlayNotes
                    }
                )
            }
        }
        steps(Constants.GET_READY_COUNTDOWN_STEPS).then()
    },
    [GameStateName.PlayNotes]: (engine: GameEngine) => {
        const steps = async (index: number) => {
            const state = engine.getEffectiveState()
            if (index < (state.notes?.length || 0)) {
                let selectedButton = (state.notes) ? state.notes[index] : 'fail'
                const message = "Listen"
                engine.applyStateChange({
                    message,
                    selectedButton
                })
                setTimeout(() => {
                    // Break between steps
                    engine.applyStateChange({
                        selectedButton:undefined
                    })
                    setTimeout(() => {
                        steps(index + 1)
                    }, 20)
                }, engine.playDurationMs())
            } else {
                engine.applyStateChange(
                    {
                        selectedButton: undefined,
                        message: undefined,
                        stateName: GameStateName.RepeatNotes
                    }
                )
            }
        }
        steps(0).then()
    },
    [GameStateName.RepeatNotes]: (engine: GameEngine) => {
        const notes: string[] = engine.getEffectiveState().notes || []
        const playState = {
            index: 0,
            notes: notes
        }
        const playNoteCallback = (note: string) => {
            if (note === playState.notes[playState.index]) {
                playState.index++
                if (playState.index >= notes.length) {
                    engine.applyStateChange({
                            stateName: GameStateName.BeginRound
                        }
                    )
                }
            } else {
                engine.applyStateChange({
                        stateName: GameStateName.Failure
                    }
                )
            }
        }
        engine.applyStateChange({
                playNoteCallback,
                index: 0,
                message: "Now repeat what you heard.",
            }
        )
    },
    [GameStateName.Failure]: (engine: GameEngine) => {
        const failed = async () => {
            let message = `Game Over`
            engine.applyStateChange({message, selectedButton: "fail"})
            setTimeout(() => {
                engine.applyStateChange(
                    {
                        selectedButton: undefined,
                        message: "Please Try Again",
                        stateName: GameStateName.Attract
                    }
                )
            }, Constants.LOST_MESSAGE_WAIT_TIME_MS)
        }
        failed().then()
    }
}


export default function Simon() {

    const [selectedButton, setSelectedButton] = useState<string | undefined>(undefined)
    const [message, setMessage] = useState('')
    const [activeGameStateName, setActiveGameStateName] = useState<GameStateName>(GameStateName.Attract)
    const [round, setRound] = useState(0)
    const [engine, setEngine] = useState<GameEngine>()
    const dispatch = useDispatch();
    const difficulty = useSelector(selectDifficulty)


    const getPlayDurationMs = () => DIFFICULTY_TO_PLAY_DURATION_MS[difficulty]



    const stateChangeCallback = (state_changes: IState) => {
        if ('selectedButton' in state_changes) {
            setSelectedButton(state_changes.selectedButton)
        }
        if ('message' in state_changes) {
            setMessage(state_changes.message || '')
        }
        if ('round' in state_changes) {
            setRound(state_changes.round || 0)
        }
        if ('stateName' in state_changes && state_changes.stateName !== undefined) {
            const name = state_changes.stateName
            setActiveGameStateName(name)
        }
    }

    const onLoad = () => {
        setEngine(new GameEngine(GAME_RULES, stateChangeCallback, getPlayDurationMs))
    }
    React.useEffect(() => onLoad())

    const audio = useContext(AudioContext)

    const volume = useSelector(selectVolume)
    const isGameActive = useSelector(selectGameActive)

    const handleGameStateNameChange = useCallback((name: GameStateName) => {
        if (name === GameStateName.Attract) {
            dispatch(stopGame())
        } else {
            engine?.processGameState(name).then()
        }
    },[engine, dispatch])

    useEffect(() => {
        handleGameStateNameChange(activeGameStateName)
    }, [activeGameStateName, handleGameStateNameChange])

    useEffect(() => {
        audio.setVolume(volume)

        return () => {
            audio?.stop()
        }
    }, [audio, volume])

    useEffect(() => {
        if (isGameActive) {
            engine?.startGame().then();
        } else {
            engine?.stopGame().then();
        }
    }, [isGameActive, engine])

    const playAudio = useCallback((code: string | undefined) => {
        audio?.stop()
        if (code !== undefined) {
            const frequency = AUDIO_FREQUENCY_MAP[code]
            audio?.play(frequency);
        }
    }, [audio])

    useEffect( () => {
        playAudio(selectedButton)
    }, [selectedButton, playAudio])


    const selectButtonHandler = (color: string | undefined) => {
        if (activeGameStateName !== GameStateName.RepeatNotes) return;
        setSelectedButton(color)
    }

    const deselectButtonHandler = (_: string) => {
        if (activeGameStateName !== GameStateName.RepeatNotes) return;
        let color = selectedButton;
        if (color !== undefined) {
            setSelectedButton(undefined)
            engine?.playNote(color)
        }
    }

    return (
        <Container>
            <Row>
                <Col className="col-md-8 offset-md-2">
                    <GameBoard activeButton={selectedButton}
                               colorSelectHandler={selectButtonHandler}
                               colorDeselectHandler={deselectButtonHandler}
                               colors={BUTTONS}
                    />
                </Col>
            </Row>
            <Row className="padded-row">
                <Col>
                    <div className="text-center">
                        Progress
                    </div>
                    <ProgressBar stage={round || 0} maxStages={Constants.MAX_ROUNDS.valueOf()}/>
                </Col>
            </Row>
            <Row className="padded-row">
                <Col className="col-md-8 offset-md-2">
                    <GameMessage message={message}/>
                </Col>
            </Row>
        </Container>
    );

}

export function GameMessage({message}: IMessageState) {
    return (message == null) ? <div/> : <Alert color="primary">{message}</Alert>
}
