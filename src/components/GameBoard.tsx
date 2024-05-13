import React from 'react';
import {GameButton} from "./GameButton";

interface BoardProps {
    colorSelectHandler: Function;
    colorDeselectHandler: Function;
    activeButton?: string;
    colors: string[]
}


export function GameBoard({colorSelectHandler, colorDeselectHandler, activeButton, colors}: BoardProps) {

    return <div className="simon-wrapper rev-spin-1">
        {colors.map((color) => {
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
