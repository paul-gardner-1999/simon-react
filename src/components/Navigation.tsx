import React, {Component }from 'react';
import {Navbar, Nav, NavbarBrand, NavbarToggler, Input, Button} from "reactstrap";
import {NavItem, NavLink, NavbarText} from "reactstrap";
import {Collapse} from "reactstrap";
import {connect} from "react-redux";
import {IRootState} from "../store";
import {GameActions} from "../store/types";
import {Dispatch} from "redux";
import * as actions from '../store/actions';
import './Navigation.css';

interface IState {
    collapsed: boolean
}

const mapDispatcherToProps = (dispatch: Dispatch<GameActions>) => {
    return {
        setVolume: (volume: number) => dispatch(actions.setVolume(volume)),
        setPlaying: (playing: boolean) => dispatch(actions.setPlaying(playing))
    }
}

export const mapGameStateToProps = ({ game }: IRootState) => {
    const { playing, volume } = game;
    return { playing, volume };
}
export type ReduxType = ReturnType<typeof mapGameStateToProps> & ReturnType<typeof mapDispatcherToProps>;

export class Navigation extends Component<ReduxType, IState> {
    static displayName = Navigation.name;


    constructor (props: ReduxType) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.onVolumeChange = this.onVolumeChange.bind(this);
        this.onClickPlay = this.onClickPlay.bind(this);
        this.state = {
            collapsed: true
        };
    }

    toggleNavbar () {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        this.props.setVolume(Number(value));
    }
    onClickPlay() {
        this.props.setPlaying(true);
        console.log("Start Game");
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
                    <Button key="Play"
                            onClick={this.onClickPlay}
                            active={!this.props.playing}
                    >
                        Start Game
                    </Button>
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
                            <NavLink href="https://github.com/reactstrap/reactstrap">
                                GitHub
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
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            list="volume-vals"
                        />
                        <datalist id="volume-vals">
                            <option value="0" label="min"/>
                            <option value="2" label="max"/>
                        </datalist>
                    </NavbarText>
                </Collapse>
            </Navbar>
        </div>
    }
}
export default connect(mapGameStateToProps, mapDispatcherToProps)(Navigation);