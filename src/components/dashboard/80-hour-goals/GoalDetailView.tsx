"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { SprintGauge } from '@/components/dashboard/80-hour-goals/SprintGauge';
import { SprintSessionModal } from '@/components/dashboard/80-hour-goals/SprintSessionModal';
import { SprintHistory } from '@/components/dashboard/80-hour-goals/SprintHistory';
import { useAddGoalLog, useDeleteGoalLog, useGoal, useGoalLogs } from '@/hooks/useGoals';

export default function GoalDetailView({ slug }: { slug: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: goal, isPending: goalPending } = useGoal(slug);
  const { data: logs = [], isPending: logsPending } = useGoalLogs(goal?.id);
  const addLog = useAddGoalLog(goal?.id ?? "");
  const deleteLog = useDeleteGoalLog(goal?.id ?? "");
  const loading = goalPending || (!!goal && logsPending);

  const handleAddLog = async (data: { title: string; startTime: Date; endTime: Date }) => {
    if (!goal) return;
    addLog.mutate(data, { onError: () => toast.error("Failed to log session") });
  };

  const handleDeleteLog = async (id: string) => {
    if (id.startsWith("temp-")) return; // still saving
    deleteLog.mutate(id, { onError: () => toast.error("Failed to delete session") });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading reactor core...</div>;
  if (!goal) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Goal module not found.</div>;

  const totalMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 min-h-screen space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/80-hour-goals')}
            className="p-2 hover:bg-muted rounded-xl transition-all group"
          >
            <ArrowLeft size={20} className="text-muted-foreground group-hover:text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Target className="text-blue-500" size={20} />
              {goal.title}
            </h1>
            <p className="text-xs text-muted-foreground ml-7">Sprint Dashboard</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Visualizer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-start"
        >
          <div className="relative">
             <SprintGauge 
               totalMinutes={totalMinutes} 
               onClick={() => setIsModalOpen(true)} 
             />
             
             {/* Instructional Text */}
             <div className="mt-8 text-center max-w-xs">
                <p className="text-sm text-muted-foreground">
                   Click the reactor ring to log a deep work session. 
                   Aim for <span className="text-blue-400 font-bold">20h milestones</span>.
                </p>
             </div>
          </div>
        </motion.div>

        {/* Right Column: History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/50 rounded-3xl p-6 border border-border/50 min-h-[500px]"
        >
          <SprintHistory logs={logs} onDelete={handleDeleteLog} />
        </motion.div>

      </div>

      {/* Modal */}
      <SprintSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddLog} 
      />

    </div>
  );
}
