import { Skill } from '@/types/skillDashboardTypes'
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react'
import React, { useState } from 'react'


interface SkillCardProps {
  skill: Skill
  onEdit: (skill: Skill) => void
  onDelete: (id: string) => void
}

export default function SkillCard({skill, onEdit, onDelete}:SkillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);


  // formatting time 
  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (wholeHours === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${wholeHours} hour${
      wholeHours !== 1 ? "s" : ""
    } ${minutes} minute'${minutes !== 1 ? "s" : ""}`;
  };


  return (
    <div className=' p-2 rounded-md hover:shadow-md border border-gray-500 cursor-pointer'>
      {/* skill card header and expand card */}
      <div className='flex justify-between items-start mb-4'>
        <div className=''>
          <h3 className='text-xl font-medium'>{skill.skillName}</h3>
          <span className='text-sm'>{skill.category}</span>
        </div>
        <div>
          <button>
            <PlusIcon/>
          </button>
          <button className='' onClick={()=> setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUpIcon/> : <ChevronDownIcon/>}
          </button>
        </div>
      </div>
      {/* skill card data */}
      <div>
        <div className='flex items-center justify-between'>
          <span>{formatTime(skill.currentHours)}</span>
          <span>{formatTime(skill.targetHours)}</span>
        </div>
      </div>
      {/* skill card expansion for showing delete and edit button */}
      {isExpanded && (
        <div>
          <div>
            <button onClick={()=> onEdit(skill)}>Edit</button>
            <button onClick={()=> onDelete(skill.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}
