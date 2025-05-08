import React from 'react'
import PricingCard from './cards/pricing-card'

export default function Pricing() {
  return (
    <div className='border-y-3 border-dashed border-gray-300 bg-neutral-100'>
      <div className='max-w-5xl mx-auto border-x-3 border-dashed border-gray-300'>
        {/* pricing section Heading */}
        <div className='flex flex-col items-center justify-center space-y-6 py-8 border-x-3 border-dashed border-gray-300 mx-20'>
          <h2 className='text-4xl font-semibold'>Pricing</h2>
          <p className='text-lg font-medium'>AI integrated feedback on improving routines and productivity</p>
        </div>
        {/* Pricing Card */}
        <div className='mb-20 border-y-3 border-dashed border-gray-300  p-12'>
          <PricingCard/>
        </div>
      </div>
    </div>
  )
}
