"use client"
import React, { useState } from 'react'
import GoalsForm from './GoalsForm'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import GoalCard from './GoalCard'
import { differenceInDays } from 'date-fns'
import { addGoal, addGoalReflection, deleteGoal, toggleGoalCompletion, updateGoalStartDate } from '@/actions/goalActions'
import { toast } from 'react-hot-toast'

interface Goal {
  id: string
  userId: string
  title: string
  startDate?: string | null
  completedDate?: string | null
  daysToComplete?: number | null
  reflectionNote?: string | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

interface GoalsContainerProps {
  initialGoals: Goal[]
}

export default function GoalsContainer({ initialGoals }: GoalsContainerProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const handleAddGoal = async (title: string) => {
    // Create optimistic goal
    const optimisticGoal: Goal = {
      id: crypto.randomUUID(), // Temporary ID
      userId: '', // Will be set by server
      title,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistically update UI
    setGoals(prev => [...prev, optimisticGoal]);

    try {
      const newGoal = await toast.promise(
        addGoal({ title }),
        {
          loading: 'Adding goal...',
          success: 'Goal added successfully!',
          error: 'Failed to add goal'
        }
      );

      // Update with actual server response
      setGoals(prev => prev.map(goal => 
        goal.id === optimisticGoal.id ? newGoal as Goal : goal
      ));
    } catch (error) {
      // Revert optimistic update on error
      setGoals(prev => prev.filter(goal => goal.id !== optimisticGoal.id));
      console.error('Failed to add goal:', error);
    }
  };

  const handleStartDateSet = async (id: string, date: string) => {
    // Optimistically update UI
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, startDate: date } : goal
    ));

    try {
      const updatedGoal = await toast.promise(
        updateGoalStartDate({ id, startDate: date }),
        {
          loading: 'Setting start date...',
          success: 'Start date set!',
          error: 'Failed to set start date'
        }
      );

      // Update with actual server response
      setGoals(prev => prev.map(goal => 
        goal.id === id ? updatedGoal as Goal : goal
      ));
    } catch (error) {
      // Revert optimistic update on error
      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, startDate: null } : goal
      ));
      console.error('Failed to update goal start date:', error);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const now = new Date().toISOString();
    const daysToComplete = goal.startDate 
      ? differenceInDays(new Date(now), new Date(goal.startDate))
      : 0;

    // Optimistically update UI
    const optimisticUpdate = {
      ...goal,
      isCompleted: !goal.isCompleted,
      completedDate: !goal.isCompleted ? now : null,
      daysToComplete: !goal.isCompleted ? daysToComplete : null
    };

    setGoals(prev => prev.map(g => 
      g.id === id ? optimisticUpdate : g
    ));

    try {
      const updatedGoal = await toast.promise(
        toggleGoalCompletion({
          id,
          isCompleted: !goal.isCompleted,
          completedDate: !goal.isCompleted ? now : undefined,
          daysToComplete: !goal.isCompleted ? daysToComplete : undefined
        }),
        {
          loading: 'Updating goal...',
          success: !goal.isCompleted ? 'Goal completed!' : 'Goal uncompleted',
          error: 'Failed to update goal'
        }
      );

      // Update with actual server response
      setGoals(prev => prev.map(g => 
        g.id === id ? updatedGoal as Goal : g
      ));
    } catch (error) {
      // Revert optimistic update on error
      setGoals(prev => prev.map(g => 
        g.id === id ? goal : g
      ));
      console.error('Failed to toggle goal completion:', error);
    }
  };

  const handleReflectionAdd = async (id: string, note: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    // Optimistically update UI
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, reflectionNote: note } : g
    ));

    try {
      const updatedGoal = await toast.promise(
        addGoalReflection({ id, reflectionNote: note }),
        {
          loading: 'Adding reflection...',
          success: 'Reflection added!',
          error: 'Failed to add reflection'
        }
      );

      // Update with actual server response
      setGoals(prev => prev.map(g => 
        g.id === id ? updatedGoal as Goal : g
      ));
    } catch (error) {
      // Revert optimistic update on error
      setGoals(prev => prev.map(g => 
        g.id === id ? { ...g, reflectionNote: goal.reflectionNote } : g
      ));
      console.error('Failed to add reflection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (!goalToDelete) return;

    // Optimistically update UI
    setGoals(prev => prev.filter(goal => goal.id !== id));

    try {
      await toast.promise(
        deleteGoal(id),
        {
          loading: 'Deleting goal...',
          success: 'Goal deleted!',
          error: 'Failed to delete goal'
        }
      );
    } catch (error) {
      // Revert optimistic update on error
      setGoals(prev => [...prev, goalToDelete]);
      console.error('Failed to delete goal:', error);
    }
  };

  // Separate goals into pending, active and completed
  const pendingGoals = goals.filter(goal => !goal.startDate && !goal.isCompleted);
  const activeGoals = goals.filter(goal => goal.startDate && !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  return (
    <div className='flex-1 p-6 space-y-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/20">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goal List</h1>
            <p className="text-zinc-400 mt-1">Track and complete your personal goals over time</p>
          </div>
        </div>
      </motion.div>

      <div>
        <GoalsForm onSubmit={handleAddGoal}/>
      </div>

      <div className="space-y-8">
        {pendingGoals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Pending Goals</h2>
              <span className="px-2 py-1 text-xs font-medium bg-zinc-800 rounded-full">
                {pendingGoals.length}
              </span>
            </div>
            <div className="space-y-4">
              {pendingGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onStartDateSet={handleStartDateSet}
                  onToggleComplete={handleToggleComplete}
                  onReflectionAdd={handleReflectionAdd}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeGoals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Active Goals</h2>
              <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
                {activeGoals.length}
              </span>
            </div>
            <div className="space-y-4">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onStartDateSet={handleStartDateSet}
                  onToggleComplete={handleToggleComplete}
                  onReflectionAdd={handleReflectionAdd}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </motion.div>
        )}

        {completedGoals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Completed Goals</h2>
              <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                {completedGoals.length}
              </span>
            </div>
            <div className="space-y-4">
              {completedGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onStartDateSet={handleStartDateSet}
                  onToggleComplete={handleToggleComplete}
                  onReflectionAdd={handleReflectionAdd}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
