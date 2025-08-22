"use client"

import { motion } from "framer-motion"
import Marquee from "react-fast-marquee"
import { Dot } from "lucide-react"

type Feature = {
  label: string
  color: "violet" | "red" | "green" | "blue"
}

const FEATURES: Feature[] = [
  { label: "Time Tracking", color: "violet" },
  { label: "Agile Workflow", color: "red" },
  { label: "Resource Allocation", color: "green" },
  { label: "Advanced Analytics", color: "red" },
  { label: "Weekly reports", color: "blue" },
]

const colorMap: Record<Feature["color"], string> = {
  violet: "text-violet-600",
  red: "text-red-600",
  green: "text-green-600",
  blue: "text-blue-600",
}

export default function MarqueeSection() {
  return (
    <motion.div
      viewport={{ once: true, amount: 0.2 }}
      className="relative rounded-2xl max-w-5/6 my-12 pb-12 mx-auto overflow-hidden"
      aria-label="Scrolling list of product features"
    >
      {/* subtle surrounding glow tuned for light theme */}
      <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06),transparent_55%)]" />

      <div className="relative ">
        <Marquee
          autoFill
          speed={40}
          gradientWidth={160}
          loop={0} // infinite
          className=""
        >
          {FEATURES.map((f, idx) => (
            <motion.div
              key={`${f.label}-${idx}`}
              whileHover={{ scale: 1.03, y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="mx-6 py-4"
            >
              <Chip label={f.label} colorClass={colorMap[f.color]} />
            </motion.div>
          ))}
        </Marquee>
      </div>
    </motion.div>
  );
}

function Chip({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3
                 text-neutral-800 shadow-sm  transition-colors"
      role="listitem"
      aria-label={label}
    >
      <Dot className={`size-5 ${colorClass}`} strokeWidth={8} />
      <span className="font-medium tracking-tight">{label}</span>
    </div>
  )
}
