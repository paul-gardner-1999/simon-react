import React, {Component} from 'react';
import {GameButton} from "./GameButton";

interface BoardProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    activeButton?: string;
}


export const COLORS = ["yellow", "green", "blue", "red"]
export function GameBoard({colorSelectHandler, colorDeselectHandler, activeButton}: BoardProps) {

    return <div className="simon-wrapper rev-spin-1">
        {COLORS.map((color) => {
            let isActive = (activeButton === color);
            return <GameButton
                key={color}
                colorSelectHandler={colorSelectHandler}
                colorDeselectHandler={colorDeselectHandler}
                color={color}
                isActive={isActive}
            />
        })
        }
    </div>

}
