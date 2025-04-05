"use client";

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import type { Friend } from "@/types/availability"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserFriends, supabase, getPendingFriends } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserPlus, Check, X } from "lucide-react"

export default function FriendsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {

    const loadFriends = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const friendsList: Friend[] = await getUserFriends(user.id)
        const pendingList: Friend[] = await getPendingFriends(user.id)
        console.log("pending:")
        console.log(pendingList)

        // Split into accepted and pending
        const accepted = friendsList
        const pending = pendingList

        setFriends(accepted)
        setPendingRequests(pending)
      } catch (error) {
        console.error("Error loading friends:", error)
        toast({
          title: "Error",
          description: "Failed to load your friends. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, [user, toast])

  const handleSendRequest = async () => {
    if (!user || !email) return

    if (!supabase) {
      throw "Can't connect to supabase";
    }

    try {
      setIsSending(true)

      // First, check if the user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select("*")
        .eq("email", email)
        .single()

      // console.log(userData)

      if (userError || !userData) {
        toast({
          title: "User not found",
          description: "No user with that email address was found.",
          variant: "destructive",
        })
        return
      }

      // Check if a friendship already exists
      const { data: existingFriendship, error: friendshipError } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .or(`user_id.eq.${userData.id},friend_id.eq.${userData.id}`)
        .maybeSingle()

      if (existingFriendship) {
        toast({
          title: "Already friends",
          description: "You already have a friendship with this user.",
          variant: "destructive",
        })
        return
      }

      // Create the friendship request
      const { error: createError } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: userData.id,
        status: "pending",
      })

      if (createError) {
        throw createError
      }

      toast({
        title: "Request sent",
        description: "Friend request has been sent successfully.",
      })

      setEmail("")

      // Refresh the friends list
      const friendsList = await getUserFriends(user.id)
      const pending = friendsList.filter((f) => f.status === "pending")
      setPendingRequests(pending)
    } catch (error) {
      console.error("Error sending friend request:", error)
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleAcceptRequest = async (friendId: string) => {
    if (!user || !supabase) return

    try {
      // Update the friendship status
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("user_id", friendId)
        .eq("friend_id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Request accepted",
        description: "You are now friends!",
      })

      // Refresh the friends list
      const friendsList = await getUserFriends(user.id)
      const accepted = friendsList.filter((f) => f.status === "accepted")
      const pending = friendsList.filter((f) => f.status === "pending")
      setFriends(accepted)
      setPendingRequests(pending)
    } catch (error) {
      console.error("Error accepting friend request:", error)
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (friendId: string) => {
    if (!user || !supabase) return

    try {
      // Delete the friendship
      const { error } = await supabase.from("friends").delete().eq("user_id", friendId).eq("friend_id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Request rejected",
        description: "Friend request has been rejected.",
      })

      // Refresh the pending requests
      const friendsList = await getUserFriends(user.id)
      const pending = friendsList.filter((f) => f.status === "pending")
      setPendingRequests(pending)
    } catch (error) {
      console.error("Error rejecting friend request:", error)
      toast({
        title: "Error",
        description: "Failed to reject friend request. Please try again.",
        variant: "destructive",
      })
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Friends</h1>
      <p className="text-muted-foreground mb-8">Connect with your friends to find common free time for meetings.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Friend</CardTitle>
            <CardDescription>Send a friend request by email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleSendRequest} disabled={isSending || !email}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                <span className="ml-2">Add</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
            <CardDescription>Pending friend requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending friend requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={request.profile?.avatarUrl || undefined}
                          alt={request.profile?.firstName || "Friend"}
                        />
                        <AvatarFallback>{getInitials(request.profile?.firstName || null)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.profile?.firstName || "Unknown"} {request.profile?.lastName || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{request.profile?.username || ""}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleAcceptRequest(request.profile.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.userId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
          <CardDescription>Friends you can schedule meetings with</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : friends.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              You don't have any friends yet. Add friends to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                  <Avatar>
                    <AvatarImage
                      src={friend.profile?.avatarUrl || undefined}
                      alt={friend.profile?.firstName || "Friend"}
                    />
                    <AvatarFallback>{getInitials(friend.profile?.firstName || null)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.profile?.firstName || "Unknown"} {friend.profile?.lastName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{friend.profile?.username || ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

