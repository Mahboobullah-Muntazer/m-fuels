import React, { useState, useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader  } from 'react-spinners';

const NewExpense = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

    const { currentColor } = useStateContext();
    const { user } = useAuthContext();
    const navigate = useNavigate(); // Get the navigate function
    const [disableAddButton, setDisableAddButton] = useState(false);
    const location = useLocation();
    const selectedCollection = location.state?.selectedCollection;
  
    const [isLoading,setIsLoading]=useState(false)

    const [formData, setFormData] = useState({
      personName: '',
      expenseDate: '',
      amount: '',
      reason: '',
    });

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







    const handleSave =async () => {
 


      const isFormValid = Object.values(formData).every((value) => value !== null && value !== '');
  
      if (!isFormValid) {
        // Display a warning message in Pashto language using toast
        toast.warning('ټول فیلدونه ضرور دی ', { position: 'top-right' });
        return;
      }
    
      // Continue with the save logic if the form is valid
      const { 
        personName,
        expenseDate,
        amount,
        reason,
       } =
      formData;
  
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
  
    const body = JSON.stringify({
      personName,
      expenseDate,
      selectedCollection,
      amount,
      reason,
    });
  
    try {
      setIsLoading(true)
      setDisableAddButton(true);
      const res = await axios.post(
        SERVER_PATH + 'api/actions/addExpense',
        body,
        config
      ); 
  
      console.log(res.data);
      if (res.data.status === 'SUCCESS') {
        setIsLoading(false)
        toast.success('خدرید اضافه شو', {
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
      setIsLoading(false)
      console.log(err);
     
    }finally {
      setDisableAddButton(false);
      setIsLoading(false)
    }
  
    };
  

    return (
      <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
    
    {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
         <>
            <div className="w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col">
   

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
                    placeholder="Person Name / د مصرف کوونکی شخص نوم"
                    className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
                  />
                </div>
    
                <div className='mb-4'>
                  <label className='block dark:text-gray-200 font-medium text-gray-600'>
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
                    placeholder="  Amount in USD /  مقدار په ډالرو "
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
                    placeholder="Reason of Expense / د لګښت دلیل"
                    className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
                  />
                </div>
              </div>
    
              <button
                disabled={disableAddButton}
                onClick={handleSave}
                style={disableAddButton ? { background: '#808080' } : { background: currentColor }}
                className={`mt-4 dark:text-gray-200 text-white py-2 px-4 rounded-md ${disableAddButton ? '' : 'hover:drop-shadow-lg'}  ${disableAddButton ? 'cursor-not-allowed' : ''}`}>
                Save/ثبتول
              </button>
              <ToastContainer />
            </div>
    
            {/* Image on the left side */}
           
          </>
      </div>
    );
    
}

export default NewExpense