"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { getUserFromId } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

interface FriendAcceptProps {
    senderId: string;
}

export function FriendAccept({ senderId }: FriendAcceptProps) {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sender, setSender] = useState<string | null>(null)
    const [isAccepted, setIsAccepted] = useState(false)
    const [isRejected, setIsRejected] = useState(false)
    const [requestResponse, setRequestResponse] = useState<string | null>(null)

    const [isSameUser, setIsSameUser] = useState(false)




    useEffect(() => {
        const loadFriends = async () => {
            if (!user) {
                setIsLoading(false)
                return
            }

            if (user.id == senderId) {
                setIsSameUser(true)
                return
            }

            try {
                setIsLoading(true)
                setError(null)
                const sendingUser = await getUserFromId(senderId)

                console.log(sendingUser)

                setSender(sendingUser?.first_name || null)
            } catch (err) {
                console.error("Error loading sender:", err)
                setError("Failed to load sender. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        loadFriends()
    }, [user])

    const handleSendRequest = async () => {
        if (!user || !sender) return

        if (!supabase) {
            throw "Can't connect to supabase";
        }

        try {
            setIsLoading(true)

            // Check if a friendship already exists
            const { data: existingFriendship, error: friendshipError } = await supabase
                .from("friends")
                .select("*")
                .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
                .or(`user_id.eq.${senderId},friend_id.eq.${senderId}`)
                .maybeSingle()

            if (existingFriendship) {
                setRequestResponse(`You've already sent a request to ${sender}!`)
                return
            }

            // Create the friendship request
            const { error: createError } = await supabase.from("friends").insert({
                user_id: user.id,
                friend_id: senderId,
                status: "pending",
            })

            if (createError) {
                throw createError
            }
            setRequestResponse("Request sent!")
        } catch (error) {
            console.error("Error sending friend request:", error)
            setRequestResponse("Oops! There seems to be a problem...")
        } finally {
            setIsLoading(false)
            setIsAccepted(true)
        }
    }

    return (
        <Card>
            {isLoading ?
                <CardHeader className="text-center">
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
                :
                isSameUser ?
                    <CardHeader className="text-center">
                        {
                            <CardTitle>This link is working!</CardTitle>
                        }
                        <CardDescription>Send it to a friend to add them</CardDescription>
                    </CardHeader>
                    :
                    <>
                        <CardHeader className="text-center">
                            {
                                ((sender) ?
                                    <>
                                        <CardTitle>Send {sender} a friend request?</CardTitle>
                                        <CardDescription>You've recieved their invitation link</CardDescription>
                                        {(isAccepted || isRejected) ?
                                            <CardContent className="text-center">
                                                <p>
                                                    {requestResponse}
                                                </p>
                                            </CardContent>
                                            :
                                            (<CardContent className="flex flex-row gap-2 w-full justify-center">
                                                <Button size="sm" variant="outline" onClick={() => handleSendRequest()}>
                                                    <Check className="h-4 w-4 " />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => { setIsRejected(true); setRequestResponse(`You've rejected ${sender}. No hard feelings ;-;`) }}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </CardContent>)}
                                    </>
                                    :
                                    <CardTitle>Cannot find user</CardTitle>)
                            }

                        </CardHeader>

                    </>}
        </Card>
    )
}

