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
      <div className="mt-2 pt-2">
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
          <h4 className="text-xs font-medium dark:text-zinc-500 mb-2 pt-2   border-t dark:border-zinc-800">
            Resources
          </h4>
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
              className="text-xs px-3 py-2 bg-zinc-800 inline-flex items-center rounded-md"
            >
              <Link className="mr-2" size={14} />
              <span className="">
                {todo.resourceLinkTitle || formatUrl(todo.resourceLink)}
              </span>
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
  );
}
