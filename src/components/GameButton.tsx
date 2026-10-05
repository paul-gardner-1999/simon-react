import type {Color} from "../game/simon";

interface GameButtonProps {
    colorSelectHandler: (color: Color) => void;
    colorDeselectHandler: (color: Color) => void;
    color: Color;
    isActive: boolean;
}

export function GameButton({colorSelectHandler, colorDeselectHandler, color, isActive}: GameButtonProps) {

    function onPointerDown() {
        colorSelectHandler(color);
    }

    function onPointerUp() {
        colorDeselectHandler(color);
    }


    return <div
        className={`simon-button  ${color} ${(isActive) ? ' active' : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
    />

}


