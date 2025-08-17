"use client"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export default function AnalyticsBento() {
  // Sample data for charts
  const mttrData = [
    { category: "Critical", mttr: 30, sla: 45 },
    { category: "High", mttr: 45, sla: 60 },
    { category: "Medium", mttr: 60, sla: 75 },
  ]

  const violationsData = [
    { month: "JAN", open: 1500, resolved: 1200 },
    { month: "MAR", open: 1300, resolved: 1400 },
    { month: "MAY", open: 1600, resolved: 1100 },
    { month: "JUL", open: 1400, resolved: 1300 },
    { month: "SEP", open: 1800, resolved: 900 },
    { month: "NOV", open: 2200, resolved: 1000 },
  ]

  const maxValue = Math.max(...mttrData.flatMap((d) => [d.mttr, d.sla]))
  const maxViolations = Math.max(...violationsData.flatMap((d) => [d.open, d.resolved]))
  return (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-red-100 rounded-xl  border border-gray-300   mx-auto overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left side - Bar Chart */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 m-4  border-4 border-gray-300">
            <div className="flex items-center justify-between mb-6 ">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">MTTR VS. SLA (IN DAYS)</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                  <span className="text-gray-600">MTTR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-400 rounded"></div>
                  <span className="text-gray-600">SLA</span>
                </div>
              </div>
            </div>

            <div className="relative h-48">
              <div className="absolute inset-0 ml-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="dotted-grid" patternUnits="userSpaceOnUse" width="2" height="2">
                      <circle cx="1" cy="1" r="0.3" fill="#d1d5db" opacity="0.5" />
                    </pattern>
                  </defs>
                  {/* Horizontal dotted lines */}
                  {[0, 20, 40, 60, 80, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="url(#dotted-grid)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                  ))}
                </svg>
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 z-10">
                <span>75</span>
                <span>60</span>
                <span>45</span>
                <span>30</span>
                <span>15</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-8 h-full flex items-end justify-around gap-4 relative z-10">
                {mttrData.map((item, index) => (
                  <div key={item.category} className="flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1 h-40">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.mttr / maxValue) * 160}px` }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        className="w-6 bg-indigo-600 rounded-t"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.sla / maxValue) * 160}px` }}
                        transition={{ duration: 0.8, delay: index * 0.2 + 0.1 }}
                        className="w-6 bg-indigo-400 rounded-t"
                      />
                    </div>
                    <span className="text-xs text-gray-600">{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Line Chart and Prevented Section */}
        <div className="space-y-6">
          {/* Line Chart */}
          <div className="bg-gray-50 rounded-xl p-6 border-4 border-gray-300 translate-x-10 -translate-y-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-6">
              OPEN VS. RESOLVED VIOLATIONS
            </h3>

            <div className="relative h-32">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120">
                <defs>
                  <pattern id="line-dotted-grid" patternUnits="userSpaceOnUse" width="2" height="2">
                    <circle cx="1" cy="1" r="0.3" fill="#d1d5db" opacity="0.5" />
                  </pattern>
                </defs>
                {/* Horizontal dotted lines */}
                {[0, 24, 48, 72, 96, 120].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="300"
                    y2={y}
                    stroke="#d1d5db"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.4"
                  />
                ))}
                {/* Vertical dotted lines */}
                {[0, 60, 120, 180, 240, 300].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="120"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.4"
                  />
                ))}
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                <span>2.5K</span>
                <span>2K</span>
                <span>1.5K</span>
                <span>1K</span>
                <span>500</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-8 h-full relative z-10">
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  {/* Open violations line (blue) */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d={`M 0,${120 - (violationsData[0].open / maxViolations) * 120} ${violationsData
                      .map((d, i) => `L ${i * 60},${120 - (d.open / maxViolations) * 120}`)
                      .join(" ")}`}
                    stroke="#6366f1"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Resolved violations line (green) */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                    d={`M 0,${120 - (violationsData[0].resolved / maxViolations) * 120} ${violationsData
                      .map((d, i) => `L ${i * 60},${120 - (d.resolved / maxViolations) * 120}`)
                      .join(" ")}`}
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 mt-2">
                  {violationsData.map((d) => (
                    <span key={d.month}>{d.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Prevented Section */}
          <div className="bg-gray-50 rounded-xl p-6 border-4 border-gray-300 translate-x-8">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-4">PREVENTED</h3>

            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-2xl font-bold text-gray-900">228</span>
                <span className="text-sm text-gray-600 ml-2">violations found in PRs</span>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 1 }}
                className="h-2 bg-indigo-600 rounded-full"
              />
            
            </div>
          </div>
        </div>
      </div>

      {/* Bottom content */}
      <div className="mt-8 pt-6 p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Time Based Analytics feedback</h2>
          <p className="text-gray-600 leading-relaxed">
            Discover insights through Cycode powerful dashboards. Track security incidents, measure impact, and stay
            on top of vulnerabilities in 
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
