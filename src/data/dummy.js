import React from 'react';
import {
  AiOutlineAreaChart,
  AiOutlineBarChart,
  AiOutlineStock,
} from 'react-icons/ai';
import {
  FiShoppingBag,

  FiPieChart,
 
} from 'react-icons/fi';

import { PiUsersFill } from 'react-icons/pi';
import { BiSolidDashboard } from "react-icons/bi";
import { TbBusinessplan } from "react-icons/tb";
import {
  
  MdManageAccounts,

} from 'react-icons/md';


export const gridOrderImage = (props) => (
  <div>
    <img
      className='rounded-xl h-20 md:ml-3'
      src={props.ProductImage}
      alt='order-item'
    />
  </div>
);

export const gridOrderStatus = (props) => (
  <button
    type='button'
    style={{ background: props.StatusBg }}
    className='text-white py-1 px-2 capitalize rounded-2xl text-md'
  >
    {props.Status}
  </button>
);







export const links = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'dashboard / ډشبورډ',
        link: 'dashboard',
        icon: <BiSolidDashboard size={25} />,
      },
    ],
  },

  {
    title: 'Management / منجمنت  ',
    links: [
      {
        name: '‌Business / تجارت',
        link: 'business',
        icon: <TbBusinessplan size={25} />,
      },

      {
        name: 'Management / منجمنټ ',
        link: 'management',
        icon: <MdManageAccounts size={25} />,
      },
      
     
      {
        name: 'Reports / ریپورټونه',
        link: 'reports',
        icon: <AiOutlineStock size={25} />,
      },
    
    ],
  },
  
  {
    title: 'Settings / تنظیمات',

    links: [
      {
        name: 'Collections ',
        link: 'collections',
        icon: <PiUsersFill size={25} />,
      },
      // {
      //   name: 'users / کارونکی',
      //   link: 'users',
      //   icon: <PiUsersFill />,
      // },
      // {
      //   name: 'backup / بک اپ',
      //   link: 'backupAndRestore',
      //   icon: <MdBackup />,
      // },
    ],
  },
];

export const linksView = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'dashboard / ډشبورډ',
        link: 'dashboard',
        icon: <FiShoppingBag />,
      },
    ],
  },

  {
    title: 'Reports / ریپورټونه',
    links: [
      {
        name: 'General / عمومی',
        link: 'generalReport',
        icon: <AiOutlineStock />,
      },
      {
        name: 'Sales / خرڅلاو',
        link: 'salesReport',
        icon: <AiOutlineStock />,
      },
      {
        name: 'purchase / خرید',
        link: 'purchaseReport',
        icon: <AiOutlineAreaChart />,
      },

      {
        name: 'expenses / لګښتونه',
        link: 'expensesReport',
        icon: <AiOutlineBarChart />,
      },
      {
        name: 'salaries / معاشونه',
        link: 'slariesReport',
        icon: <FiPieChart />,
      },
    ],
  },
];




export const themeColors = [
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
];


