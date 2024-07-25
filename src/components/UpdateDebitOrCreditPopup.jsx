import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';

import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import Select from 'react-select';
import LoadingDropDown from './LoadingDropDown';
import SearchAbleDropDown from './SearchAbleDropDown';
import useAxiosGet from '../hooks/useAxiosGet';

const UpdateDebitOrCreditPopup = ({ onUpdate, onDelete, onCancel, availableCollections, selectedRowData }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [buttonClicked, setButtonClicked] = useState(false);


  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sarafis, setSarafis] = useState([]);
  const [cash,setCash]=useState('')

  const [formData, setFormData] = useState({
    paidAmount: '',
    transactionType:'',
    paymentType:'',
    personName:'',
    receiptNumber:'',
    description:'',
    sarafi:'',
    contactNumber:'',
    balance:'',
    date: '',
    
  });


  const {
    response: getCashResponse,
    isLoading: getCashLoading,
    sendRequest:getCashRequest,
  } = useAxiosGet();

  useEffect(() => {
   
    getAllSarafis();
    handleFetchCash();
  }, [user.token,selectedRowData]);

  useEffect(() => {
  setFormData(selectedRowData)
  }, [selectedRowData]);

  const handleFetchCash=async()=>{

   

    const getCash = `${SERVER_PATH}api/actions/getCash`;

    try {
      await getCashRequest(getCash);
    } catch (error) {
      toast.error(error.message, { position: 'top-right' });
    }


  }

  useEffect(() => {
    
    if (getCashResponse) {

     
          setCash(getCashResponse);
    }
  }, [getCashResponse]);

  const getAllSarafis = async function () {
    const config = {
      headers: {
        'x-auth-token': user.token,
      },
    };
    try {
    
      const res = await axios.get(SERVER_PATH + 'api/actions/getAllSarafis', config);

      if (res.data.status !== 'FAILED') {
     
        const sortedSarafis = res.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSarafis(sortedSarafis);
        setLoading(false);
       
      } else {
       
        
      }
    } catch (err) {
      
      const errors = err.response.data.errors;
      if (errors) {
        console.log('error' + errors);
      }
    }
  };



  const handleSarafiSelect = (selectedValue) => {
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const {_id,contactNumber,balance} = selectedValue;
  
     
      // Update only the specific fields in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        contactNumber,
        balance,
        sarafi: _id
      }));
  
     
    }
  };

  console.log("update data,",selectedRowData)
  const handleUpdate = async () => {

    
    
    
    const amountString = String(formData.paidAmount);
    
    if (!amountString.trim()) {
      toast.warning('مقدار ضروری دی')
      return;
    }
   
    if (!formData.date) {
      
      toast.warning('تاریخ ضروری دی')
      return;
    }

    if(formData.paymentType=='sarafi' && !formData.personName)
    {
     
      toast.warning('شخص نوم ضروری دی')
      return;
    }

   

   

    
      const {  
        paidAmount,
        transactionType,
        paymentType,
        personName,
        receiptNumber,
        description,
        sarafi,
        contactNumber,
        balance,
        date,

      }=formData;

       
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
      const body = JSON.stringify({
        paidAmount,
        transactionType,
        paymentType,
        personName,
        receiptNumber,
        description,
        sarafi,
        date,
        selectedRowData
    
      });
  
      try {
        setIsLoading(true);
        setButtonClicked(true)
        const res = await axios.put(
          SERVER_PATH + 'api/actions/updateCustomerAccountRecord',
          body,
          config
        );
  
        if (res.data.status) {
          if (res.data.status === 'FAILED') {
            setIsLoading(false);
            setButtonClicked(false)
            toast.error(res.data.message, {
              position: 'top-right',
            });
          } else {
            setIsLoading(false);
            setButtonClicked(false)
            toast.success('معلومات تغیر شول', {
              position: 'top-right',
            });
           onCancel();
          }
        }
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        setButtonClicked(false)
        if (err.response.data.status === 'FAILED') {
          toast.error(err.response.data.message, {
            position: 'top-center',
          });
        } else {
          toast.error('Error occurred ', {
            position: 'top-right',
          });
        }
      }
    

   










  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('ایا غواړی دا ریکارد ډلیت شی ؟');

  if(confirmDelete)
  {
    if (
  
      selectedRowData._id !== undefined &&
      selectedRowData._id !== null &&
      selectedRowData._id !== ''
    ) {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };

      try {
        setIsLoading(true);
        setButtonClicked(true)
        // Include the _id in the URL
        console.log(selectedRowData._id);
        const res = await axios.delete(
          `${SERVER_PATH}api/actions/deleteCustomerAccountRecord/${selectedRowData._id}`,
          config
        );

        if (res.data.status === 'SUCCESS') {
          setIsLoading(false);
          setButtonClicked(false)
          toast.success('ریکارد دلیت شو', {
            position: 'top-center',
          });
          // Redirect or update your UI as needed
          onCancel();
        } else {
          setIsLoading(false);
          setButtonClicked(false)
          toast.error(res.data.message, {
            position: 'top-right',
          });
        }
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        setButtonClicked(false)
        toast.error('لطفا صفحه ریفریش کړی او بیا کوشش وکړی', {
          position: 'top-right',
        });
      } finally {
        // Enable the button after the operation is completed
        setButtonClicked(false);
      }
    } else {
      setButtonClicked(false)
      toast.error('صفحه ریفریش کړی او بیا کوشش وکړی', {
        position: 'top-right',
      });
    }
  }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers in the amount field
    if (name === 'paidAmount' && isNaN(value)) {
      toast.error('صرف 0-9 نمبر داخل کیدای شی ', {
        position: 'top-right',
      });
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-md w-3/4 shadow-md">
     
      <div> 
       <div className='mb-4' >
          <label className="block  mb-2 text-sm font-bold">Transaction Type</label>
          <div className="flex space-x-4 border-1 p-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="transactionType"
              value="deposit"
              checked={formData.transactionType === 'deposit'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Deposit / جمع کول
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="transactionType"
              value="withdrawal"
              checked={formData.transactionType === 'withdrawal'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Withdrawal / اخستل
          </label>
        </div>
        {validationErrors.transactionType && (
          <p className="text-sm text-red-500">{validationErrors.transactionType}</p>
        )}
          </div>
        </div>

        <div><label className="block mb-2 text-sm font-bold">Amount: مقدار</label>
        <input
          type="text"
          name="paidAmount"
          value={formData?.paidAmount}
          onChange={handleInputChange}
          placeholder={selectedRowData?.paidAmount}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
            validationErrors.paidamount ? 'border-red-500' : ''
          }`} 
        />
        {validationErrors.paidamount && (
          <p className="text-sm text-red-500">{validationErrors.paidAmount}</p>
        )}</div>

 

       <div> 
       <div className='mb-4' >
          <label className="block  mb-2 text-sm font-bold">Payment Type/تادیه ډول</label>
          <div className="flex space-x-4 border-1 bg-slate-300 p-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="cash"
              checked={formData.paymentType === 'cash'}
            disabled
              className="mr-2"
            />
            Cash / نقده
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="sarafi"
              checked={formData.paymentType === 'sarafi'}
              disabled
              className="mr-2"
            />
            Sarafi / صرافی
          </label>
        </div>
        {validationErrors.paymentType && (
          <p className="text-sm text-red-500">{validationErrors.paymentType}</p>
        )}
          </div>
        </div>

       {formData?.paymentType==='cash' &&  <div className='mb-4 '>
            <label
              htmlFor='balance'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
             available cash balance /موجوده نقده بلانس
            </label>
            <input
              type='text'
              name='balance'
               value={cash?.balance}
            disabled
              placeholder=' available cash / موجوده نقدی'
              className='w-full border bg-slate-300 dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
                    
          </div>}

       <div> <label className="block  mb-2 text-sm font-bold">Date:نیټه</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
            validationErrors.date ? 'border-red-500' : ''
          }`}
        />
        {validationErrors.date && (
          <p className="text-sm text-red-500">{validationErrors.date}</p>
        )}</div>

        
      {formData.paymentType==='sarafi' &&   
        <div className='mb-4'>
           
           <label
                 htmlFor='sarafi'
                 className='block dark:text-gray-200 text-sm font-medium  '
               >
                 Sarafi / صرافی  
                 ----- <strong className='text-blue-800'>{formData?.sarafi?.name}</strong>
               </label>
             
               <div className='flex'>
               {loading ? (
                 // Show loading indicator while data is being fetched
               <LoadingDropDown/>
               ) : (
               
                 // Render supplier options once data is fetched
                  <SearchAbleDropDown options={sarafis.map((item) => ({ value: item, label: item.name }))} onSelect={handleSarafiSelect} />
   
               )}
               
                 </div>
                 {validationErrors.sarafi && (
          <p className="text-sm text-red-500">{validationErrors.sarafi}</p>
        )}
               
             </div>
          }


{formData.paymentType==='sarafi' &&   <div className='mb-4 '>
            <label
              htmlFor='contactNumber'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              contact number / صرافی تلفون شماره
            </label>
            <input
              type='text'
              name='contactNumber'
              value={formData.contactNumber}
            disabled
              placeholder={selectedRowData?.sarafi?.contactNumber}
              className='w-full border bg-slate-200 dark:border-none dark:bg-gray-700 rounded-md px-3 py-2 mt-1'
            />
                    
          </div>
          
   }

{formData.paymentType==='sarafi' &&   <div className='mb-4 '>
            <label
              htmlFor='balance'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
             available sarafi balance /موجوده صرافی بلانس 
            </label>
            <input
              type='text'
              name='balance'
              value={formData.balance}
            disabled
              placeholder={selectedRowData?.sarafi?.balance}
              className='w-full border bg-slate-200 dark:border-none dark:bg-gray-700  rounded-md px-3 py-2 mt-1'
            />
                    
          </div>
          
   }

    {formData.paymentType==='sarafi' &&   <div className='mb-4'>
            <label
              htmlFor='personName'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Paid by / د چا لخوا
            </label>
            <input
              type='text'
              name='personName'
              value={formData.personName}
              onChange={handleInputChange}
              placeholder=' Paid by / د چا لخوا'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
                     {validationErrors.personName && (
          <p className="text-sm text-red-500">{validationErrors.personName}</p>
        )}
          </div>
          
   }



          {formData.paymentType==='sarafi' &&   <div className='mb-4'>
            <label
              htmlFor='receiptNumber'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Receipt Number / د رسید شماره
            </label>
            <input
              type='text'
              name='receiptNumber'
              value={formData.receiptNumber}
              onChange={handleInputChange}
              placeholder=' Receipt Number / د رسید شماره'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
   }

  <div className='mb-4'>
            <label
              htmlFor='description'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Description / توضیحات
            </label>
            <textarea
             
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='    Description / توضیحات'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
   


<div className="flex justify-end mt-6 space-x-4">
        <button
             onClick={handleUpdate}
            disabled={buttonClicked} // Disable the button if it has been clicked
            className={`px-4 py-2 ${
              buttonClicked ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-md focus:outline-none`}
          >
            {buttonClicked ? 'Saving...' : 'Save / ثبتول'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none"
          >
            Cancel /لغوه 
          </button>
        </div>
      </div>
   
        <ToastContainer />
    </div>
  );
};

UpdateDebitOrCreditPopup.propTypes = {
 
  onCancel: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
export default UpdateDebitOrCreditPopup;
