import React, {Component} from "react";
import {Progress} from "reactstrap";

interface IProps {
    stage: number,
    maxStages: number
}

export class ProgressBar extends Component<IProps> {

    render() {
        let percentage = (this.props.stage / this.props.maxStages) * 100;
        let ok = Math.min(percentage, 30);
        let good = Math.max(Math.min(percentage, 60) - 30,0);
        let great = Math.max(Math.min(percentage, 85) - 60,0);
        let awesome = Math.max(percentage - 85,0);
        return (
            <Progress multi className="progress">
                <Progress bar animated striped value={ok}> OK </Progress>
                <Progress bar animated striped value={good} color="success"> Good </Progress>
                <Progress bar animated striped value={great} color="warning"> Great </Progress>
                <Progress bar animated striped value={awesome} color="danger"> Awesome </Progress>
            </Progress>
        );
    }
}