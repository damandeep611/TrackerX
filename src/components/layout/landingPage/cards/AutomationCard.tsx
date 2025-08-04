import React from 'react'
import { motion } from "framer-motion"
import Marquee from "react-fast-marquee"


interface AutomationStep {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  number: string
  color: string
}

export default function AutomationCard() {
  const automationSteps: AutomationStep[] = [
    {
      id: "1",
      title: "Assigned to Mark (Parent)",
      subtitle: "Sent to Mark",
      number: "01",
      color: "bg-blue-100",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "2",
      title: "Added to Calendar",
      subtitle: "Updated in Google Calendar",
      number: "02",
      color: "bg-blue-100",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "3",
      title: "Creating Reminder ✨",
      subtitle: "Automating today's tasks...",
      number: "03",
      color: "bg-blue-500",
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
    {
      id: "4",
      title: "Added to List",
      subtitle: "Updated ",
      number: "02",
      color: "bg-pink-100",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className=" bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-xl p-4 w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="text-blue-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <span className="text-blue-500 font-semibold text-sm tracking-wider uppercase">Automations</span>
        </motion.div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Automate Your Life</h1>
          <p className="text-gray-600 leading-relaxed">
            Explore how your family can streamline tasks and maintain organization effortlessly with AI-powered to-do
            lists.
          </p>
        </motion.div>

        {/* Automation Steps */}
        <div className="h-48 flex items-center justify-center overflow-hidden">
          <Marquee direction="up" speed={30} gradient={false} pauseOnHover={true}>
            <div className="space-y-4 py-4 flex flex-col items-center w-full">
              {automationSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 p-4 mx-2 my-2 rounded-xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center`}>
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-500">{step.subtitle}</p>
                  </div>

                  <div className="text-2xl font-bold text-gray-300">{step.number}</div>
                </motion.div>
              ))}
              {/* Duplicate the items for seamless loop */}
              {automationSteps.map((step, index) => (
                <motion.div
                  key={`${step.id}-duplicate`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 p-4 mx-2 my-2 rounded-xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center`}>
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-500">{step.subtitle}</p>
                  </div>

                  <div className="text-2xl font-bold text-gray-300">{step.number}</div>
                </motion.div>
              ))}
            </div>
          </Marquee>
        </div>
      </motion.div>
    </div>
  )
}
