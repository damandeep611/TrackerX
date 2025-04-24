"use client"
import React from 'react'
import TodoForm from './TodoForm'

export default function SkillTaskDashboard() {

  const dummySubmit = () => {
    console.log("Form submitted:");
  };
  return (
    <div>
      here we will show the Skill Tasks and Tabs
      <TodoForm onSubmit={dummySubmit}/>
    </div>
  )
}
