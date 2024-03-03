import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { useStateContext } from '../contexts/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { ClipLoader  } from 'react-spinners';

const AddSupplier = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const { user } = useAuthContext();
  const { currentColor } = useStateContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [isLoading,setIsLoading]=useState(false)

  const [formData, setFormData] = useState({
    organizationName: '',
    authorizedPerson: '',
    contactNumber: '',
    address: '',
  });

  const handleInputChange = (field, value) => {

    

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  }; 

  const handleAddSupplier = async () => {
    if (formData.organizationName.trim() === '') {
      toast.error('شرکت نوم داخلول ضروری دی', {
        position: 'top-right',
      });

      return;
    }else if (formData.authorizedPerson.trim() === '') {
      toast.error('مسول شخص نوم داخلول ضروری دی', {
        position: 'top-right',
      });

      return;
    }

    const { organizationName, authorizedPerson, contactNumber, address } =
      formData;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };

    const body = JSON.stringify({
      organizationName,
      authorizedPerson,
      contactNumber,
      address,
    });

    try {
      setIsLoading(true)
      setDisableAddButton(true);
      const res = await axios.post(
        SERVER_PATH + 'api/actions/addSupplier',
        body,
        config
      );

      console.log(res.data);
      if (res.data.status === 'SUCCESS') {
        setIsLoading(false)
        toast.success('Supplier added successfully!', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        navigate('/suppliers');
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
    <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
         <div className='md:w-2/3 dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
        <h2 className='text-2xl dark:text-gray-200 font-semibold mb-6 mt-7'>
          Supplier Information/عرضه کوونکي معلومات
        </h2>
        <div className='flex-grow grid grid-cols-1 md:flex-row gap-4'>
          {/* Input fields */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              LTd Name / شرکت نوم
              <input
                type='text'
                id='organizationName'
                name='organizationName'
                placeholder=' LTd Name / شرکت نوم'
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                required
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Person in charge / مسول شخص
              <input
                type='text'
                id='authorizedPerson'
                name='authorizedPerson'
                value={formData.authorizedPerson}
                onChange={(e) => handleInputChange('authorizedPerson', e.target.value)}
              
                placeholder='Person in charge / مسول شخص'
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
                placeholder='عرضه کوونکی ادرس'
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>
        </div>
        <button
        disabled={disableAddButton}
          onClick={handleAddSupplier}
       
          style={disableAddButton?{background:'#808080'}:{  background: currentColor }} className={` mt-4 dark:text-gray-200 text-white py-2 px-4 rounded-md ${disableAddButton?'':'hover:drop-shadow-lg'}  ${disableAddButton?'cursor-not-allowed':''}`}>
          Save/ثبتول
        </button>
      </div>
     
      <div className='md:w-1/2 hidden sm:block'>
       
      </div>
   
      <ToastContainer />
    </div>
  );
};

export default AddSupplier;
