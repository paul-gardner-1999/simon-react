import React, { Component } from 'react';

interface BoardProps {
    clickHandler: Function;
    activeButton?: string;
}

export class GameBoard extends Component<BoardProps> {
    state = {}
    
    static colors = [ "yellow", "green", "blue", "red" ];

    handleClick(color: string) {
        if (this.props.clickHandler) {
            this.props.clickHandler(color);
        }
    }

    render() {
        return <div className="simon-wrapper rev-spin-1">
            { GameBoard.colors.map((color) => {
                let isActive = (this.props.activeButton === color);
                return <div key={color} className={'simon-button ' + color + ((isActive) ? ' active' : '')}
                            onMouseDown={() => this.handleClick(color)}
                />
                })
            }
        </div>
    }
}