"use client"

import { useState } from "react"
import { FriendSelector } from "@/components/availability/friend-selector"
import { CommonTimeDisplay } from "@/components/availability/common-time-display"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Clock, Users } from "lucide-react"

export default function FindTimePage() {
  const router = useRouter()
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Find Common Free Time</h1>
      <p className="text-muted-foreground mb-8">Select friends to find the best time to meet together.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <FriendSelector selectedFriends={selectedFriends} onChange={setSelectedFriends} />

          <div className="mt-6 flex flex-col space-y-4">
            <Button variant="outline" onClick={() => router.push("/availability")} className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Manage Your Availability
            </Button>

            <Button variant="outline" onClick={() => router.push("/friends")} className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Manage Friends
            </Button>
          </div>
        </div>

        <div>
          <CommonTimeDisplay selectedFriends={selectedFriends} />
        </div>
      </div>
    </div>
  )
}

