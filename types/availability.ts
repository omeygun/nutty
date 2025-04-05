export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday, etc.

export interface TimeSlot {
  id?: string
  dayOfWeek: DayOfWeek
  startTime: string // Format: "HH:MM" (24-hour)
  endTime: string // Format: "HH:MM" (24-hour)
}

export interface DateAvailability {
  id?: string
  dayOfWeek: DayOfWeek
  date: string // Format: "YYYY-MM-DD"
  startTime: string // Format: "HH:MM" (24-hour)
  endTime: string // Format: "HH:MM" (24-hour)
}

export interface AvailabilitySlot extends TimeSlot {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  updatedAt: string
  profile: UserProfile
}

// Update the UserProfile interface to include firstName and lastName
export interface UserProfile {
  id: string
  username: string | null
  fullName: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CommonTimeSlot {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  users: string[] // User IDs who are available during this slot
}

