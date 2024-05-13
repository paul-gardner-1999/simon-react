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
import {useDispatch, useSelector} from "react-redux";
import './Navigation.css';
import {Constants} from "./Constants";
import {selectGameActive, playGame} from "../store/gameStatusSlice";
import {selectDifficulty, setDifficulty} from "../store/difficultySlice";
import {Difficulty} from "../store/types";
import {selectVolume, setVolume} from "../store/volumeSlice";



export default function Navigation() {

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
    const isGameActive = useSelector(selectGameActive)
    const difficulty = useSelector(selectDifficulty)
    const toggleDropdown = () => setDropdown(!dropdown)

    return <NavbarBrand>
        <ButtonDropdown
            isOpen={dropdown}
            toggle={toggleDropdown}
        >
            <Button id="caret"
                    onClick={() => dispatch(playGame())}
                    disabled={isGameActive}
            >
                Start Game
            </Button>
            <DropdownToggle split disabled={isGameActive}/>
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
                                      onClick={_ => dispatch(setDifficulty(d as Difficulty))}>
                            {d}
                        </DropdownItem>)
                }
            </DropdownMenu>
        </ButtonDropdown>
    </NavbarBrand>
}


function VolumeControl() {
    const dispatch = useDispatch();
    const volume = useSelector(selectVolume)
    console.log(`Volume: ${volume}`)
    const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value)
        dispatch(setVolume(Number(e.target.value)))
    }

    return <NavbarText>
        Volume
        <Input
            //onInput={(e) => dispatch(setVolume(Number(e.target)))}
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
