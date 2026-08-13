import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"

export function LayeredText({
  lines = [
    { top: "\u00A0", bottom: "GYMNATION" },
    { top: "GYMNATION", bottom: "FITNESS" },
    { top: "FITNESS", bottom: "CENTRE" },
    { top: "CENTRE", bottom: "\u00A0" },
  ],
  fontSize = "72px",
  fontSizeMd = "36px",
  lineHeight = 75,
  lineHeightMd = 45,
  className = "",
}) {
  const containerRef = useRef(null)
  const timelineRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const paragraphs = container.querySelectorAll("p")

    timelineRef.current = gsap.timeline({ paused: true })

    timelineRef.current.to(paragraphs, {
      y: (index) => {
        // Shift up exactly by line height when hovered so text aligns cleanly without clipping
        return -lineHeight
      },
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.05,
    })

    const handleMouseEnter = () => {
      timelineRef.current?.play()
    }

    const handleMouseLeave = () => {
      timelineRef.current?.reverse()
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      timelineRef.current?.kill()
    }
  }, [lines, lineHeight])

  return (
    <div
      ref={containerRef}
      className={`mx-auto py-4 font-teko tracking-wider uppercase text-white antialiased cursor-pointer ${className}`}
      style={{ fontSize, "--md-font-size": fontSizeMd }}
    >
      <ul className="list-none p-0 m-0 flex flex-col items-center">
        {lines.map((line, index) => {
          return (
            <li
              key={index}
              className="overflow-hidden relative"
              style={{
                height: `${lineHeight}px`,
              }}
            >
              <p
                className="px-4 align-top whitespace-nowrap m-0 text-white font-black flex items-center justify-center"
                style={{
                  height: `${lineHeight}px`,
                  lineHeight: `${lineHeight}px`,
                }}
              >
                {line.top}
              </p>
              <p
                className="px-4 align-top whitespace-nowrap m-0 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent font-black flex items-center justify-center"
                style={{
                  height: `${lineHeight}px`,
                  lineHeight: `${lineHeight}px`,
                }}
              >
                {line.bottom}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
