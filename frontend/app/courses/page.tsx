"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Play } from "lucide-react"

type Module = {
  id: number
  title: string
  description: string
  duration: string
  completed: boolean
}

type Course = {
  id: number
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  instructor: string
  duration: string
  modules: Module[]
  progress: number
  image: string
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: "Introduction to Mindfulness",
    description: "Learn the basics of mindfulness meditation and how to incorporate it into your daily life.",
    difficulty: "Beginner",
    instructor: "Dr. Sarah Johnson",
    duration: "4 weeks",
    modules: [
      {
        id: 1,
        title: "What is Mindfulness?",
        description: "An introduction to the concept of mindfulness.",
        duration: "15 min",
        completed: true,
      },
      {
        id: 2,
        title: "Breath Awareness",
        description: "Learn to focus on your breath as an anchor for mindfulness.",
        duration: "20 min",
        completed: true,
      },
      {
        id: 3,
        title: "Body Scan Meditation",
        description: "Practice bringing awareness to different parts of your body.",
        duration: "25 min",
        completed: false,
      },
      {
        id: 4,
        title: "Mindful Eating",
        description: "Apply mindfulness to your eating habits.",
        duration: "20 min",
        completed: false,
      },
      {
        id: 5,
        title: "Mindfulness in Daily Life",
        description: "Strategies for incorporating mindfulness into everyday activities.",
        duration: "30 min",
        completed: false,
      },
    ],
    progress: 40,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Stress Reduction Techniques",
    description: "Discover effective techniques to manage and reduce stress in your life.",
    difficulty: "Intermediate",
    instructor: "Dr. Michael Chen",
    duration: "6 weeks",
    modules: [
      {
        id: 6,
        title: "Understanding Stress",
        description: "Learn about the physiological and psychological aspects of stress.",
        duration: "25 min",
        completed: true,
      },
      {
        id: 7,
        title: "Deep Breathing Exercises",
        description: "Practice deep breathing techniques to calm your nervous system.",
        duration: "20 min",
        completed: false,
      },
      {
        id: 8,
        title: "Progressive Muscle Relaxation",
        description: "Learn to release tension in your body through progressive relaxation.",
        duration: "30 min",
        completed: false,
      },
      {
        id: 9,
        title: "Cognitive Restructuring",
        description: "Change stress-inducing thought patterns.",
        duration: "35 min",
        completed: false,
      },
      {
        id: 10,
        title: "Time Management",
        description: "Strategies for managing your time to reduce stress.",
        duration: "25 min",
        completed: false,
      },
      {
        id: 11,
        title: "Creating a Stress-Reduction Plan",
        description: "Develop a personalized plan for ongoing stress management.",
        duration: "40 min",
        completed: false,
      },
    ],
    progress: 16,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Advanced Meditation Practices",
    description: "Deepen your meditation practice with advanced techniques and longer sessions.",
    difficulty: "Advanced",
    instructor: "Dr. Emily Rodriguez",
    duration: "8 weeks",
    modules: [
      {
        id: 12,
        title: "Loving-Kindness Meditation",
        description: "Cultivate feelings of love and compassion for yourself and others.",
        duration: "30 min",
        completed: false,
      },
      {
        id: 13,
        title: "Visualization Techniques",
        description: "Use visualization to enhance your meditation practice.",
        duration: "35 min",
        completed: false,
      },
      {
        id: 14,
        title: "Open Awareness Meditation",
        description: "Practice maintaining awareness without focusing on any particular object.",
        duration: "40 min",
        completed: false,
      },
      {
        id: 15,
        title: "Walking Meditation",
        description: "Learn to meditate while walking.",
        duration: "30 min",
        completed: false,
      },
      {
        id: 16,
        title: "Sound Meditation",
        description: "Use sound as a focus for meditation.",
        duration: "35 min",
        completed: false,
      },
      {
        id: 17,
        title: "Extended Silent Meditation",
        description: "Practice longer periods of silent meditation.",
        duration: "60 min",
        completed: false,
      },
      {
        id: 18,
        title: "Integrating Meditation into Daily Life",
        description: "Strategies for maintaining a consistent advanced practice.",
        duration: "45 min",
        completed: false,
      },
    ],
    progress: 0,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Sleep Improvement Program",
    description: "Improve your sleep quality through meditation and relaxation techniques.",
    difficulty: "Beginner",
    instructor: "Dr. James Wilson",
    duration: "4 weeks",
    modules: [
      {
        id: 19,
        title: "Understanding Sleep",
        description: "Learn about the science of sleep and its importance for mental health.",
        duration: "20 min",
        completed: false,
      },
      {
        id: 20,
        title: "Creating a Sleep-Friendly Environment",
        description: "Tips for optimizing your sleep environment.",
        duration: "15 min",
        completed: false,
      },
      {
        id: 21,
        title: "Bedtime Relaxation Techniques",
        description: "Practices to help you relax before bed.",
        duration: "25 min",
        completed: false,
      },
      {
        id: 22,
        title: "Dealing with Insomnia",
        description: "Strategies for managing insomnia and sleep difficulties.",
        duration: "30 min",
        completed: false,
      },
      {
        id: 23,
        title: "Maintaining Healthy Sleep Habits",
        description: "Long-term strategies for good sleep hygiene.",
        duration: "20 min",
        completed: false,
      },
    ],
    progress: 0,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [filter, setFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All")

  const filteredCourses = filter === "All" ? courses : courses.filter((course) => course.difficulty === filter)

  const handleModuleCompletion = (courseId: number, moduleId: number) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const updatedModules = course.modules.map((module) =>
            module.id === moduleId ? { ...module, completed: true } : module,
          )
          const completedModules = updatedModules.filter((m) => m.completed).length
          const progress = Math.round((completedModules / updatedModules.length) * 100)

          return {
            ...course,
            modules: updatedModules,
            progress,
          }
        }
        return course
      }),
    )

    if (selectedCourse && selectedCourse.id === courseId) {
      const updatedModules = selectedCourse.modules.map((module) =>
        module.id === moduleId ? { ...module, completed: true } : module,
      )
      const completedModules = updatedModules.filter((m) => m.completed).length
      const progress = Math.round((completedModules / updatedModules.length) * 100)

      setSelectedCourse({
        ...selectedCourse,
        modules: updatedModules,
        progress,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meditation & Stress Relief Courses</h1>
        <div className="flex space-x-2">
          <Button variant={filter === "All" ? "default" : "outline"} onClick={() => setFilter("All")}>
            All
          </Button>
          <Button variant={filter === "Beginner" ? "default" : "outline"} onClick={() => setFilter("Beginner")}>
            Beginner
          </Button>
          <Button variant={filter === "Intermediate" ? "default" : "outline"} onClick={() => setFilter("Intermediate")}>
            Intermediate
          </Button>
          <Button variant={filter === "Advanced" ? "default" : "outline"} onClick={() => setFilter("Advanced")}>
            Advanced
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{course.title}</CardTitle>
                <Badge>{course.difficulty}</Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Instructor: {course.instructor}</span>
                  <span>Duration: {course.duration}</span>
                </div>
                <Progress value={course.progress} />
                <p className="text-xs text-right">{course.progress}% complete</p>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedCourse(course)}>View Course</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  {selectedCourse && (
                    <>
                      <DialogHeader>
                        <DialogTitle>{selectedCourse.title}</DialogTitle>
                        <DialogDescription>{selectedCourse.description}</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm">Instructor: {selectedCourse.instructor}</p>
                            <p className="text-sm">Duration: {selectedCourse.duration}</p>
                          </div>
                          <Badge>{selectedCourse.difficulty}</Badge>
                        </div>
                        <Progress value={selectedCourse.progress} />
                        <p className="text-xs text-right">{selectedCourse.progress}% complete</p>

                        <h3 className="font-semibold text-lg mt-4">Modules</h3>
                        <ScrollArea className="h-[300px]">
                          {selectedCourse.modules.map((module) => (
                            <Card key={module.id} className="mb-4">
                              <CardHeader className="py-3">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">{module.title}</CardTitle>
                                  {module.completed ? (
                                    <Badge variant="secondary" className="flex items-center">
                                      <Check className="mr-1 h-3 w-3" /> Completed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">{module.duration}</Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="py-2">
                                <p className="text-sm">{module.description}</p>
                              </CardContent>
                              <CardFooter className="py-3">
                                <div className="flex space-x-2">
                                  <Button size="sm" className="flex items-center">
                                    <Play className="mr-1 h-4 w-4" /> Start
                                  </Button>
                                  {!module.completed && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleModuleCompletion(selectedCourse.id, module.id)}
                                    >
                                      Mark as Completed
                                    </Button>
                                  )}
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

