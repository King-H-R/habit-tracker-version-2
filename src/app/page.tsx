import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Habit {
  id: string
  name: string
  category: string
  progress: number
  target: number
  unit?: string
  streak: number
  icon: string
  color: string
  completed: boolean
  timeSpent?: number
  longestStreak: number
  completionRate: number
  repeatDays: number[]
}

interface UserStats {
  currentStreak: number
  longestStreak: number
  completionRate: number
  bestDay: string
  totalHabits: number
  completedToday: number
}

// Mock data
const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Study 2 Hours',
    category: 'Study',
    progress: 1,
    target: 2,
    unit: 'hours',
    streak: 15,
    icon: 'BookOpen',
    color: '#3b82f6',
    completed: true,
    timeSpent: 120,
    longestStreak: 45,
    completionRate: 92
  },
    {
      id: '2',
      name: 'Drink 8 Glasses of Water',
      category: 'Health',
      progress: 6,
      target: 8,
      unit: 'glasses',
      streak: 8,
      icon: 'Heart',
      color: '#06b6d4',
      completed: false,
      longestStreak: 23,
      completionRate: 78
    }
  },
    {
      id: '3',
      name: 'Meditate',
      category: 'Mindfulness',
      type: 'yesno',
      frequency: 'daily',
      targetValue: 1,
      color: '#8b5cf6',
      streak: 20,
      icon: 'Brain',
      color: '#8b5cf6',
      completed: true,
      timeSpent: 60,
      longestStreak: 60,
      completionRate: 95
    }
  },
    {
      id: '4',
      name: 'Morning Workout',
      category: 'Fitness',
      type: 'yesno',
      frequency: 'daily',
      targetValue: 1,
      color: '#10b981',
      streak: 12,
      icon: 'Dumbbell',
      color: '#10b981',
      completed: false,
      timeSpent: 0,
      longestStreak: 30,
      completionRate: 85
    }
  }
  }
]

const mockStats: UserStats = {
  currentStreak: 20,
  longestStreak: 60,
  completionRate: 87,
  bestDay: 'Monday',
  totalHabits: 4,
  completedToday: 2
}

export default function HabitTrackerApp() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userName, setUserName] = useState('Vimal')
  const [greeting, setGreeting] = useState('')

  const loadHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        setHabits(response)
      } else {
        console.error('Failed to load habits')
      }
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const completedToday = habits.filter(h => h.completed).length
  const totalHabits = habits.length
  const overallProgress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0

  const toggleHabitComplete = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      })
      
      if (response.ok) {
        setHabits(habits.map(habit => 
          habit.id === habitId 
            ? { ...habit, completed: !habit.completed, progress: habit.completed ? 0 : habit.target }
            : habit
        ))
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const addHabit = async (formData: any) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const newHabit = await response.json()
        setHabits([...habits, newHabit])
        setShowAddHabit(false)
      }
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent border-r-transparent"></div>
      </div>
    )

    return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
         style={{
           background: isDarkMode 
             ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
             : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
         }}>
      {/* Header */}
      <header className="p-6 pb-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              <span>{greeting}, {userName} 👋</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Build better habits, one day at a time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddHabit(true)}
              className="p-3 rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => {
            const progressPercentage = (habit.progress / habit.target) * 100
                
            return (
              <Card key={habit.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {habit.name}
                      </h3>
                      <Badge variant="secondary">{habit.category}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {habit.streak > 0 && (
                        <Badge className="bg-orange-500 text-white">
                          🔥 {habit.streak} days
                        </Badge>
                      )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Ring */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle
                                  cx="40"
                                  cy="40"
                                  r="36"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="none"
                                  className="text-gray-200 dark:text-gray-700"
                                />
                        <circle
                                  cx="40"
                                  cy="40"
                                  r="36"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="none"
                                  className="text-gray-200 dark:text-gray-700"
                                />
                        <circle
                                  cx="40"
                                  cy="40"
                                  r="36"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 36}`}
                                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercentage / 100)}`}
                                  className="transition-all duration-500"
                                  style={{ 
                                    stroke: habit.color,
                                    strokeLinecap: 'round'
                                  }}
                                />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {Math.round(progressPercentage)}%
                              </span>
                            </div>
                          </svg>
                        </div>
                    </div>
                  </div>

                  {/* Progress Details */}
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {habit.progress}/{habit.target} {habit.unit}
                    </p>
                    {habit.streak > 0 && (
                        <Badge className="bg-orange-500 text-white">
                          🔥 {habit.streak} day streak
                        </Badge>
                        )}
                      </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleHabitComplete(habit.id)}
                      className={`flex-1 rounded-lg py-3 font-medium transition-all ${
                        habit.completed
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      }`}
                    >
                      {habit.completed ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          {habit.timeSpent ? `${Math.floor(habit.timeSpent / 60)}h ${habit.timeSpent % 60}m` : 'View Timer'
                          </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Mark Done
                          </>
                          </>
                      )}
                        </Button>
                      </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </main>
    </div>
  )
}