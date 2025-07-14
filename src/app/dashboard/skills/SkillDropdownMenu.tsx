import { Check, LogOut, RotateCcw, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { deleteSkillCard } from "@/actions/skillCardAction";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

interface SkillDropdownProps {
  skillId: string;
}

interface SkillDropdown {
  label: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  description?: string;
  isLoading?: boolean;
  confirmDelete?: boolean;
}

interface SkillDropdownSection {
  title?: string;
  items: SkillDropdown[];
}

export default function SkillDropdownMenu({ skillId }: SkillDropdownProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteSkill = async () => {
    try {
      setIsDeleting(true);
      await deleteSkillCard(skillId);
      toast.success("Skill deleted successfully");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to delete skill. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const SkillDropdownItems: SkillDropdownSection[] = [
    {
      title: "Skill Management",
      items: [
        {
          label: "Delete Skill",
          description: "Remove skill permanently",
          icon: Trash2,
          action: () => setShowConfirm(true),
          className: isDeleting 
            ? "opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-700" 
            : "hover:bg-red-50 hover:text-red-700",
          isLoading: isDeleting,
          confirmDelete: true,
        },
        {
          label: "Reset Skill",
          description: "Remove all tasks and data",
          icon: RotateCcw,
          action: () => {
            console.log("Skill data reseted");
          },
          className: " hover:bg-yellow-50 hover:text-yellow-700",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Logout",
          description: "Logout of account",
          icon: LogOut,
          action: () => {
            console.log("account signed out");
          },
          className: " hover:bg-blue-50 hover:text-blue-700",
        },
      ],
    },
  ];

  return (
    <div className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-zinc-900 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
      <div className=" py-4">
        {SkillDropdownItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className="px-4 py-2">
                <p className="text-zinc-700 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">
                  {section.title}
                </p>
              </div>
            )}
            <div className="space-y-1 px-2">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => {
                    if (!item.isLoading && (!item.confirmDelete || !showConfirm)) {
                      item.action();
                    }
                  }}
                  disabled={item.isLoading}
                  className={`w-full cursor-pointer text-left group rounded-md flex items-center py-2.5 px-3 ${
                    item.className
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div>
                      <AnimatePresence mode="wait">
                        {item.confirmDelete && showConfirm ? (
                          <motion.div 
                            className="flex items-center justify-between w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-sm">Are you sure?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSkill();
                                }}
                                className="p-1 hover:bg-red-100 rounded-md"
                              >
                                <Check className="w-4 h-4 text-red-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowConfirm(false);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <item.icon className="w-4 h-4" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                {item.isLoading ? "Processing..." : item.label}
                              </p>
                              {item.description && (
                                <p className="text-xs text-zinc-700 dark:text-zinc-500">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
