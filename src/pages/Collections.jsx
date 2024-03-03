
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { useStateContext } from '../contexts/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { ClipLoader  } from 'react-spinners';
import AvailableCollection from '../components/AvailableCollection';

const Collections = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const { user } = useAuthContext();
  const { currentColor } = useStateContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [isLoading,setIsLoading]=useState(false)

  const handleCreate = async() => {
    if (selectedDate==='')
    {
      toast.warning('  نیټه انتخاب کړی', {
        position: 'top-center',
      });

      return
    }

    // Extract only month and year
    const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const selectedYear = selectedDate.getFullYear();

    // Format the result
    const formattedDate = `${selectedMonth}-${selectedYear}`;

   
  
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
  
      const body = JSON.stringify({
        formattedDate
      });
  
      try {
        setDisableAddButton(true);
        setIsLoading(true)
        const res = await axios.post(
          SERVER_PATH + 'api/actions/addManagmentCollection',
          body,
          config
        );
  
        if (res.data.status === 'SUCCESS') {
          setIsLoading(false)
          toast.success('ریکارد ثب شو', {
            position: 'top-center',
          });
          // Redirect or update your UI as needed
         // navigate('/customers');
        } else {
          setIsLoading(false)
          toast.error(res.data.message, {
            position: 'top-right',
          });
        }
      } catch (err) {
        setIsLoading(false)
        console.log(err);
       
      }finally {
        setIsLoading(false)
        setDisableAddButton(false);
      }













  
  };

  // Function to format the date to 'yyyy-MM' for the input field
  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <div className="w-full mx-auto mt-8 p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Collection Management - ټولګه تنظیم</h1>
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
     

     <div className='w-full flex-col  mb-[-50px] gap-4 pl-20'>
     <div className="mb-4 w-2/4">
        <label className="block text-sm font-medium text-gray-600">Select Year and Month:</label>
        <input
          type="month"
          value={formatDateForInput(selectedDate)}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="border rounded-md p-2 w-full"
          max={formatDateForInput(new Date())} // Set max to current year-month
        />
      </div>

      <button
        onClick={handleCreate}
        style={{background:currentColor}}
        className=" w-2/4  h-11 mt-5 flex-1 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
      >
        New Collection / نوی ټولګه
      </button>
     </div>
      <ToastContainer />

      <AvailableCollection/>
    </div>
  );
}

export default Collections;
