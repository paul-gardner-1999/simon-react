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
import './Navigation.css';
import {Constants} from "./Constants";
import {selectGameActive, useSimonStore} from "../store/useSimonStore";
import {type Difficulty, randomColor} from "../game/simon";



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

    const dispatch = useSimonStore(s => s.dispatch)
    const isGameActive = useSimonStore(selectGameActive)
    const difficulty = useSimonStore(s => s.difficulty)
    const setDifficulty = useSimonStore(s => s.setDifficulty)
    const toggleDropdown = () => setDropdown(!dropdown)

    return <NavbarBrand>
        <ButtonDropdown
            isOpen={dropdown}
            toggle={toggleDropdown}
        >
            <Button id="caret"
                    onClick={() => dispatch({type: 'start', firstNote: randomColor()})}
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
                    (['easy', 'normal', 'hard'] as Difficulty[]).map(d =>
                        <DropdownItem className='text-capitalize'
                                      key={d}
                                      active={difficulty === d}
                                      onClick={() => setDifficulty(d)}>
                            {d}
                        </DropdownItem>)
                }
            </DropdownMenu>
        </ButtonDropdown>
    </NavbarBrand>
}


function VolumeControl() {
    const volume = useSimonStore(s => s.volume)
    const setVolume = useSimonStore(s => s.setVolume)
    const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => setVolume(Number(e.target.value))

    return <NavbarText>
        Volume
        <Input
            onChange={onVolumeChange}
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
