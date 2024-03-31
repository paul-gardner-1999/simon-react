import React, {useState} from 'react';
import {
    Navbar,
    Nav,
    NavbarBrand,
    NavbarToggler,
    Input,
    Button,
    DropdownToggle,
    ButtonDropdown,
    DropdownMenu, DropdownItem
} from "reactstrap";
import {NavItem, NavLink, NavbarText} from "reactstrap";
import {Collapse} from "reactstrap";
import {connect, useDispatch, useSelector} from "react-redux";
import {IRootState} from "../store";
import {GameActions, IGameState} from "../store/types";
import {Dispatch} from "redux";
import * as actions from '../store/actions';
import './Navigation.css';
import {Constants} from "./Constants";
import {setDifficulty, setPlaying, setVolume} from "../store/actions";


const mapDispatcherToProps = (dispatch: Dispatch<GameActions>) => {
    return {
        setVolume: (volume: number) => dispatch(actions.setVolume(volume)),
        setPlaying: (playing: boolean) => dispatch(actions.setPlaying(playing)),
        setDifficulty: (difficulty: string) => dispatch(actions.setDifficulty(difficulty))
    }
}

export const mapGameStateToProps = ({game}: IRootState) => {
    const {playing, volume, difficulty} = game;
    return {playing, volume, difficulty};
}
export type ReduxType = ReturnType<typeof mapGameStateToProps> & ReturnType<typeof mapDispatcherToProps>;


export function Navigation() {

    const [navbarOpen, setNavbarOpen] = useState(false);
    const toggleNavbar = () => setNavbarOpen(!navbarOpen)

    return <div>
        <Navbar
            color="light"
            expand="md"
            light
        >
            <PlayGameButton/>
            <NavbarToggler onClick={toggleNavbar}/>
            <Collapse navbar isOpen={navbarOpen}>
                <Nav
                    className="me-auto"
                    navbar
                >
                    <NavItem>
                        <NavLink href={Constants.URL_SOURCE_CODE as string}>
                            View Source Code
                        </NavLink>
                    </NavItem>
                </Nav>

                <VolumeControl/>
            </Collapse>
        </Navbar>
    </div>
}

function PlayGameButton() {
    const [dropdown, setDropdown] = useState(false);

    const dispatch = useDispatch();
    const playing = useSelector<IGameState, any>(state => state.playing)
    const difficulty = useSelector<IGameState, any>(state => state.difficulty)
    const toggleDropdown = () => setDropdown(!dropdown)

    return <NavbarBrand>
        <ButtonDropdown
            isOpen={dropdown}
            toggle={toggleDropdown}
        >
            <Button id="caret"
                    onClick={() => dispatch(setPlaying(true))}
                    disabled={playing}
            >
                Play Game
            </Button>
            <DropdownToggle split disabled={playing}/>
            <DropdownMenu>
                <DropdownItem header>
                    Select Difficulty
                </DropdownItem>
                <DropdownItem divider/>
                {
                    ['easy', 'normal', 'hard'].map(d =>
                        <DropdownItem className='text-capitalize'
                                      key={d}
                                      active={difficulty === d}
                                      onClick={_ => dispatch(setDifficulty(d))}>
                            {d}
                        </DropdownItem>)
                }
            </DropdownMenu>
        </ButtonDropdown>
    </NavbarBrand>
}


function VolumeControl() {
    const dispatch = useDispatch();

    const volume = useSelector<IGameState, any>(state => state.volume)
    const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        dispatch(setVolume(Number(value)))
    }

    return <NavbarText>
        Volume
        <Input
            onInput={onVolumeChange}
            className="volume-control"
            id="volume-control"
            name="range"
            type="range"
            min={Constants.VOLUME_MIN}
            max={Constants.VOLUME_MAX}
            step={Constants.VOLUME_INCREMENT}
            value={volume}
            list="volume-vals"
        />
        <datalist id="volume-vals">
            <option value={Constants.VOLUME_MIN} label="min"/>
            <option value={Constants.VOLUME_MAX} label="max"/>
        </datalist>
    </NavbarText>

}

export default connect(mapGameStateToProps, mapDispatcherToProps)(Navigation);