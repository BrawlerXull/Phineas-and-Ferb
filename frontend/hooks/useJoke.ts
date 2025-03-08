import { useState, useEffect } from 'react'

export function useJoke() {
  const [joke, setJoke] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const fetchJoke = async () => {
      try {
        const response = await fetch("https://icanhazdadjoke.com/", {
          headers: { "Accept": "application/json" }
        })
        const data = await response.json()
        setJoke(data.joke)
        setIsVisible(true)
      } catch (error) {
        console.error("Failed to fetch joke:", error)
      }
    }

    const timer = setTimeout(() => {
      fetchJoke()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return { joke, isVisible, setIsVisible }
}
