import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Create a default user for demo purposes
async function ensureDefaultUser() {
  const existingUser = await db.user.findUnique({
    where: { email: 'demo@habits.com' }
  })
  
  if (!existingUser) {
    await db.user.create({
      data: {
        email: 'demo@habits.com',
        name: 'Demo User',
        theme: 'light',
        language: 'en'
      }
    })
    }
  
  return existingUser
}

export async function GET() {
  try {
    const user = await ensureDefaultUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 500 })
    }
    
    // Add demo data if no habits exist
    const existingHabits = await db.habit.findMany({
      where: { userId: user.id }
    })
    
    if (existingHabits.length === 0) {
      const demoHabits = [
        {
          userId: user.id,
          name: 'Study 2 Hours',
          category: 'Study',
          type: 'measurable',
          frequency: 'daily',
          targetValue: 2,
          unit: 'hours',
          color: '#3b82f6',
          position: 0,
          isPinned: true,
          isActive: true,
          startDate: new Date(),
          repeatDays: JSON.stringify([1, 2, 3, 4, 5]),
          allowSkip: true,
          allowedMisses: 1
        },
        {
          userId: user.id,
          name: 'Drink 8 Glasses of Water',
          category: 'Health',
          type: 'measurable',
          frequency: 'daily',
          targetValue: 8,
          unit: 'glasses',
          color: '#06b6d4',
          position: 1,
          isPinned: false,
          isActive: true,
          startDate: new Date(),
          repeatDays: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
          allowSkip: true,
          allowedMisses: 2
        },
        {
          userId: user.id,
          name: 'Meditate',
          category: 'Mindfulness',
          type: 'yesno',
          frequency: 'daily',
          targetValue: 1,
          color: '#8b5cf6',
          position: 2,
          isPinned: false,
          isActive: true,
          startDate: new Date(),
          repeatDays: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
          allowSkip: true,
          allowedMisses: 0
        },
        {
          userId: user.id,
          name: 'Morning Workout',
          category: 'Fitness',
          type: 'yesno',
          frequency: 'daily',
          targetValue: 1,
          color: '#10b981',
          position: 3,
          isPinned: false,
          isActive: true,
          startDate: new Date(),
          repeatDays: JSON.stringify([1, 2, 3, 4, 5]),
          allowSkip: false,
          allowedMisses: 0
        }
      ]

      await db.habit.createMany({
        data: demoHabits
      })
    }
    
    // Fetch all habits
    const allHabits = await db.habit.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      orderBy: [
        { isPinned: 'desc' },
        { position: 'asc' }
      ]
    })

    // Transform habits for frontend
    const habitsWithStats = allHabits.map(habit => {
      // Mock stats for demo
      const todayCompleted = Math.random() > 0.5
      const currentStreak = Math.floor(Math.random() * 20) + 1
      const longestStreak = currentStreak + Math.floor(Math.random() * 30)
      const completionRate = Math.floor(Math.random() * 30) + 70

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        progress: todayCompleted ? habit.targetValue : Math.floor(habit.targetValue * Math.random()),
        target: habit.targetValue,
        unit: habit.unit,
        streak: currentStreak,
        icon: habit.type === 'measurable' ? 'BookOpen' : habit.type === 'yesno' ? 'Brain' : 'Heart',
        color: habit.color,
        completed: todayCompleted,
        timeSpent: todayCompleted ? Math.floor(Math.random() * 120) + 60 : undefined,
        longestStreak,
        completionRate,
        repeatDays: habit.repeatDays ? JSON.parse(habit.repeatDays) : []
      }
    })

    return NextResponse.json(habitsWithStats)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureDefaultUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 500 })
    }
    
    const data = await request.json()
    
    const habit = await db.habit.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || '',
        category: data.category,
        type: data.type,
        frequency: data.frequency,
        targetValue: data.type === 'measurable' ? parseInt(data.targetValue) : null,
        unit: data.type === 'measurable' ? data.unit : null,
        color: data.color || '#3b82f6',
        repeatDays: data.repeatDays ? JSON.stringify(data.repeatDays) : null,
        allowSkip: data.allowSkip,
        allowedMisses: data.allowedMisses,
        position: data.position || 0
      }
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}