import React, { Component} from "react";

interface GameButtonProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    color: string;
    isActive: boolean;
    key: string;
}

export class GameButton extends Component<GameButtonProps> {


    private readonly onPointerDown: OmitThisParameter<(e: any) => void>;
    private readonly onPointerUp: OmitThisParameter<(e: any) => void>;

    constructor(props: GameButtonProps) {
        super(props);
        this.onPointerDown = this.handlePointerDown.bind(this);
        this.onPointerUp = this.handlePointerUp.bind(this);
    }

    handlePointerDown(_: React.ChangeEvent<HTMLDivElement>) {
        if (this.props.colorSelectHandler) {
            this.props.colorSelectHandler(this.props.color);
        }
    }

    handlePointerUp(_: React.ChangeEvent<HTMLDivElement>) {
        if (this.props.colorDeselectHandler) {
            this.props.colorDeselectHandler(this.props.color);
        }
    }

    render() {
        return <div
                    className={`simon-button  ${this.props.color} ${(this.props.isActive)?' active':''}`}
                    onPointerDown={this.onPointerDown}
                    onPointerUp={this.onPointerUp}
                    onPointerLeave={this.onPointerUp}
                />
    }

}

