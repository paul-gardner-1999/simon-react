import React, { Component } from 'react';

interface BoardProps {
    clickHandler: Function;
    activeButton?: string;
}

export class GameBoard extends Component<BoardProps> {
    state = {
        activeButton: undefined
    }
    
    static colors = [
        { color: "yellow", className: 'simon-tl' },
        { color: "green", className: 'simon-tr' },
        { color: "blue", className: 'simon-bl' },
        { color: "red", className: 'simon-br' },
    ];

    handleClick(color: string) {
        if (this.props.clickHandler) {
            this.props.clickHandler(color);
        }
    }

    render() {
        let rand = Math.random() * 100000;
        return <div className="simon-wrapper">
            { GameBoard.colors.map(({color, className}) => {
                let isActive = (this.props.activeButton === color);
                let key = (isActive)?color + rand: color;
                return <div key={key} className={className + ((isActive) ? ' active' : '')}
                            onMouseDown={() => this.handleClick(color)}
                />
                })
            }
        </div>
    }
}