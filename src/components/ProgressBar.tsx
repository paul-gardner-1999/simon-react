import {Progress} from "reactstrap";

interface IProps {
    stage: number,
    maxStages: number
}

export function ProgressBar({stage, maxStages}: IProps) {
    const percentage = (stage / maxStages) * 100;
    const ok = Math.min(percentage, 30);
    const good = Math.max(Math.min(percentage, 60) - 30,0);
    const great = Math.max(Math.min(percentage, 85) - 60,0);
    const awesome = Math.max(percentage - 85,0);

    return  <Progress multi className="progress">
        <Progress bar animated striped value={ok}> OK </Progress>
        <Progress bar animated striped value={good} color="success"> Good </Progress>
        <Progress bar animated striped value={great} color="warning"> Great </Progress>
        <Progress bar animated striped value={awesome} color="danger"> Awesome </Progress>
    </Progress>
}

