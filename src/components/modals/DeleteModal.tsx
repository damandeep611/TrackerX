"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface DeleteModalProps {
  onDelete: () => void;
}

export default function DeleteModal({ onDelete }: DeleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };
  const handleCancel = () => {
    setIsOpen(false);
  };
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <motion.button
          ref={buttonRef}
          onClick={() => setIsOpen(true)}
          className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50  rounded-lg transition-colors duration-200 focus:outline-none focus-within:ring-1 focus:ring-red-500 "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          layout
        >
          <motion.div
            animate={
              isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.2 }}
          >
            <Trash2 className="w-5 h-5" />
          </motion.div>
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40"
                onClick={handleCancel}
              >
                {/* modal */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
                  animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                  exit={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.2,
                  }}
                  className=" absolute top-1/2  right-1/12 translate-x-24 border border-border  bg-background z-50  rounded-xl p-6 max-w-[320px]  shadow-2xl"
                  style={{ transformOrigin: "center center" }}
                >
                  <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 p-1 cursor-pointer hover:bg-secondary rounded-md "
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* modal icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100"
                  >
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </motion.div>
                  {/* content */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-center mb-6"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      Delete Task ?
                    </h3>
                    <p className="text-sm">
                      This action cannot be undone. This will permanently delete
                      the task
                    </p>
                  </motion.div>
                  {/* modal actions  */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex gap-3"
                  >
                    <button
                      onCanPlay={handleCancel}
                      className=" flex-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg px-4 py-2 font-medium"
                    >
                      Cancel Delete
                    </button>
                    <button
                      onClick={handleDelete}
                      className=" flex-1 text-sm bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 font-medium"
                    >
                      Delete Item
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
