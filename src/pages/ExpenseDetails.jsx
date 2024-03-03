import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateContext } from '../contexts/ContextProvider';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClipLoader  } from 'react-spinners';


const ExpenseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function

  const [isLoading,setIsLoading]=useState(true)

  const expenseData = location.state?.data;
  const selectedCollection  = location.state?.selectedCollection;
  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const { currentColor } = useStateContext();
    const [formData, setFormData] = useState({
      _id:'',
      personName: '',
      expenseDate: '',
      amount: '',
      reason: '',
    });
    
    useEffect(() => {
      if (expenseData) {
        setIsLoading(false)
        const { 
          _id,  
          personName,
          expenseDate,
          amount,
          reason,
          } = expenseData;
        setFormData({
          _id,
          personName: '',
          expenseDate,
          amount: '',
          reason: '',
        });
      
      }
    }, [expenseData]);

    

    const handleInputChange = (field, value) => {

    
      if (field === 'amount' && isNaN(value)) {
        // You can display an error message, prevent setting the state, or handle it as needed
        toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
        return;
      }
  
      
  
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: value,
      }));
    }; 







   

    const handleUpdate =async () => {
 
      const { 
        _id,  
        personName,
        expenseDate,
        amount,
        reason,
         } =
        formData;
    
 
      const isDataEmpty = !personName  && !amount && !reason && expenseDate === expenseData.expenseDate
  
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
          personName,
          expenseDate,
          amount,
          selectedCollection,
          reason,
        });
    
        try {
          setIsLoading(true)
          const res = await axios.put(
            SERVER_PATH + 'api/actions/updateExpense',
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
              navigate('/expenses');
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
  
    
    const handleDelete = () => {
      // Display confirmation box
      setIsConfirmVisible(true);
    };
  
    const confirmDelete = async () => {
      const { _id } = expenseData;
    
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
    
      try {
        setIsConfirmVisible(false);
        // Include the _id in the URL
        setIsLoading(true)
        const res = await axios.delete(
          `${SERVER_PATH}api/actions/deleteExpense/${selectedCollection}/${_id}`,
          config
        );
    
        if (res.data.status === 'success') {
          setIsLoading(false)
          toast.success('ریکارد دلیت شو', {
            position: 'top-center',
          });
          // Redirect or update your UI as needed
          navigate('/expenses');
        } else {
          setIsLoading(false)
          toast.error(res.data.message, {
            position: 'top-right',
          });
        }
      } catch (err) {
        console.log(err);
        setIsLoading(false)
        toast.error('لطفا صفحه ریفریش کړی او بیا کوشش وکړی', {
          position: 'top-right',
        });
      }
    };
    
    const cancelDelete = () => {
      // Close the confirmation box
      setIsConfirmVisible(false);
    };
  

    return (
      <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
    
        {/* Employee Information on the right side */}
        {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
         <div className='w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
    
    <div className='w-full bg-slate-200 flex flex-col md:flex-row justify-between rounded-2xl mb-4'>
      <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 md:mb-0 mt-2 md:mt-7 pl-4'>
        Expense Information / لګښت معلومات
      </div>
      <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 mt-2 md:mt-7 pr-4'>
        Collection: {selectedCollection}
      </div>
    </div>

    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
      {/* Input fields */}
      <div className="mb-4">
        <label className="block dark:text-gray-200 text-sm font-medium text-gray-600">
          Person Name / د مصرف کوونکی شخص نوم
        </label>
        <input
          type="text"
          name="personName"
          value={formData.personName}
          onChange={(e) => handleInputChange('personName', e.target.value)}
          placeholder={expenseData.personName}
          className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
        />
      </div>

      <div className='mb-4'>
        <label className='block dark:text-gray-200  font-medium text-gray-600'>
          Expense Date /  د مصرف نیټه
        </label>
        <input
          type='date'
          value={formData.expenseDate}
          onChange={(e) => handleInputChange('expenseDate', e.target.value)}
          name='expenseDate'
          className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
        />
      </div>

      <div className="mb-4">
        <label className="block dark:text-gray-200 text-sm font-medium text-gray-600">
          Amount in USD /  مقدار په ډالرو
        </label>
        <input
          type="text"
          name="amount"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          placeholder={expenseData.amount}
          className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="reason" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
          Reason of Expense / د لګښت دلیل
        </label>
        <textarea
          type="text"
          name="reason"
          value={formData.reason}
          onChange={(e) => handleInputChange('reason', e.target.value)}
          rows={4}
          style={{ resize: 'none' }}
          placeholder={expenseData.reason}
          className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
        />
      </div>
    </div>

    <div className='flex items-center mt-4 space-x-4'>
      <button
        onClick={handleUpdate}
        style={{ background: currentColor }}
        className={`dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg`}
      >
        Update/تغیرول
      </button>
      <button
        onClick={handleDelete}
        className={`dark:text-gray-200 bg-red-600 text-white py-2 px-4 rounded-md hover:drop-shadow-lg`}
      >
        Delete / دلیت
      </button>
    </div>
  </div>
    
        <ToastContainer />
    
        {/* Image on the left side */}
        {isConfirmVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p>Are you sure you want to delete this record?/ایا غواړی چی دا ریکارد دلیت کړی ؟</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Delete / دلیت
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel / لغوه
              </button>
            </div>
          </div>
        </div>
      )}
    
        <div className="md:w-1/2 hidden sm:block">
          {/* ... your image content ... */}
        </div>
      </div>
    );
    
}

export default ExpenseDetails