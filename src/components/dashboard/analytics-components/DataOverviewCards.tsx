import { BookOpen, CalendarClock, Clock, Hourglass } from 'lucide-react';
import React, { ReactNode } from 'react'

export default function DataOverviewCards() {
  return (
    <div className='p-4'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <DataCards title='Total Hours' hours={18} description='Avaiable Hours Today' icon={<Hourglass size={18}  />} percentage={5.9}/>
        <DataCards title='Time Spend' hours={13} description='Time spend on skills and working' icon={<CalendarClock size={18} />} percentage={10.1}/>
        <DataCards title='remaining hours' hours={5} description='Remaining hours today' icon={<Clock size={18}  />}/>
        <DataCards title='Bookmarks' hours={7} description='Number of links added to tasks' icon={<BookOpen size={18} />} percentage={12}/>
      </div>
    </div>
  )
}


interface DataCardsProps {
  title: string;
  hours: number;
  description: string;
  percentage?: number;
  icon: ReactNode;
}


const DataCards = ({title, hours, description, percentage, icon}:DataCardsProps)=> {
  return(
    <div className='border border-border rounded-md'>
      <div className='flex flex-col  justify-center gap-2 p-4'>
        <div className=' w-full flex items-center justify-between'>
          <h3 className='text-lg font-bold capitalize'>{title}</h3>
          <span>
            {icon}
          </span>
        </div>
        <div>
          <p className='text-3xl font-bold'>{hours}</p>
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-xs'>{description}</p>
          <p className='text-xs'>{percentage}%</p>
        </div>
      </div>
    </div>
  )
}
