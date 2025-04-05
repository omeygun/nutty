"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserFriends } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Friend } from "@/types/availability"

interface FriendSelectorProps {
  selectedFriends: string[]
  onChange: (selectedFriends: string[]) => void
}

export function FriendSelector({ selectedFriends, onChange }: FriendSelectorProps) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFriends = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const friendsList = await getUserFriends(user.id)
        setFriends(friendsList || [] as Friend[])
      } catch (err) {
        console.error("Error loading friends:", err)
        setError("Failed to load friends. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, [user])

  const handleToggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      onChange(selectedFriends.filter((id) => id !== friendId))
    } else {
      onChange([...selectedFriends, friendId])
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Friends</CardTitle>
        <CardDescription>Choose friends to find common free time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p>Loading friends...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">You don't have any friends yet.</p>
            <p className="text-muted-foreground mt-2">Add friends in the Friends section to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
                <Checkbox
                  id={`friend-${friend.friendId}`}
                  checked={selectedFriends.includes(friend.friendId)}
                  onCheckedChange={() => handleToggleFriend(friend.friendId)}
                />
                <label
                  htmlFor={`friend-${friend.friendId}`}
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                >
                  <Avatar>
                    <AvatarImage
                      src={friend.profile?.avatarUrl || undefined}
                      alt={friend.profile?.firstName || "Friend"}
                    />
                    <AvatarFallback>{getInitials(friend.profile?.firstName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.profile?.firstName || "Unknown"} {friend.profile?.lastName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{friend.profile?.username || ""}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

