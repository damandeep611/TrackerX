"use client"
import React, { useEffect, useRef, useState } from 'react'

export default function FeaturesSection() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

    const storyImages = [
    "https://cdn.dribbble.com/userupload/3180519/file/original-9e16eb1950173a9d5a16d9039947b5f7.png?resize=1600x1200&vertical=center",
    "https://cdn.dribbble.com/userupload/27820145/file/original-899d53471d3aa6818a16616e8636a999.png?resize=1600x1200&vertical=center",
    "https://cdn.dribbble.com/userupload/43412762/file/original-780a6a7bd4bb781d851dbb891f16688d.jpg?resize=1600x1200&vertical=center",
    "https://cdn.dribbble.com/userupload/10441864/file/original-a15586775b6ab041945d09bd1f7fedc7.jpg?resize=1600x1200&vertical=center",
    "https://cdn.dribbble.com/userupload/19418482/file/original-37d6ebaba4ef3edf481e3122042c5388.jpg?resize=1600x1200&vertical=center",
    "https://cdn.dribbble.com/userupload/42944469/file/original-6f98871ed3f442670a4ccacf9adc2e89.png?resize=1600x1200&vertical=center",
  ]


  const storyPoints = [
    {
      title: " Skill-Centric Workflow",
      description:
        "Add a skill name, category, description, and how many hours you want to dedicate. Stay intentional from the start.",
    },
    {
      title: "Break down skills into tasks.",
      description:
        "Quickly add tasks with a title, tags, and notes. Focus on doing, not managing",
    },
    {
      title: "Track time in 30-minute bites.",
      description:
        "Each task lets you log up to 2.5 hours. One click = 30 minutes. Simple, fast, no overthinking.",
    },
    {
      title: "See what's done and what's left.",
      description:
        "Mark tasks as complete to instantly shift them into “done” mode. Buttons disappear, and the card becomes read-only.",
    },
    {
      title: " Built-In Analytics",
      description:
        "View time spent on each skill, daily averages, tasks per week, and tag-based breakdowns. Learning becomes visible.",
    },
    {
      title: "Bird's-eye view of your habits.",
      description:
        "Track total time this week, last 30 days, weekly efficiency, and time usage per day—plus charts that make it all clear.",
    },
  ]

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]))
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: "-10% 0px -10% 0px",
      },
    )

    const elements = document.querySelectorAll("[data-story-item]")
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])
   const getImageForIndex = (index: number) => {
    return storyImages[index % storyImages.length]
  }
  return (
    <div className='max-w-7xl mx-auto'>
      <div className='py-24'>
        {/* header section */}
      <div className='flex flex-col items-center justify-center space-y-8'>
        <span className=' text-sm bg-blue-100 text-blue-700 px-4 py-1 rounded-2xl border border-blue-400'>Features</span>
        <div  className='max-w-lg text-center'>
          <h2 className='text-4xl font-semibold '>Quick to track all the work and tasks</h2>
        </div>
        <p className='text-sm lg:text-lg font-medium text-gray-500'>Only Fraction of time spend instead of overcomplicating task management</p>
      </div>
      {/* Scrolling  */}
      {/* Scroll Storytelling Section */}
      <div className="min-h-screen py-10 ">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
            {/* Fixed Left Column */}
            <div className="lg:sticky lg:col-span-2 lg:top-32 lg:h-fit">
              <div className="space-y-6 lg:pr-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 leading-tight">
                 Track Your Learning.
                  <br />
                  <span className="font-normal text-gray-700"> Visibly Grow.</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  A focused space to build skills, break them into tasks, log time, and actually measure progress—no fluff, just real learning.
                </p>
              </div>
            </div>
            {/* Scrollable Right Column */}
            <div className="  lg:col-span-3 space-y-24 md:space-y-32 lg:space-y-40 py-8 lg:py-16 relative">
              {/* Vertical connection line that runs through all points */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100" />

              {storyPoints.map((point, index) => (
                <div
                  key={index}
                  data-story-item
                  data-index={index}
                  className={`transform transition-all duration-1000 ease-out relative ${
                    visibleItems.has(index) ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}
                >
                  {/* Vertical connection line for this specific point */}
                  {index > 0 && (
                    <div
                      className={`absolute left-4 w-px bg-gray-300 transition-all duration-1000 ease-out ${
                        visibleItems.has(index) ? "h-24 md:h-32 lg:h-40 opacity-100" : "h-0 opacity-0"
                      }`}
                      style={{
                        top: "-24px",
                        transform: "translateY(-100%)",
                      }}
                    />
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 relative z-10 ${
                          visibleItems.has(index) ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-white"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium transition-colors duration-700 ${
                            visibleItems.has(index) ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div
                        className={`h-px flex-1 transition-all duration-1000 delay-300 ${
                          visibleItems.has(index) ? "bg-gray-200 w-full" : "bg-transparent w-0"
                        }`}
                      />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">{point.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg max-w-md">{point.description}</p>
                     {/* Story Point Image */}
                    <div className="flex justify-center w-full">
                      <img
                        src={getImageForIndex(index) || "/placeholder.svg"}
                        alt={`${point.title} illustration`}
                        className={`w-full max-w-none h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-sm transition-all duration-1000 delay-500 ${
                          visibleItems.has(index) ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
