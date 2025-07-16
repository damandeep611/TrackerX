import GoalsContainer from '@/components/dashboard/goals-list/GoalsContainer'
import { getGoals } from '@/actions/goalActions'
import React from 'react'

export default async function GoalsPage() {
  const initialGoals = await getGoals();

  return (
    <div>
      <GoalsContainer initialGoals={initialGoals}/>
    </div>
  )
}
