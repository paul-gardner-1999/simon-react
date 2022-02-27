import React, {Component }from 'react';
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
import {connect} from "react-redux";
import {IRootState} from "../store";
import {GameActions} from "../store/types";
import {Dispatch} from "redux";
import * as actions from '../store/actions';
import './Navigation.css';
import {Constants} from "./Constants";

interface IState {
    collapsed: boolean,
    dropdown: boolean
}

const mapDispatcherToProps = (dispatch: Dispatch<GameActions>) => {
    return {
        setVolume: (volume: number) => dispatch(actions.setVolume(volume)),
        setPlaying: (playing: boolean) => dispatch(actions.setPlaying(playing)),
        setDifficulty: (difficulty: string) => dispatch(actions.setDifficulty(difficulty))
    }
}

export const mapGameStateToProps = ({ game }: IRootState) => {
    const { playing, volume , difficulty} = game;
    return { playing, volume ,difficulty};
}
export type ReduxType = ReturnType<typeof mapGameStateToProps> & ReturnType<typeof mapDispatcherToProps>;

export class Navigation extends Component<ReduxType, IState> {
    static displayName = Navigation.name;


    constructor (props: ReduxType) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.onVolumeChange = this.onVolumeChange.bind(this);
        this.onClickPlay = this.onClickPlay.bind(this);
        this.state = {
            collapsed: true,
            dropdown: false
        };
    }

    toggleNavbar () {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    toggleDropdown () {
        this.setState({
            dropdown: !this.state.dropdown
        });
    }

    onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        this.props.setVolume(Number(value));
    }

    onClickPlay() {
        this.props.setPlaying(true);
    }

    render() {
        const { volume } = this.props;
        return <div>
            <Navbar
                color="light"
                expand="md"
                light
            >
                <NavbarBrand>
                    <ButtonDropdown
                        isOpen={this.state.dropdown}
                        toggle={this.toggleDropdown}
                    >
                        <Button id="caret"
                            onClick={this.onClickPlay}
                            disabled={this.props.playing}
                            >
                            Play Game
                        </Button>
                        <DropdownToggle split disabled={this.props.playing} />
                        <DropdownMenu>
                            <DropdownItem header>
                                Select Difficulty
                            </DropdownItem>
                            <DropdownItem divider />
                            {
                                ['easy', 'normal', 'hard'].map(d =>
                                    <DropdownItem className='text-capitalize'
                                                  key={d}
                                                  active={this.props.difficulty === d}
                                                  onClick={_ => this.props.setDifficulty(d)}>
                                        {d}
                                    </DropdownItem>)
                            }
                        </DropdownMenu>
                    </ButtonDropdown>
                </NavbarBrand>
                <NavbarToggler onClick={this.toggleNavbar} />
                <Collapse navbar isOpen={!this.state.collapsed}>
                    <Nav
                        className="me-auto"
                        navbar
                    >
                        <NavItem>
                            <NavLink
                                href="#"
                                onClick={this.onClickPlay}
                                active={!this.props.playing}
                            >
                                Start Game
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href={Constants.URL_SOURCE_CODE as string}>
                                View Source Code
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <NavbarText>
                        Volume
                        <Input
                            onInput={this.onVolumeChange}
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
                </Collapse>
            </Navbar>
        </div>
    }
}
export default connect(mapGameStateToProps, mapDispatcherToProps)(Navigation);