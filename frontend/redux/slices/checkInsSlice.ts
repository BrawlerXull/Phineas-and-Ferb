import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Mood = 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry'

interface CheckIn {
  createdAt: string;
  mood: Mood;
  activities: string;
  thoughts: string;
}

interface CheckInsState {
  checkIns: Record<string, { mood: Mood; activities: string; thoughts: string }>;
}

const initialState: CheckInsState = {
  checkIns: {}
}

const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState,
  reducers: {
    setCheckIns(state, action: PayloadAction<CheckIn[]>) {
      state.checkIns = action.payload.reduce((acc, checkIn) => {
        const dateString = checkIn.createdAt.split('T')[0] 
        acc[dateString] = { mood: checkIn.mood, activities: checkIn.activities, thoughts: checkIn.thoughts }
        return acc
      }, {} as Record<string, { mood: Mood; activities: string; thoughts: string }>)
    }
  }
})

export const { setCheckIns } = checkInsSlice.actions
export default checkInsSlice.reducer
