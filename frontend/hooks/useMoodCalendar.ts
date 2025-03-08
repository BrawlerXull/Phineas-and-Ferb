import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useUser } from '@clerk/clerk-react'
import { setCheckIns } from '@/redux/slices/checkInsSlice'


type Mood = 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry'

export const useMoodCalendar = () => {
  const dispatch = useDispatch()
  const { user, isLoaded } = useUser()
  const checkIns = useSelector((state: any) => state.checkIns.checkIns)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedCheckIn, setSelectedCheckIn] = useState<{ mood: Mood; activities: string; thoughts: string } | null>(null)

  useEffect(() => {
    if (!isLoaded || !user) return

    async function fetchCheckIns() {
      try {
        const userId = user?.id
        const res = await fetch(`/api/check-in?userId=${userId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch check-ins')
        }
        const data = await res.json()

        if (data.checkIns) {
          dispatch(setCheckIns(data.checkIns))
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchCheckIns()
  }, [user, isLoaded, dispatch])

  const normalizeToMidnightUTC = (date: Date) => {
    const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
    return normalizedDate
  }

  const getDayDetails = useCallback((date: Date) => {
    const normalizedDate = normalizeToMidnightUTC(date)
    const dateString = normalizedDate.toISOString().split('T')[0]
    return checkIns[dateString]
  }, [checkIns])

  const getDayMood = (date: Date) => {
    const normalizedDate = normalizeToMidnightUTC(date)
    const dateString = normalizedDate.toISOString().split('T')[0]
    return checkIns[dateString]?.mood
  }

  useEffect(() => {
    if (selectedDate) {
      const details = getDayDetails(selectedDate)
      setSelectedCheckIn(details || null)
    }
  }, [selectedDate, getDayDetails])

  const safeSelectedDate = selectedDate ?? new Date()

  return {
    selectedDate,
    setSelectedDate,
    selectedCheckIn,
    getDayMood,
    safeSelectedDate
  }
}
