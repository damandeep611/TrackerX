"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus,
  Circle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getGoalBySlug } from '@/actions/goalActions';

interface Goal {
  id: string;
  title: string;
  slug: string;
  startDate?: string;
  createdAt: string;
  userId: string;
}

// --- Sub-Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card text-card-foreground rounded-3xl p-6 shadow-sm border border-border/50 ${className}`}>
    {children}
  </div>
);

// 1. Goal List Block
const GoalListBlock = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Work on research paper", completed: false },
    { id: 2, text: "Call mentor", completed: false },
    { id: 3, text: "Update notion board", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  return (
    <Card className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">Goal list</h3>
      </div>
      
      <div className="relative">
        <Plus size={16} className="absolute left-3 top-3 text-muted-foreground" />
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tasks here" 
          className="w-full bg-muted/30 hover:bg-muted/50 focus:bg-background border border-transparent focus:border-border rounded-xl py-2.5 pl-9 pr-4 text-sm transition-all outline-none"
        />
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 group cursor-pointer">
            <button className="text-muted-foreground hover:text-blue-500 transition-colors">
              <Circle size={18} />
            </button>
            <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const foundGoal = await getGoalBySlug(params.goalId as string);
        if (foundGoal) {
          setGoal(foundGoal as any);
        }
      } catch (error) {
        console.error("Error fetching goal:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.goalId) {
      fetchGoal();
    }
  }, [params.goalId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading goal...</div>;
  if (!goal) return <div className="p-8 text-center text-muted-foreground">Goal not found.</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 min-h-screen space-y-6">
      
      {/* Ultra Compact Navigation Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <button 
          onClick={() => router.push('/dashboard/80-hour-goals')}
          className="p-1.5 hover:bg-muted rounded-lg transition-all group"
        >
          <ArrowLeft size={16} className="text-muted-foreground group-hover:text-foreground" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-foreground">{goal.title}</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto w-full min-h-[500px]"
      >
        <GoalListBlock />
      </motion.div>
    </div>
  );
}