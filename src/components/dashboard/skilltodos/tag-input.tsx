"use client";

import { useState, type KeyboardEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const MAX_TAGS = 3;

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    if (tags.length >= MAX_TAGS) {
      setError(`Maximum ${MAX_TAGS} tags allowed`);
      return;
    }

    if (tags.includes(trimmedInput)) {
      setError("Tag already exists");
      return;
    }

    setTags([...tags, trimmedInput]);
    setInputValue("");
    setError("");
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
    setError("");
  };

  const remainingTags = MAX_TAGS - tags.length;
  const placeholderText =
    remainingTags > 0
      ? `Add tags (${remainingTags} remaining, press Enter or comma to add)`
      : `Maximum ${MAX_TAGS} tags reached`;

  return (
    <div className="space-y-1 my-2">
      <div
        className={`flex flex-wrap items-center gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent ${
          error ? "border-red-500" : "border-border"
        }`}
      >
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

        {tags.length < MAX_TAGS && (
          <input
            type="text"
            value={inputValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setInputValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            className="flex-grow min-w-[120px] outline-none text-sm"
            placeholder={placeholderText}
          />
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
