import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import LoadingDropDown from './LoadingDropDown';
import SearchAbleDropDown from './SearchAbleDropDown';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import useAxiosGet from '../hooks/useAxiosGet';


const DebitOrCreditPopup = ({availableCollections, onSave, onCancel }) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const { user } = useAuthContext();

  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(true);
  const [sarafis, setSarafis] = useState([]);
  const [cash,setCash]=useState('')
  const [formData, setFormData] = useState({
    collection:'',
    paidamount: '',
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
  }, [user.token]);

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

  const [validationErrors, setValidationErrors] = useState({});
  const [buttonClicked, setButtonClicked] = useState(false); // Added state for button click

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers in the paidamount field
    if (name === 'paidamount' && isNaN(value)) {
      toast.error('صرف 0-9 نمبر داخل کیدای شی ', {
        position: 'top-right',
      });
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if(name==='paymentType' && value==='cash')
      {
        setFormData((prevFormData) => ({
          ...prevFormData,
          
          personName:'',
  receiptNumber:'',
  sarafi:''
        }));
      }
  };

  const handleSave = () => {
    // Validate fields
    const errors = {};
    if (!selectedCollection || selectedCollection === '' || selectedCollection === undefined) {
      errors.collection = 'میاشت او کال انتخاب ضروری دی ';
    }
    if (!formData.paidamount.trim()) {
      errors.paidamount = 'مقدار انتخاب ضروری دی ';
    }
    if (!formData.transactionType.trim()) {
      errors.transactionType = 'ترانسکشن ډول انتخاب ضروری دی';
    }
    if (!formData.paymentType.trim()) {
      errors.paymentType = 'د تادیه ډول انتخاب ضروری دی';
    }
    if (!formData.date) {
      errors.date = 'تاریخ انتخاب ضروری دی';
    }

    // Additional validation for "sarafi" payment type
    if (formData.paymentType === 'sarafi') {
      if (!formData.personName.trim()) {
        errors.personName = 'د شخص نوم انتخاب ضروری دی';
      }
      if (!formData.sarafi.trim()) {
        errors.sarafi = 'صرافی انتخاب ضروری دی';
      }
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Reset validation errors
    setValidationErrors({});
    setButtonClicked(true);

    // Proceed with saving
    onSave(formData);
  };


  const handleSelect = (selectedValue) => {
    
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const { value } = selectedValue;
  
      setFormData((prevFormData) => ({
        ...prevFormData,
        
        collection:value._id,

      }));
      // Update only the specific fields in formData
      setSelectedCollection(value)
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

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md w-3/4 shadow-md">
     
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
          name="paidamount"
          value={formData.paidamount}
          onChange={handleInputChange}
          placeholder="Enter amount"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
            validationErrors.paidamount ? 'border-red-500' : ''
          }`} 
        />
        {validationErrors.paidamount && (
          <p className="text-sm text-red-500">{validationErrors.paidamount}</p>
        )}</div>

     <div>
     <label className="block mb-2 text-sm font-bold">میاشت او کال</label>
       <Select
              
              options={availableCollections?.map(item => ({ label: item.collectionName, value: item }))}
              value={{ label: selectedCollection?.collectionName, value: selectedCollection }}
              isSearchable
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
                validationErrors.collection ? 'border-red-500' : ''
              }`}   onChange={(selectedOption) => handleSelect(selectedOption)}
              getOptionLabel={(option) => option.label} // specify the label for display
              getOptionValue={(option) => option.value} // specify the value for comparison
            />
      {validationErrors.amount && (
          <p className="text-sm text-red-500">{validationErrors.collection}</p>
        )}</div>
     
       

       <div> 
       <div className='mb-4' >
          <label className="block  mb-2 text-sm font-bold">Payment Type/تادیه ډول</label>
          <div className="flex space-x-4 border-1 p-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="cash"
              checked={formData.paymentType === 'cash'}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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

       <div> <label className="block mt-4 mb-2 text-sm font-bold">Date:نیټه</label>
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
              placeholder='  contact number / صرافی تلفون شماره'
              className='w-full border bg-slate-300 dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
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
              placeholder=' ‌balance /بلانس '
              className='w-full border bg-slate-300 dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
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
            onClick={handleSave}
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

DebitOrCreditPopup.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DebitOrCreditPopup;
