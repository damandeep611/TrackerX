"use client";
import { Plus, Sparkles } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

interface GoalsFormProps {
  onSubmit: (title: string) => void;
}

interface FormData {
  name: string;
}

export default function GoalsForm({ onSubmit }: GoalsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const handleFormSubmit = async (data: FormData) => {
    onSubmit(data.name);
    reset();
  };

  return (
    <motion.form
      onSubmit={handleSubmit(handleFormSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      className="bg-gradient-to-br dark:from-zinc-900/80 dark:to-zinc-900/40 backdrop-blur-sm p-6 rounded-2xl border dark:border-zinc-800/50 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="name" className="block text-sm font-semibold  mb-3">
            Goal Title
          </label>
          <input
            type="text"
            id="name"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Too short" },
            })}
            placeholder="What would you like to achieve?"
            className={`w-full dark:bg-zinc-800/50 border  rounded-xl p-4  placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ease-in-out duration-300 backdrop-blur-sm ${
              errors.name ? "border-red-500" : "border-zinc-700/50"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl transition-all ease-in-out duration-300 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </motion.button>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-zinc-500 mt-3 flex items-center gap-2"
      >
        <Sparkles className="w-3 h-3" />
        Add your goals first, then set start dates when you&apos;re ready to begin
      </motion.p>
    </motion.form>
  );
}
