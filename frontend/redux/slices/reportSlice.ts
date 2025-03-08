import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Mood = 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry'

const moodScores: Record<Mood, number> = {
  happy: 10,
  neutral: 7,
  anxious: 5,
  sad: 3,
  angry: 1
}

interface ReportData {
  date: string;
  moodScore: number;
}

interface ReportState {
  graphData: ReportData[];
}

const initialState: ReportState = {
  graphData: []
}

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setGraphData(state, action: PayloadAction<ReportData[]>) {
      state.graphData = action.payload
    }
  }
})

export const { setGraphData } = reportSlice.actions
export default reportSlice.reducer
