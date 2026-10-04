import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import App from './App';
import {useSimonStore} from './store/useSimonStore';
import {initialGameState} from './game/simon';

// jsdom has no Web Audio; a do-nothing oscillator graph is enough
class FakeAudioContext {
    destination = {}
    createGain = () => ({connect() {}, gain: {value: 0}})
    createOscillator = () => ({connect() {}, start() {}, stop() {}, type: '', frequency: {value: 0}})
}

beforeEach(() => {
    useSimonStore.setState({game: initialGameState})
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.spyOn(Math, 'random').mockReturnValue(0) // every note is 'yellow'
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

test('renders the start game button', () => {
    render(<App/>);
    expect(screen.getByRole('button', {name: 'Start Game'})).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('plays a round, accepts the correct note, and fails on a wrong one', () => {
    const {container} = render(<App/>);
    const button = (color: string) => container.querySelector(`.simon-button.${color}`)!
    // Step in small increments so React re-renders (and schedules the next timer) in between
    const advance = (ms: number) => {
        for (let t = 0; t < ms; t += 10) act(() => { vi.advanceTimersByTime(10) })
    }

    fireEvent.click(screen.getByRole('button', {name: 'Start Game'}))
    expect(screen.getByRole('alert')).toHaveTextContent('Round 1: Get Ready! 3')
    expect(screen.getByRole('button', {name: 'Start Game'})).toBeDisabled()

    advance(3000)
    expect(screen.getByRole('alert')).toHaveTextContent('Listen')
    expect(button('yellow')).toHaveClass('active')

    advance(300 + 20)
    expect(screen.getByRole('alert')).toHaveTextContent('Now repeat what you heard.')

    fireEvent.pointerDown(button('yellow'))
    fireEvent.pointerUp(button('yellow'))
    expect(screen.getByRole('alert')).toHaveTextContent('Round 2: Get Ready! 3')

    advance(3000 + 2 * 320)
    fireEvent.pointerDown(button('red'))
    fireEvent.pointerUp(button('red'))
    expect(screen.getByRole('alert')).toHaveTextContent('Game Over')

    advance(1000)
    expect(screen.getByRole('alert')).toHaveTextContent('Please Try Again')
    expect(screen.getByRole('button', {name: 'Start Game'})).toBeEnabled()
});

test('difficulty dropdown selects a difficulty', () => {
    render(<App/>);
    // The split toggle next to Start Game opens the (react-popper positioned) menu
    fireEvent.click(screen.getAllByRole('button').find(b => b.classList.contains('dropdown-toggle'))!)
    fireEvent.click(screen.getByRole('menuitem', {name: 'hard'}))
    expect(useSimonStore.getState().difficulty).toBe('hard')
});
