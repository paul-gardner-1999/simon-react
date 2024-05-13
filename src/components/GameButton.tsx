import React from "react";

interface GameButtonProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    color: string;
    isActive: boolean;
}

export function GameButton({colorSelectHandler, colorDeselectHandler, color, isActive}: GameButtonProps) {

    function onPointerDown(_: React.PointerEvent<HTMLDivElement>) {
        if (colorSelectHandler) {
            colorSelectHandler(color);
        }
    }

    function onPointerUp(_: React.PointerEvent<HTMLDivElement>) {
        if (colorDeselectHandler) {
            colorDeselectHandler(color);
        }
    }


    return <div key={color}
        className={`simon-button  ${color} ${(isActive) ? ' active' : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
    />

}


