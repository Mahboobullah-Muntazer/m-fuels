import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { useStateContext } from '../../contexts/ContextProvider';

import { useAuthContext } from '../../hooks/useAuthContext';
import { ClipLoader  } from 'react-spinners';

const AddSarafi = ({handleBackToSarafis}) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const { user } = useAuthContext();
  const { currentColor } = useStateContext();

  const [disableAddButton, setDisableAddButton] = useState(false);
  const [isLoading,setIsLoading]=useState(false)

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
  });

  const handleInputChange = (field, value) => {

    

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  }; 

  const handleAddSarafi = async () => {
    if (formData.name.trim() === '') {
      toast.error('صرافی نوم داخلول ضروری دی', {
        position: 'top-right',
      });

      return;
    }

    const { name, contactNumber, address } =
      formData;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };

    const body = JSON.stringify({
      name,
      
      contactNumber,
      address,
    });

    try {
      setDisableAddButton(true);
      setIsLoading(true)
      const res = await axios.post(
        SERVER_PATH + 'api/actions/addSarafi',
        body,
        config
      );

      console.log(res.data);
      if (res.data.status === 'SUCCESS') {
        setIsLoading(false)
        toast.success('صرافی ثبت شو', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        handleBackToSarafis();
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

  return (
    <div className='w-full p-4  md:mt-20 bg-white  flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
       <div className='w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
        <h2 className='text-2xl dark:text-gray-200 font-semibold mb-6 mt-7'>
          Sarafi Information / صرافی معلومات 
                  </h2>
        <div className='flex-grow grid grid-cols-1 md:flex-row gap-4'>
          {/* Input fields */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
               Sarafi Name / صرافی نوم
              <input
                type='text'
                
                name='name'
                placeholder='Sarafi Name / صرافی نوم'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>

     

          {/* Second input row */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Contact Number/تلفون شماره
              <input
                type='text'
                id='contactNumber'
                name='contactNumber'
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              
                placeholder='Contact Number/تلفون شماره'
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              Address / ادرس
              <textarea
                id='address'
                name='address'
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              
                rows={4}
                style={{ resize: 'none' }}
                placeholder='صرافی ادرس'
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>
        </div>
        <button
        disabled={disableAddButton}
          onClick={handleAddSarafi}
       
          style={disableAddButton?{background:'#808080'}:{  background: currentColor }} className={` mt-4 dark:text-gray-200 text-white py-2 px-4 rounded-md ${disableAddButton?'':'hover:drop-shadow-lg'}  ${disableAddButton?'cursor-not-allowed':''}`}>
          Save/ثبتول
        </button>
      </div>

      {/* Image on the left side */}
   
      <ToastContainer />
    </div>
  );
};

export default AddSarafi;
