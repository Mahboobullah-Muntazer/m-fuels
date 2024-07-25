import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateContext } from '../../contexts/ContextProvider';

import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';

import { ClipLoader  } from 'react-spinners';

const CustomerDetails = ({customerData,handleBackToCustomers}) => {

  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const [isLoading,setIsLoading]=useState(true)

  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    _id: '',
    customerName: '',
    contactNumber: '',
    type:'',
    address: '',
    isActive: false, // Add isActive field to formData
  });

  useEffect(() => {
    if (customerData) {
      setIsLoading(false)
      const { _id, customerName, type,contactNumber, address, isActive } = customerData;
      setFormData({
        _id,
        type,
        customerName:'',
        contactNumber:'',
        address:'',
        isActive,
      });
    }
  }, [customerData]);

  const handleInputChange = (field, value) => {
    

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    const { _id, customerName,type, contactNumber, address, isActive } = formData;

    // Check if all fields, except _id, are null or empty
    const isDataEmpty = !customerName   && !contactNumber && !address && formData.isActive ===customerData.isActive && formData.type ===customerData.type;

    if (isDataEmpty) {
      toast.info('هیس تغیرات نشته د ثبتولو لپاره', { position: 'top-right' });
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
    const body = JSON.stringify({
      _id,
      customerName,
      contactNumber,
      address,
      type,
      isActive,
    });

    try { setIsLoading(true)
      const res = await axios.put(
        SERVER_PATH + 'api/actions/updateCustomer',
        body,
        config
      );

      if (res.data.status) {
        setIsLoading(false)
        if (res.data.status === 'FAILED') {
          setIsLoading(false)
          toast.error(res.data.message, {
            position: 'top-right',
          });
        } else {
          setIsLoading(false)
          toast.success('معلومات تغیر شول', {
            position: 'top-right',
          });
          handleBackToCustomers()
        }
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false)
      if (err.response.data.status === 'FAILED') {
        toast.error(err.response.data.message, {
          position: 'top-center',
        });
      } else {
        toast.error('معلومات تغیر نه شول دوباره کوشش وکړی', {
          position: 'top-right',
        });
      }
    }
  };

  return (
    <div className='flex  items-center justify-center min-h-screen'>
      {/* Doubled width of the form */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
         <div className='w-full p-4  md:mt-20 bg-white '>
        <h2 className='text-2xl dark:text-gray-200 font-semibold mb-6 mt-7'>
          Customer Details/ پیرودونکی جزیات
        </h2>
        <div className='grid grid-cols-1 md:flex-row gap-4'>
          {/* Organization Name input field */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              Cutomer Name / پیرودونکی نوم
            </label>
            <input
              type='text'
             
              name='customerName'
              placeholder={
                customerData
                  ? customerData.customerName
                  : '  Cutomer Name / پیرودونکی نوم '
              }
              required
              value={formData.customerName}
              onChange={(e) =>
                handleInputChange('customerName', e.target.value)
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

      
          <div className='mb-4' >
          <label className="block  mb-2 text-sm font-bold">Customer Type / د پیرودونکی ډول</label>
          <div className="flex space-x-4 border-1 p-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="normal"
              checked={formData.type === 'normal'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mr-2"
            />
            Normal / عادی
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="partner"
              checked={formData.type === 'partner'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mr-2"
            />
            Partner / شریک
          </label>
        </div>
       
          </div>


          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Contact Number/تلفون شماره
              <input
                type='text'
                id='contactNumber'
                name='contactNumber'
                value={formData.contactNumber}
                onChange={(e) =>
                  handleInputChange('contactNumber', e.target.value)
                }
                placeholder={
                  customerData ? customerData.contactNumber : 'Contact Number/تلفون شماره'
                }
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
                placeholder={customerData ? customerData.address : 'address / ادرس '}
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>

         

          {/* Action buttons */}
          <div className='flex items-center mt-4 space-x-4'>
            <button
              onClick={handleUpdate}
              style={{ background: currentColor }}
              className={`dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg`}
            >
              Update/تغیرول
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />

      {/* Confirm Dialog */}
     
    </div>
  );
};

export default CustomerDetails;
