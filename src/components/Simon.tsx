import {useContext, useEffect, useState} from 'react';
import {Alert, Col, Container, Row} from 'reactstrap';
import './Simon.css';
import {GameBoard} from "./GameBoard";
import {AudioPlayerContext} from "./Audio";
import {ProgressBar} from "./ProgressBar";
import {Constants} from './Constants';
import {useSimonStore} from "../store/useSimonStore";
import {
    AUDIO_FREQUENCY_MAP,
    BUTTONS,
    type Color,
    DIFFICULTY_TO_PLAY_DURATION_MS,
    gameMessage,
    nextTimer,
    randomColor
} from "../game/simon";

interface IMessageState {
    message: string | undefined
}

export default function Simon() {

    const game = useSimonStore(s => s.game)
    const dispatch = useSimonStore(s => s.dispatch)
    const difficulty = useSimonStore(s => s.difficulty)
    const volume = useSimonStore(s => s.volume)
    const audio = useContext(AudioPlayerContext)

    // Button the player is holding down; the note is submitted on release
    const [pressed, setPressed] = useState<Color>()

    const playDurationMs = DIFFICULTY_TO_PLAY_DURATION_MS[difficulty]

    // Drive the game forward: each state that waits on time schedules its next action
    useEffect(() => {
        const timer = nextTimer(game, playDurationMs)
        if (timer === undefined) return
        const id = setTimeout(() => dispatch(timer.action), timer.delayMs)
        return () => clearTimeout(id)
    }, [game, playDurationMs, dispatch])

    const activeTone = game.tone ?? pressed

    useEffect(() => {
        audio.stop()
        if (activeTone !== undefined) {
            audio.play(AUDIO_FREQUENCY_MAP[activeTone])
        }
    }, [audio, activeTone])

    useEffect(() => {
        audio.setVolume(volume)
    }, [audio, volume])

    useEffect(() => () => audio.stop(), [audio])

    const selectButtonHandler = (color: Color) => {
        if (game.phase !== 'repeatNotes') return;
        setPressed(color)
    }

    const deselectButtonHandler = () => {
        if (pressed === undefined) return;
        setPressed(undefined)
        dispatch({type: 'press', color: pressed, nextNote: randomColor()})
    }

    return (
        <Container>
            <Row>
                <Col className="col-md-8 offset-md-2">
                    <GameBoard activeButton={activeTone}
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
                    <ProgressBar stage={game.notes.length} maxStages={Constants.MAX_ROUNDS.valueOf()}/>
                </Col>
            </Row>
            <Row className="padded-row">
                <Col className="col-md-8 offset-md-2">
                    <GameMessage message={gameMessage(game)}/>
                </Col>
            </Row>
        </Container>
    );

}

export function GameMessage({message}: IMessageState) {
    return message ? <Alert color="primary">{message}</Alert> : <div/>
}
