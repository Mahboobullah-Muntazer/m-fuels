import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { useStateContext } from '../contexts/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { ClipLoader  } from 'react-spinners';

const AddEmploye = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const { user } = useAuthContext();
  const { currentColor } = useStateContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [isLoading,setIsLoading]=useState(false)

  const [formData, setFormData] = useState({
    name: '',
    NIC: '',
    contactNumber: '',
    position: '',
    joinDate: '',
    salary :'',
    address: '',
  });

  const handleInputChange = (field, value) => {
   
    if (field === 'salary' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-center' });
      return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };
  
  

  const handleAddEmployee = async () => {
    
    if (formData.name.trim() === '') {
      console.log('trigger error');
      toast.error('د کار مند نوم ضرور ده', {
        position: 'top-right',
      });

      return;
    } else if (formData.position.trim() === '') {
      toast.error('د کارمند پوزیشن داخل کول ضروری دی', {
        position: 'top-right',
      });

      return;
    } else if (formData.joinDate.trim() === '') {
      toast.error('د کارمند د استخدام نیټه داخل کول ضروری دی', {
        position: 'top-right',
      });

      return;
    }

    const { name, NIC, contactNumber, position, joinDate, salary, address } =
      formData;

     
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };

    const body = JSON.stringify({
      name, NIC, contactNumber, position, joinDate, salary, address
    });

    try {
       setDisableAddButton(true);
       setIsLoading(true)
      const res = await axios.post(
        SERVER_PATH + 'api/actions/addEmployee',
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
        navigate('/employees');
      } else {
        setIsLoading(false)
        toast.error(res.data.message, {
          position: 'top-right',
        });
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false)
    }finally {
      setDisableAddButton(false);
      setIsLoading(false)
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
        <h2 className='text-2xl font-semibold dark:text-gray-200  mb-6 mt-7'>
          Employee Information /  د کارمند معلومات 
        </h2>
        <div className='flex-grow grid grid-cols-1 md:flex-row gap-4'>
          {/* Input fields */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200    font-medium text-gray-600'>
              Name / نوم
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='Employee name / د کارمند نوم '
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
              NIC / تذکره نمبر
            </label>
            <input
              type='text'
              value={formData.NIC}
              onChange={(e) => handleInputChange('NIC', e.target.value)}
              name='NIC'
              placeholder='Employee NIC / د کارمند تذکره'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          {/* Second input row */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
              Contact Number / د تلفون شماره
            </label>
            <input
              type='text'
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange('contactNumber', e.target.value)
              }
              name='contactNumber'
              placeholder='Employee contact number / د کارمند تلفون شماره'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
              Position / موقف یا پوزیشن
            </label>
            <input
              type='text'
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              name='position'
              placeholder='Employee position / موقف یا پوزیشن'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
              Join Date / د استخدام نیټه
            </label>
            <input
              type='date'
              value={formData.joinDate}
              onChange={(e) => handleInputChange('joinDate', e.target.value)}
              name='joinDate'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          {/* Third input row */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
            Salary in USD / معاش پر ډالر
            </label>
            <input
              type='text'
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              name='salary'
              placeholder='Employee salary / د کارمند معاش'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
              Address / ادرس 
            </label>
            <textarea
              type='text'
              name='address'
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={4}
              style={{ resize: 'none' }}
              placeholder='Employee address / د کارمند ادرس'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
        </div>
        <button
          disabled={disableAddButton}
          onClick={handleAddEmployee}
          style={
            disableAddButton
              ? { background: '#808080' }
              : { background: currentColor }
          }
          className={` mt-4  dark:text-gray-200 text-white py-2 px-4 rounded-md ${
            disableAddButton ? '' : 'hover:drop-shadow-lg'
          }  ${disableAddButton ? 'cursor-not-allowed' : ''}`}
        >
          Save / ثبتول 
        </button>
      </div>
      {/* Image on the left side */}

      <div className='md:w-1/2 hidden sm:block'>
       
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddEmploye;
