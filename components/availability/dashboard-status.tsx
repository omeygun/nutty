import { useEffect, useState } from "react"
import { CardContent } from "../ui/card"
import { getAvailabilityOnDate } from "@/lib/supabase"

function getThisFriday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ..., Friday: 5, Saturday: 6
    const daysUntilFriday = (5 + 7 - dayOfWeek) % 7; // Calculate days to add to reach Friday
    today.setDate(today.getDate() + daysUntilFriday); // Set date to this Friday
    return today;
}

export function DashboardStatus() {
    const [friendCount, setFriendCount] = useState(0)

    useEffect(() => {
        const getFriendCount = async () => {
            const date = getThisFriday();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(date.getDate()).padStart(2, '0');

            const dateString = `${year}-${month}-${day}`;
            // console.log(dateString); // Example: "2025-04-07"

            const friendFriday = await getAvailabilityOnDate(dateString)
            setFriendCount(friendFriday.length)
        }

        getFriendCount()
    })


    return (
        <div className="h-auto flex flex-col">
            <CardContent className="text-2xl my-auto">
                <p>
                    You are available <span className="font-bold">X</span> hours this week!
                </p>
            </CardContent>
            <CardContent className="text-2xl my-auto">
                <p>
                    <span className="font-bold">{friendCount}</span> friends are also free this Friday!
                </p>
            </CardContent>
        </div>)
}