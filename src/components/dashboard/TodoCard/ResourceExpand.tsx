import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'lucide-react'
import { formatUrl } from '@/utils/format-url'
import { skillTodo } from '@/types/skillDashboardTypes'

interface ResourceExpandProps {
  todo: skillTodo;
  isExpanded: boolean;
}

export default function ResourceExpand({todo, isExpanded}:ResourceExpandProps) {
  return (
    <motion.div
            initial={false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{
              height: {
                duration: 0.4,
                ease: [0.04, 0.62, 0.23, 0.98],
              },
              opacity: {
                duration: 0.3,
                delay: isExpanded ? 0.1 : 0,
                ease: "easeInOut",
              },
            }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200">
              <motion.div
                initial={false}
                animate={{
                  y: isExpanded ? 0 : -10,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: isExpanded ? 0.2 : 0,
                  ease: "easeOut",
                }}
              >
                <h4 className="text-sm font-medium mb-2">Resources</h4>
                {todo.resourceLink ? (
                  <motion.a
                    initial={false}
                    animate={{
                      x: isExpanded ? 0 : -10,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.3 : 0,
                      ease: "easeOut",
                    }}
                    href={todo.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center"
                  >
                    <Link className="mr-2" size={16} />
                    {todo.resourceLinkTitle || formatUrl(todo.resourceLink)}
                  </motion.a>
                ) : (
                  <motion.p
                    initial={false}
                    animate={{
                      x: isExpanded ? 0 : -10,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.3 : 0,
                      ease: "easeOut",
                    }}
                    className="text-sm text-gray-500 italic"
                  >
                    No resources added yet
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
  )
}
