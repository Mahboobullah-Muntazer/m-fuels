import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateContext } from '../contexts/ContextProvider';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipLoader  } from 'react-spinners';

const EmployeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function

  const EmployeeData = location.state?.data;
  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading,setIsLoading]=useState(true)

  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    NIC: '',
    contactNumber: '',
    position: '',
    joinDate: '',
    salary: '',
    address: '',
    isActive: false, // Add isActive field to formData
  });

  useEffect(() => {
    if (EmployeeData) {
      setIsLoading(false)
      const {
        _id,
        name,
        NIC,
        contactNumber,
        position,
        joinDate,
        salary,
        address,
        isActive,
      } = EmployeeData;

      setFormData({
        _id,
        name: '',
        NIC: '',
        contactNumber: '',
        position: '',
        joinDate: '',
        salary: '',
        address: '',
        isActive,
      });
    }
  }, [EmployeeData]);

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

  const handleUpdate = async () => {
    const {
        _id,
        name,
        NIC,
        contactNumber,
        position,
        joinDate,
        salary,
        address,
        isActive,
    } = formData;

    // Check if all fields, except _id, are null or empty
    const isDataEmpty =
      !name &&
      !NIC &&
      !contactNumber &&
      !position &&
      !joinDate &&
      !salary &&
      !address &&
      formData.isActive === EmployeeData.isActive;

    if (isDataEmpty) {
      toast.info('No changes to update.', { position: 'top-center' });
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
        name,
        NIC,
        contactNumber,
        position,
        joinDate,
        salary,
        address,
        isActive,
    });

    try {
      setIsLoading(true)
      const res = await axios.put(
        SERVER_PATH + 'api/actions/updateEmployee',
        body,
        config
      );

      if (res.data.status) {
        setIsLoading(false)
        if (res.data.status === 'FAILED') {
          toast.error(res.data.message, {
            position: 'top-right',
          });
        } else {
          setIsLoading(false)
          toast.success('Supplier data updated successfully!', {
            position: 'top-center',
          });
          navigate('/employees');
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
        toast.error('Error occurred while updating supplier data', {
          position: 'top-right',
        });
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen'>
      {/* Doubled width of the form */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
        <div className='w-760 m-2 p-10 md:p-10 dark:bg-gray-600 bg-white rounded-3xl'>
        <h2 className='text-2xl dark:text-gray-200 font-semibold mb-6 mt-7'>
          Employee Details / د کارمند جزیات
        </h2>
        <div className='grid grid-cols-1 md:flex-row gap-4'>
          {/* Organization Name input field */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Name / نوم
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}

              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={
                EmployeeData ? EmployeeData.name : 'name/نوم'
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            NIC / تذکره نمبر
            </label>
            <input
              type='text'
              value={formData.NIC}
              onChange={(e) => handleInputChange('NIC', e.target.value)}
              name='NIC'
              placeholder={
                EmployeeData ? EmployeeData.NIC : 'NIC / تذکره نمبر'
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          {/* Second input row */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Contact Number / د تلفون شماره
            </label>
            <input
              type='text'
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange('contactNumber', e.target.value)
              }
              name='contactNumber'
              placeholder={
                EmployeeData ? EmployeeData.contactNumber : 'Contact Number / د تلفون شماره'
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Position / موقف یا پوزیشن
            </label>
            <input
              type='text'
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              name='position'
              placeholder={
                EmployeeData ? EmployeeData.position : 'Position / موقف یا پوزیشن'
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Join Date / د استخدام نیټه
            </label>
            <input
              type='date'
              value={formData.joinDate}
              onChange={(e) => handleInputChange('joinDate', e.target.value)}
              name='joinDate'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          {/* Third input row */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Salary in USD / معاش پر ډالر
            </label>
            <input
              type='text'
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              name='salary'
              placeholder={
                EmployeeData ? EmployeeData.salary : ' Salary in USD / معاش پر ډالر'
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
            Address / ادرس 
            </label>
            <textarea
              type='text'
              name='address'
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={4}
              style={{ resize: 'none' }}
              placeholder={
                EmployeeData ? EmployeeData.address : ' Address / ادرس '
              }
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          {/* Status dropdown */}
          <div className='mb-4'>
            <label className='block dark:text-gray-200 text-sm font-medium text-gray-600'>
              Status/حالت
              <select
                id='isActive'
                name='isActive'
                value={formData.isActive}
                onChange={(e) =>
                  handleInputChange('isActive', e.target.value === 'true')
                }
                className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              >
                <option value={true}>Activate/فعال</option>
                <option value={false}>Deactivate/غیر فعال</option>
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

export default EmployeeDetails;
