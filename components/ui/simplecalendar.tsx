"use client"

import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"

export default function CalendarBlock() {
    const today = new Date()
    const day = format(today, "d")
    const month = format(today, "MMMM")

    const cardRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState({ x: -22.5, y: -22.5 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0 })

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        dragStart.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return

        const dx = e.clientX - dragStart.current.x
        const dy = e.clientY - dragStart.current.y

        setRotation((prev) => ({
            x: prev.x + dy * 0.5,
            y: prev.y + dx * 0.5,
        }))

        dragStart.current = { x: e.clientX, y: e.clientY }
    }

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleMouseUp)
        } else {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging])

    // Automatic rotation effect: when not dragging, rotate the card slowly.
    useEffect(() => {
        let animationFrameId: number

        const animate = () => {
            if (!isDragging) {
                // Auto-rotate around the y-axis; adjust 0.5 for faster/slower rotation.
                setRotation((prev) => ({ ...prev, y: prev.y , x: prev.x   }))
            }
            animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrameId)
    }, [isDragging])

    // Card dimensions:
    // - Front face: 12rem x 12rem (w-48, h-48).
    // - Extruded depth: 1rem.
    // We use half the thickness (0.5rem) to offset the front/back faces.
    const thickness = "1rem"
    const halfThickness = "0.5rem"

    return (
        <div className="w-full flex justify-center py-10">
            {/* Container with perspective */}
            <div className="perspective-[1000px]" style={{ width: "12rem", height: "12rem" }}>
                <div
                    ref={cardRef}
                    onMouseDown={handleMouseDown}
                    style={{
                        width: "12rem",
                        height: "12rem",
                        position: "relative",
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: "preserve-3d",
                        transition: "transform 150ms ease-in-out",
                        cursor: "grab",
                        overflow: "false",
                    }}
                >
                    {/* Front Face: the calendar content */}
                    <div
                        style={{
                            position: "absolute",
                            width: "12rem",
                            height: "12rem",
                            background: "#fff",
                            border: "1px solid #e5e7eb", // equivalent to Tailwind gray-200
                            display: "flex",
                            // flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            backfaceVisibility: "hidden",
                            transform: `translateZ(${halfThickness})`,
                            userSelect: 'none'
                        }}
                    >
                        <div className="text-4xl text-red-600 ">{day}</div>
                        <div className="text-lg text-gray-700">{month}</div>
                    </div>

                    {/* Back Face: colored similarly to simulate the inner side */}
                    <div
                        style={{
                            display: "flex",
                            position: "absolute",
                            width: "12rem",
                            height: "12rem",
                            background: "white",
                            border: "1px solid #e5e7eb",
                            backfaceVisibility: "hidden",
                            transform: `rotateY(180deg) translateZ(${halfThickness})`,
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            userSelect: "none",
                        }}
                    >
                        <div className="text-4xl text-red-600">{day}</div>
                        <div className="text-lg text-gray-700">{month}</div>
                    </div>






                    {/* Right Edge */}
                    <div
                        style={{
                            position: "absolute",
                            width: thickness, // 1rem
                            height: "12rem",
                            background: "black",
                            borderLeft: "1px solid #e5e7eb",
                            backfaceVisibility: "hidden",
                            transform: `rotateY(90deg) translateZ(11.5rem)`,
                        }}
                    />

                    {/* Left Edge */}
                    <div
                        style={{
                            position: "absolute",
                            width: thickness,
                            height: "12rem",
                            background: "black",
                            borderRight: "1px solid #e5e7eb",
                            backfaceVisibility: "hidden",
                            transform: `rotateY(-90deg) translateZ(${halfThickness})`,
                        }}
                    />

                    {/* Top Edge */}
                    <div
                        style={{
                            position: "absolute",
                            width: "12rem",
                            height: thickness,
                            background: "black",
                            borderBottom: "1px solid #e5e7eb",
                            backfaceVisibility: "hidden",
                            transform: `rotateX(90deg) translateZ(${halfThickness})`,
                        }}
                    />

                    {/* Bottom Edge */}
                    <div
                        style={{
                            position: "absolute",
                            width: "12rem",
                            height: thickness,
                            background: "black",
                            borderTop: "1px solid #e5e7eb",
                            backfaceVisibility: "hidden",
                            transform: `rotateX(-90deg) translateZ(11.5rem)`,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
