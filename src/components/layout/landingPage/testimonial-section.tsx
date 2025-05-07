"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

type Testimonial = {
  id: number
  quote: string
  name: string
  position: string
  company: string
  image: string
  color: string
}

export default function TestimonialSection() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      quote:
      "This app completely changed how I approach learning. I used to jump between tutorials — now I actually *finish* what I start and see my progress grow over time.",
      name: "Sara Mitchell",
      position: "Frontend Developer",
      company: "Freelance",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      color: "bg-blue-100",
    },
    {
      id: 2,
      quote:
      "I’m tracking my web dev roadmap here — React, TypeScript, everything. Being able to log hours and connect tasks to a bigger skill really helps me stay focused.",
      name: "Aditya Rao",
      position: "CS Student",
      company: "IIT Bombay",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      color: "bg-yellow-100",
    },
    {
      id: 3,
      quote:
      "This isn’t just a to-do list. It feels like a personal growth engine. I can literally see how each topic I study builds on the last.",
      name: "Melissa Chen",
      position: "Software Engineer",
      company: "Turing",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      color: "bg-green-100",
    },
    {
      id: 4,
      quote:
      "I was learning Python and kept getting lost. With this, I broke things into concepts and logged my hours. Two months later, I’m actually building stuff.",
      name: "David Kim",
      position: "Self-Taught Dev",
      company: "Personal Projects",
      image: "https://randomuser.me/api/portraits/men/77.jpg",
      color: "bg-purple-100",
    },
    {
      id: 5,
      quote:
      "The visual roadmap makes it addictive. I log in just to tick off another skill. It’s like Duolingo but for actual developer learning.",
      name: "Nina Kapoor",
      position: "Product Designer",
      company: "Notion",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
      color: "bg-pink-100",
    },
    {
      id: 6,
      quote:
      "What sold me was the idea of logging activities against each skill. It makes learning intentional — not just ‘watching tutorials’.",
      name: "Markus Vogel",
      position: "Backend Engineer",
      company: "SAP",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      color: "bg-red-100",
    },
    {
      id: 7,
      quote:
      "I track everything I learn — books, YouTube videos, even side projects. It’s the only app that doesn’t make learning feel chaotic.",
      name: "Olivia Mendes",
      position: "AI/ML Enthusiast",
      company: "University of São Paulo",
      image: "https://randomuser.me/api/portraits/women/91.jpg",
      color: "bg-orange-100",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  // Get visible testimonials (5 at a time)
  const getVisibleTestimonials = () => {
    const result = []
    for (let i = 0; i < 5; i++) {
      const index = (activeIndex + i) % testimonials.length
      result.push(testimonials[index])
    }
    return result
  }

  return (
    <section className=" py-20  overflow-hidden">
      <div className=" container lg:max-w-7xl mx-auto  md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12  px-4 items-center">
          {/* Left side - Heading */}
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Momentum You Can Measure
            </h2>
          </div>

          {/* Right side - Subheading */}
          <div>
            <p className="text-lg text-gray-700 max-w-md">
            Every hour you spend learning should build momentum. By tracking your time, topics, and breakthroughs, you create a roadmap that compounds — not resets — every time you sit down to learn.
            </p>
          </div>
        </div>

        {/* Testimonials section with background text */}
        <div className="relative mt-10 mb-16 h-[600px] md:h-[700px]">
          {/* Background "Testimonials" text with gradient */}
          <div className="absolute inset-0  flex items-center justify-center pointer-events-none overflow-hidden">
            <h2
              className="text-[8rem] md:text-[12rem] font-bold select-none text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-200"
              style={{
                WebkitTextStroke: "1px rgba(200, 200, 200, 0.3)",
                textShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              Testimonials
            </h2>
          </div>
          {/* Stacked testimonial cards */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="w-full max-w-2xl h-full relative">
              <AnimatePresence>
                {getVisibleTestimonials().map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{
                      opacity: 0,
                      x: index % 2 === 0 ? -100 : 100,
                      y: 50 * index,
                      scale: 1 - index * 0.05,
                      zIndex: 5 - index,
                    }}
                    animate={{
                      opacity: 1,
                      x: index % 2 === 0 ? index * 20 : index * -20 + 100,
                      y: 50 * index,
                      scale: 1 - index * 0.05,
                      zIndex: 5 - index,
                    }}
                    exit={{
                      opacity: 0,
                      x: index % 2 === 0 ? -200 : 200,
                      transition: { duration: 0.3 },
                    }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className={`absolute ${testimonial.color} p-4 rounded-3xl shadow-lg max-w-sm`}
                    style={{
                      left: index % 2 === 0 ? "10%" : "30%",
                      top: `${10 + index * 5}%`,
                    }}
                  >
                    <div className="flex flex-col gap-4">
                     
                      <p className="text-gray-700 text-sm">{testimonial.quote}</p>
                      <div className="flex items-center mt-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{testimonial.name}</h4>
                          <p className="text-xs text-gray-500">
                            {testimonial.position}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
