"use client";

import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import React, { ChangeEvent, useState } from "react";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      setTags([...tags, trimmedInput]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md focus:focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
      <AnimatePresence>
        {tags.map((tag, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1.5 text-purple-600 hover:text-purple-800 focus:outline-none"
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <input
        type="text"
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setInputValue(e.target.value)
        }
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        className="flex-grow min-h-[120px] outline-none text-sm"
        placeholder={
          tags.length === 0 ? "Add tags (press enter or comma to add" : ""
        }
      />
    </div>
  );
}
