import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { Friend } from "@/types/availability"

// Use empty strings as fallbacks to prevent errors during build/SSR
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the Supabase client
export const supabase = supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : null

export type TimeSlot = {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export type CommonTimeSlot = {
  date: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  users: string[]
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DateAvailability = {
  date: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}



export async function getUserAvailability(userId: string) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("date_availability")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week")
    .order("start_time")

  if (error) {
    console.error("Error fetching availability:", error, userId)
    throw error
  }

  return data || []
}

export async function saveUserAvailability(userId: string, timeSlots: TimeSlot[]) {
  if (!supabase) return []
  // First, delete all existing availability for the user
  const { error: deleteError } = await supabase.from("availability").delete().eq("user_id", userId)

  if (deleteError) {
    console.error("Error deleting availability:", deleteError)
    throw deleteError
  }

  // Then, insert the new availability
  if (timeSlots.length === 0) return []

  const { data, error } = await supabase
    .from("availability")
    .insert(
      timeSlots.map((slot) => ({
        user_id: userId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
      })),
    )
    .select()

  if (error) {
    console.error("Error saving availability:", error)
    throw error
  }

  return data || []
}

export async function getUserFriends(userId: string) {
  if (!supabase) return [] as Friend[]

  // First, get all accepted friendships where the user is either user_id or friend_id
  const { data: friendships, error: friendshipsError } = await supabase
    .from("friends")
    .select("*")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted")
  // .or("status.eq.accepted, status.eq.pending")

  // if (friendshipsError) {
  //   console.error("Error fetching friendships:", friendshipsError)
  //   throw friendshipsError
  // }

  if (!friendships || friendships.length === 0) {
    return [] as Friend[];
  }

  // Extract the IDs of all friends
  const friendIds = friendships.map((friendship) =>
    friendship.user_id === userId ? friendship.friend_id : friendship.user_id,
  )

  // Fetch profiles for all friends
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", friendIds)

  if (profilesError) {
    console.error("Error fetching friend profiles:", profilesError)
    throw profilesError
  }

  // Map friendships to the expected format, including profile information
  const friends: Friend[] = friendships.map((friendship) => {
    const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id
    const profile = profiles?.find((p) => p.id === friendId)

    return {
      id: friendship.id,
      userId: userId,
      friendId: friendId,
      status: friendship.status,
      createdAt: friendship.created_at,
      updatedAt: friendship.updated_at,
      profile: profile
        ? {
          id: profile.id,
          username: profile.username,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        }
        : undefined,
    } as Friend;
  })

  return friends
}

export async function getPendingFriends(userId: string) {
  if (!supabase) return []

  // First, get all pending friendships where the requested user (friend_id) is user_id
  const { data: friendships, error: friendshipsError } = await supabase
    .from("friends")
    .select("*")
    .eq("friend_id", userId)
    .eq("status", "pending")
  // .or("status.eq.accepted, status.eq.pending")

  // if (friendshipsError) {
  //   console.error("Error fetching friendships:", friendshipsError)
  //   throw friendshipsError
  // }

  if (!friendships || friendships.length === 0) {
    return [] as Friend[];
  }

  // Extract the IDs of all friends
  const friendIds = friendships.map((friendship) =>
    friendship.user_id === userId ? friendship.friend_id : friendship.user_id,
  )

  // Fetch profiles for all friends
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", friendIds)

  if (profilesError) {
    console.error("Error fetching friend profiles:", profilesError)
    throw profilesError
  }

  // Map friendships to the expected format, including profile information
  const friends: Friend[] = friendships.map((friendship) => {
    const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id
    const profile = profiles?.find((p) => p.id === friendId)

    return {
      id: friendship.id,
      userId: userId,
      friendId: friendId,
      status: friendship.status,
      createdAt: friendship.created_at,
      updatedAt: friendship.updated_at,
      profile: profile
        ? {
          id: profile.id,
          username: profile.username,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        }
        : undefined,
    } as Friend;
  })

  return friends
}

export async function findCommonFreeTime(userIds: string[]) {
  if (!supabase) return []
  if (userIds.length === 0) return []

  // Get availability for all users
  const availabilityPromises = userIds.map((userId) => getUserAvailability(userId))
  const availabilityResults = await Promise.all(availabilityPromises)

  // Flatten and format the availability data
  const allAvailability = availabilityResults.flatMap((userAvailability, index) =>
    userAvailability.map((slot) => ({
      date: slot.date,
      userId: userIds[index],
      dayOfWeek: slot.day_of_week,
      startTime: slot.start_time,
      endTime: slot.end_time,
    })),
  )

  

  // Group by day of week
  const availabilityByDay = allAvailability.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    },
    {} as Record<string, typeof allAvailability>,
  )

  // console.log(availabilityByDay)

  // Find overlapping time slots for each day
  const commonTimeSlots: CommonTimeSlot[] = []

  Object.entries(availabilityByDay).forEach(([date, slots]) => {
    const timeline = slots
      .flatMap((slot) => [
        { time: slot.startTime, type: "start", userId: slot.userId },
        { time: slot.endTime, type: "end", userId: slot.userId },
      ])
      .sort((a, b) => a.time.localeCompare(b.time))
  
    const active = new Set<string>()
    let overlapStart: string | null = null
  
    for (const point of timeline) {
      if (point.type === "start") {
        active.add(point.userId)
      } else {
        active.delete(point.userId)
      }
  
      // All users are active
      if (active.size === userIds.length && !overlapStart) {
        overlapStart = point.time
      }
  
      // Overlap ends
      if (active.size < userIds.length && overlapStart) {
        if (overlapStart !== point.time) {
          commonTimeSlots.push({
            date: date,
            dayOfWeek: new Date(date).getDay() as DayOfWeek,
            startTime: overlapStart,
            endTime: point.time,
            users: [...userIds],
          })
        }
        overlapStart = null
      }
    }
  })
  
  // console.log(commonTimeSlots)
  return commonTimeSlots
}

export async function getUserDateAvailability(userId: string) {

  if (!supabase) return []

  const { data, error } = await supabase
    .from("date_availability")
    .select("*")
    .eq("user_id", userId)
    .order("date")
    .order("start_time")

  if (error) {
    console.error("Error fetching date availability:", error)
    throw error
  }

  return data || []

}



export async function saveDateAvailability(userId: string, dateAvailability: DateAvailability[]) {

  if (!supabase) return []



  // First, delete all existing date availability for the user

  const { error: deleteError } = await supabase.from("date_availability").delete().eq("user_id", userId)



  if (deleteError) {

    console.error("Error deleting date availability:", deleteError)

    throw deleteError

  }



  // Then, insert the new date availability

  if (dateAvailability.length === 0) return []

  const { data, error } = await supabase
    .from("date_availability")
    .insert(
      dateAvailability.map((slot) => ({
        user_id: userId,
        date: slot.date,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
      })),
    )
    .select()

  if (error) {
    console.error("Error saving date availability:", error)
    throw error
  }

  return data || []

}