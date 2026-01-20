export interface EightyHourGoal {
  id: string;
  title: string;
  createdAt: Date;
}

// Simple in-memory store for frontend prototyping
class GoalStore {
  private goals: EightyHourGoal[] = [];
  private listeners: (() => void)[] = [];

  getGoals() {
    return this.goals;
  }

  getGoal(id: string) {
    return this.goals.find((g) => g.id === id);
  }

  addGoal(title: string) {
    const goal: EightyHourGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      createdAt: new Date(),
    };
    this.goals = [goal, ...this.goals];
    this.notify();
    return goal;
  }

  deleteGoal(id: string) {
    this.goals = this.goals.filter((g) => g.id !== id);
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const goalStore = new GoalStore();
