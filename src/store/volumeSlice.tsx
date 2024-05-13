import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface VolumeSliceType {
    volume: number
}
const INITIAL_VOLUME = 0.2
const volumeSlice = createSlice({
    name: 'volume',
    initialState: {
        volume: INITIAL_VOLUME
    } as VolumeSliceType,
    reducers: {
        setVolume(state, action: PayloadAction<number>) {
            console.log(`Setting payload to ${action.payload}`)
            state.volume = action.payload
        },
        resetVolume(state) {
            state.volume = INITIAL_VOLUME
        },
    },
})

export const { setVolume, resetVolume} = volumeSlice.actions
export const selectVolume = (state: any) : number => state.volume.volume

export default volumeSlice.reducer

