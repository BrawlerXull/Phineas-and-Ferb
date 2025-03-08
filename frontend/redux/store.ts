import { configureStore } from '@reduxjs/toolkit'
import checkInsReducer from './slices/checkInsSlice'
import reportReducer from './slices/reportSlice'

const store = configureStore({
  reducer: {
    checkIns: checkInsReducer,
    report: reportReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
