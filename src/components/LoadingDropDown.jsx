import React from 'react'

const LoadingDropDown = () => {
  return (
    <div className='relative w-full'>
    <select
      id='supplier'
      disabled
      className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
    >
      <option>Loading...</option>
    </select>
    <div className='absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none'>
      <svg
        className='animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        ></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5a8 8 0 016.307-7.865M14 20a8 8 0 100-16 8 8 0 000 16z'
        ></path>
      </svg>
    </div>
  </div>
  )
}

export default LoadingDropDown