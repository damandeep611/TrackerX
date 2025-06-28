import { AnimatePresence, motion } from "framer-motion";
import { Clock, X, Sunrise, Moon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

interface DailyTimeSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (totalHours: number) => void;
}

interface TimeFormData {
  wakeUpTime: string;
  sleepTime: string;
}

export default function DailyTimeSetup({
  isOpen,
  onClose,
  onSubmit,
}: DailyTimeSetupProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TimeFormData>({
    defaultValues: {
      wakeUpTime: "06:00",
      sleepTime: "22:00",
    },
  });

  const wakeUpTime = watch("wakeUpTime");
  const sleepTime = watch("sleepTime");

  const calculateTotalHours = (wakeUp: string, sleep: string): number => {
    const wakeUpDate = new Date(`2000-01-01T${wakeUp}`);
    const sleepDate = new Date(`2000-01-01T${sleep}`);

    // If sleep time is before wake up time, it means sleep is next day
    if (sleepDate < wakeUpDate) {
      sleepDate.setDate(sleepDate.getDate() + 1);
    }

    const diffInMs = sleepDate.getTime() - wakeUpDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return Math.round(diffInHours * 10) / 10; // Round to 1 decimal place
  };

  const totalHours = calculateTotalHours(wakeUpTime, sleepTime);

  const handleFormSubmit = (data: TimeFormData) => {
    const hours = calculateTotalHours(data.wakeUpTime, data.sleepTime);
    console.log("Time schedule set:", {
      wakeUpTime: data.wakeUpTime,
      sleepTime: data.sleepTime,
      totalHours: hours,
    });
    onSubmit(hours);
    onClose();
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Set Your Time Window
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="p-6 space-y-6"
            >
              {/* Wake Up Time */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Sunrise className="w-4 h-4 text-orange-500" />
                  <span>When did you wake up?</span>
                </label>
                <input
                  type="time"
                  {...register("wakeUpTime", {
                    required: "Wake up time is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                />
                {errors.wakeUpTime && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.wakeUpTime.message}
                  </p>
                )}
              </div>

              {/* Sleep Time */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>When will you sleep today?</span>
                </label>
                <input
                  type="time"
                  {...register("sleepTime", {
                    required: "Sleep time is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                />
                {errors.sleepTime && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.sleepTime.message}
                  </p>
                )}
              </div>

              {/* Total Hours Preview */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Available Hours Today
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalHours}h
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {wakeUpTime} - {sleepTime}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Set Today Time Schedule
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
