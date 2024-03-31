import React, {Component} from "react";

interface GameButtonProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    color: string;
    isActive: boolean;
    key: string;
}

export function GameButton({colorSelectHandler, colorDeselectHandler, color, isActive, key}: GameButtonProps) {

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


    return <div
        className={`simon-button  ${color} ${(isActive) ? ' active' : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
    />

}


