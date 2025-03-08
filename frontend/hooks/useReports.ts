import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useUser } from '@clerk/clerk-react'
import { setGraphData } from '@/redux/slices/reportSlice'


type Mood = 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry'

const moodScores: Record<Mood, number> = {
  happy: 10,
  neutral: 7,
  anxious: 5,
  sad: 3,
  angry: 1
}

interface TransformedData {
    date: string;
    moodScore: number;
}

interface CheckIn {
  createdAt: string;
  mood: Mood;
  activities: string;
  thoughts: string;
}

export function useReports() {
  const dispatch = useDispatch()
  const { user, isLoaded } = useUser()
  const checkIns = useSelector((state: any) => state.checkIns.checkIns)
  const graphData = useSelector((state: any) => state.report.graphData)

  useEffect(() => {
    if (!isLoaded || !user) return

    async function fetchCheckIns() {
      try {
        const userId = user?.id
        if (!userId) return

        const res = await fetch(`/api/check-in?userId=${userId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch check-ins')
        }
        const data = await res.json()

        if (data.checkIns) {
            const transformedData: TransformedData[] = data.checkIns.map((checkIn: CheckIn) => ({
                date: checkIn.createdAt.split('T')[0],
                moodScore: moodScores[checkIn.mood]
            }))
          
            const sortedData = transformedData.sort((a: TransformedData, b: TransformedData) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          dispatch(setGraphData(sortedData))
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchCheckIns()
  }, [user, isLoaded, dispatch])

  return { graphData, checkIns }
}
