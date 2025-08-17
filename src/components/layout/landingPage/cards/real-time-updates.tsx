"use client"
import { motion } from "framer-motion"
import { Check, PieChart, BarChart3, TrendingUp} from "lucide-react"
export default function RealTimeUpdates() {
  return (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-emerald-100 rounded-xl border border-gray-300 p-8   mx-auto w-full"
    >
      {/* Main Revenue Forecast Circle */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Gradient Circle Border */}
          <div className="w-48 h-48 rounded-full bg-gradient-to-r from-orange-400 via-red-400 to-blue-500 p-1">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
              {/* Check Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="absolute -top-2 bg-orange-500 rounded-full p-2 mb-2"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>

              {/* Content */}
              <div className="text-center mt-4">
                <p className="text-gray-500 text-sm mb-1">Revenue Forecast</p>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-3xl font-bold text-gray-900 mb-1"
                >
                  $6,523.30
                </motion.h2>
                <p className="text-gray-400 text-sm">Clean Case</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Three Cards Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-3">
            <PieChart className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">Balance</p>
          <p className="text-sm font-medium text-gray-900">Estimate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-500">Cash Flow</p>
          <p className="text-sm font-medium text-gray-500">Statement</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-500">Profit and Loss</p>
          <p className="text-sm font-medium text-gray-500">Statement</p>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-start justify-between pt-8"
      >
        <div>
           <h2 className="text-2xl font-bold text-gray-900 mb-3">Real time updates</h2>
          <p className="text-gray-600 leading-relaxed">
            Discover insights through Cycode powerful dashboards. Track security incidents, measure impact, and stay
            on top of vulnerabilities in 
          </p>
        </div>
       
      </motion.div>
    </motion.div>
  )
}
