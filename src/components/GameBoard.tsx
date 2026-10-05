import {GameButton} from "./GameButton";
import type {Color, Tone} from "../game/simon";

interface BoardProps {
    colorSelectHandler: (color: Color) => void;
    colorDeselectHandler: (color: Color) => void;
    activeButton?: Tone;
    colors: readonly Color[]
}


export function GameBoard({colorSelectHandler, colorDeselectHandler, activeButton, colors}: BoardProps) {

    return <div className="simon-wrapper rev-spin-1">
        {colors.map((color) => {
            const isActive = (activeButton === color);
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
