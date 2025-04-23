import { db } from '@/db/drizzle';
import { skillCard } from '@/db/schema/schema';
import { eq } from 'drizzle-orm';
import React from 'react'

export default async function SkillOverview({params}: {params: Promise< {id: string}>}) {
  const resolvedParams = await params;
  const skillId = resolvedParams.id

  try{
    const skill = await db.select().from(skillCard).where(eq(skillCard.id, skillId)).limit(1);

    if(!skill[0]) return <div>Skill Not found...</div>
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <h2 className='text-2xl font-bold'>{skill[0].skillName}</h2>
        <p>More Features coming soon....</p>
      </div>
    )
  }catch(error){
    console.error("Error Fetching skills:", error)
    return <div>Error loading skill please try again</div>
  }

  //fetching skill id from database
  
}
