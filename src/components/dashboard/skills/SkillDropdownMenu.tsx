import { Check, LogOut, RotateCcw, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { useDeleteSkillCard } from "@/hooks/useSkills";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "motion/react";

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
  const deleteSkill = useDeleteSkillCard();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteSkill = async () => {
    try {
      setIsDeleting(true);
      await deleteSkill.mutateAsync(skillId);
      toast.success("Skill deleted successfully");
      router.push("/dashboard");
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
            ? "opacity-50 cursor-not-allowed hover:bg-destructive/10 text-text-secondary hover:text-destructive"
            : "hover:bg-destructive/10 text-text-secondary hover:text-destructive",
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
          className: "hover:bg-accent/10 text-text-secondary hover:text-accent",
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
          className: "hover:bg-surface-highlight text-text-secondary hover:text-primary",
        },
      ],
    },
  ];

  return (
    <div className="absolute right-0 mt-3 w-64 bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="py-2">
        {SkillDropdownItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className={sectionIndex > 0 ? "mt-1 pt-1 border-t border-border" : ""}>
            {section.title && (
              <div className="px-4 py-1.5">
                <p className="text-text-tertiary text-[10px] font-bold uppercase tracking-wider">
                  {section.title}
                </p>
              </div>
            )}
            <div className="space-y-0.5 px-1.5">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => {
                    if (
                      !item.isLoading &&
                      (!item.confirmDelete || !showConfirm)
                    ) {
                      item.action();
                    }
                  }}
                  disabled={item.isLoading}
                  className={`w-full cursor-pointer text-left group rounded-lg flex items-center py-2 px-2.5 transition-all ${item.className}`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        {item.confirmDelete && showConfirm ? (
                          <motion.div
                            className="flex items-center justify-between w-full"
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.15 }}
                          >
                            <span className="text-xs font-semibold">Delete?</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSkill();
                                }}
                                className="p-1 hover:bg-destructive hover:text-white rounded-md transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowConfirm(false);
                                }}
                                className="p-1 hover:bg-surface-highlight text-text-secondary rounded-md transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <item.icon className="w-3.5 h-3.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium">
                                {item.isLoading ? "Processing..." : item.label}
                              </p>
                              {item.description && (
                                <p className="text-[10px] text-text-tertiary group-hover:text-inherit/70">
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
