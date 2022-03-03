import React, { Component } from 'react';

interface BoardProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    activeButton?: string;
}

export class GameBoard extends Component<BoardProps> {
    state = {}

    static colors = [ "yellow", "green", "blue", "red" ];
    private readonly onPointerDown: OmitThisParameter<(e: any) => void>;
    private readonly onPointerUp: OmitThisParameter<(e: any) => void>;

    constructor(props: BoardProps) {
        super(props);
        this.onPointerDown = this.handlePointerDown.bind(this);
        this.onPointerUp = this.handlePointerUp.bind(this);
    }

    handlePointerDown(event: React.ChangeEvent<HTMLDivElement>) {
        let color = event.target.getAttribute('color-name');
        if (this.props.colorSelectHandler) {
            this.props.colorSelectHandler(color);
        }
    }

    handlePointerUp(event: React.ChangeEvent<HTMLDivElement>) {
        let color = event.target.getAttribute('color-name');
        if (this.props.colorDeselectHandler) {
            this.props.colorDeselectHandler(color);
        }
    }
    render() {
        return <div className="simon-wrapper rev-spin-1">
            { GameBoard.colors.map((color) => {
                let isActive = (this.props.activeButton === color);
                return <div key={color}
                            color-name={color}
                            className={'simon-button ' + color + ((isActive) ? ' active' : '')}
                            onPointerDown={this.onPointerDown}
                            onPointerUp={this.onPointerUp}
                            onPointerLeave={this.onPointerUp}
                />
                })
            }
        </div>
    }
}