import React, { Component } from 'react';
import {GameButton} from "./GameButton";

interface BoardProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    activeButton?: string;
}

export class GameBoard extends Component<BoardProps> {
    state = {}

    static colors = [ "yellow", "green", "blue", "red" ];

    render() {
        return <div className="simon-wrapper rev-spin-1">
            { GameBoard.colors.map((color) => {
                let isActive = (this.props.activeButton === color);
                return <GameButton
                        key={color}
                        colorSelectHandler={this.props.colorSelectHandler}
                        colorDeselectHandler={this.props.colorDeselectHandler}
                        color={color}
                        isActive={isActive}
                />
                })
            }
        </div>
    }
}