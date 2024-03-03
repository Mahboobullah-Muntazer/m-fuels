import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateContext } from '../contexts/ContextProvider';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipLoader  } from 'react-spinners';

const SupplierDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function

  const supplierData = location.state?.data;
  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading,setIsLoading]=useState(true)

  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    _id: '',
    organizationName: '',
    authorizedPerson: '',
    contactNumber: '',
    address: '',
    isActive: false, // Add isActive field to formData
  });

  useEffect(() => {
    if (supplierData) {
      const { _id, organizationName, authorizedPerson, contactNumber, address, isActive } = supplierData;
      setFormData({
        _id,
        organizationName:'',
        authorizedPerson:'',
        contactNumber:'',
        address:'',
        isActive,
      });
      setIsLoading(false)
    }
  }, [supplierData]);

  const handleInputChange = (field, value) => {
    

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    const { _id, organizationName, authorizedPerson, contactNumber, address, isActive } = formData;

    // Check if all fields, except _id, are null or empty
    const isDataEmpty = !organizationName && !authorizedPerson && !contactNumber && !address && formData.isActive ===supplierData.isActive;

    if (isDataEmpty) {
      toast.info('هیس تغیرات نشته د ثبتولو لپاره', { position: 'top-right' });
      return;
    }
    setIsLoading(true)
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
    const body = JSON.stringify({
      _id,
      organizationName,
      authorizedPerson,
      contactNumber,
      address,
      isActive,
    });

    try {
      const res = await axios.put(
        SERVER_PATH + 'api/actions/updateSupplier',
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
          navigate('/suppliers');
        }
      }
    } catch (err) {
      setIsLoading(false)
      console.log(err);

      if (err.response.data.status === 'FAILED') {
        toast.error(err.response.data.message, {
          position: 'top-center',
        });
      } else {
        toast.error('Error occurred while updating supplier data', {
          position: 'top-right',
        });
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen'>
      {/* Doubled width of the form */}
      <div className='w-760 m-2 p-10 md:p-10 dark:bg-gray-600 bg-white rounded-3xl'>
        <h2 className='text-2xl dark:text-gray-200 font-semibold mb-6 mt-7'>
          Supplier Details/ عرضه کوونکی جزیات
        </h2>
        {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )} 
       <div className='grid grid-cols-1 md:flex-row gap-4'>
          {/* Organization Name input field */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              LTd Name / شرکت نوم
            </label>
            <input
              type='text'
              id='organizationName'
              name='organizationName'
              placeholder={
                supplierData
                  ? supplierData.organizationName
                  : ' LTd Name / شرکت نوم'
              }
              required
              value={formData.organizationName}
              onChange={(e) =>
                handleInputChange('organizationName', e.target.value)
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              Person in charge / مسول شخص
            </label>
            <input
              type='text'
              id='authorizedPerson'
              name='authorizedPerson'
              placeholder={
                supplierData
                  ? supplierData.authorizedPerson
                  : ' Person in charge / مسول شخص'
              }
              required
              value={formData.authorizedPerson}
              onChange={(e) =>
                handleInputChange('authorizedPerson', e.target.value)
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
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
                  supplierData ? supplierData.contactNumber : 'Contact Number/تلفون شماره'
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
                placeholder={supplierData ? supplierData.address : 'address / ادرس '}
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              />
            </label>
          </div>

          {/* Status dropdown */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              Status /حالت
              <select
                id='isActive'
                name='isActive'
                value={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              >
                <option value={true}>Activate /  فعال</option>
                <option value={false}>Deactivate / غیرفعال</option>
              </select>
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

export default SupplierDetails;
