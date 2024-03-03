import React, { useState, useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingDropDown from '../components/LoadingDropDown';

import SearchAbleDropDown from '../components/SearchAbleDropDown';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalaryPopup from '../components/SalaryPopup';

import { ClipLoader  } from 'react-spinners';

const NewSalary = () => {

  const [isLoading,setIsLoading]=useState(true)



  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const { currentColor } = useStateContext();
  const { user } = useAuthContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);

  const location = useLocation();
  const selectedCollection = location.state?.selectedCollection;


  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedSalaryData, setReceivedSalaryData] = useState(null);

  const handleSaveAndExit = () => {
    // Add logic to save and exit if needed
    // For now, just close the popup
    closePopup();
  };

  const [showPopup, setShowPopup] = useState(false);

  // Function to handle opening the popup with salary data
  const openPopup = (salaryData) => {
    setReceivedSalaryData(salaryData);
    setShowPopup(true);
  };

  // Function to handle closing the popup
  const closePopup = () => {
    setReceivedSalaryData(null);
    setShowPopup(false);
  };




  const [formData, setFormData] = useState({
    employeeName: 'select',
         name:'',
        contactNumber:'',
        position:'',
        NIC:'',
        salary: '',
        employeeId:'',
        salaryDate: '',
        salaryMonth: 'select',
        salaryYear: '',
        salaryAmount: '',
        comment:'',
  });

  // Step 1: Add state variables
 

  useEffect(() => {
    const getAllEmployees = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true)
        const res = await axios.get(SERVER_PATH + 'api/actions/getAllEmployees', config);

        if (res.data.status !== 'FAILED') {
          setEmployees(res.data);
          setLoading(false);
          console.log(res.data);
          setIsLoading(false)
        } else {
          console.log(res);
          setIsLoading(false)
        }
      } catch (err) {
        setIsLoading(false)
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };

    getAllEmployees();
  }, [user.token]);


  


  // Step 2: Update handleSelect to set customer details
 

  const handleInputChange = (field, value) => {
    if (field === 'salaryAmount' && !/^[0-9.]*$/.test(value)) {
        // Display an error message and prevent setting the state
        toast.info('صرف انګلسی شماری(0-9) او (.) داخل کیدای شی', { position: 'top-right' });
        return;
      } else if (field === 'salaryYear' && !/^[0-9]{0,4}$/.test(value)) {
        // Display an error message and prevent setting the state for salaryYear with more than 4 digits
        toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی', { position: 'top-right' });
        return;
      }

    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    // Validate form data
    if (!validateFormData()) {
      return; // Validation failed, do not proceed
    }
  
    try {
     
      const {
        employeeId,
        salaryDate,
        salaryMonth,
        salaryYear,
        salaryAmount,
        comment,
      } = formData;
  
      const config = {
        
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
  
      const body = JSON.stringify({
        employeeId,
        salaryDate,
        salaryMonth,
        salaryYear,
        selectedCollection,
        salaryAmount,
        comment,
      });
  
      setDisableAddButton(true);
      const res = await axios.post(
        SERVER_PATH + 'api/actions/addSalary',
        body,
        config
      );
  
      console.log("salary",res.data);
      if (res.data.status === 'SUCCESS') {
      
        toast.success('ریکارد اضافه شو', {
          position: 'top-center',
        });
        
        // Redirect or update your UI as needed
        navigate('/Salaries');
     //   openPopup(res.data.data.salaryRecord._id);
       
      } else {
       
     
        toast.error(res.data.message, {
          position: 'top-right',
        });
      }
    } catch (err) {
    
      toast.error(err , {
        position: 'top-right',
      });
    } finally {
      setDisableAddButton(false);
     
    }
  };
  
  const validateFormData = () => {
    const {
      employeeId,
      salaryDate,
      salaryMonth,
      salaryYear,
      salaryAmount,
    } = formData;
  
    // Check if required fields are not empty
    if (
      !employeeId ||
      !salaryDate ||
      !salaryMonth ||
      !salaryYear ||
      !salaryAmount ||
      salaryMonth==='select'
    ) {
      toast.warning('لطفاً ټول فیلډونه ډک کړئ', { position: 'top-right' });
      return false;
    }
  
    return true; // Validation passed
  };
  


  const handleSelect = (selectedValue) => {
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const {_id, name, salary,contactNumber, position,NIC } = selectedValue;
  
      // Update only the specific fields in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
         employeeId: _id,
        name,
        salary,
        contactNumber,
        position,
        NIC
      }));
  
    
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
      
      <div className='md:w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
     
     <div className='w-full bg-slate-200 flex flex-col md:flex-row justify-between rounded-2xl mb-4'>
 <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 md:mb-0 mt-2 md:mt-7 pl-4'>
 New Salary / نوی معاش
 </div>
 <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 mt-2 md:mt-7 pr-4'>
   Collection: {selectedCollection}
 </div>
</div>

     <div className='flex-grow grid grid-cols-1 md:grid-cols-2 gap-4'>
       {/* Input fields */}

       <div className='mb-4'>
         <label
           htmlFor='supplier'
           className='block dark:text-gray-200 text-sm font-medium text-gray-600'
         >
           Employee / کارکوونکی
         </label>
         <div className='flex'>
         {loading ? (
           // Show loading indicator while data is being fetched
         <LoadingDropDown/>
         ) : (
           // Render supplier options once data is fetched
           <SearchAbleDropDown options={employees.map((item) => ({ value: item, label: item.name }))} onSelect={handleSelect} />

         )}
       
           </div>
         
       </div>
       
     
           <div className='mb-4'>
             <label
          
               className='block dark:text-gray-200 text-sm font-medium text-gray-600'
             >
              Employee Name / کارکوونکی نوم
             </label>
             <input
               type='text'
               value={formData.name}
               name='name'
               onChange={(e) => handleInputChange('name', e.target.value)}
               placeholder='Employee Name / کارکوونکی نوم'
               className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
               disabled
             />
           </div>
           <div className='mb-4'>
             <label
               
               className='block dark:text-gray-200 text-sm font-medium text-gray-600'
             >
              Position / موقف
             </label>
             <input
               type='text'
               name='position'
               value={formData.position}
               onChange={(e) => handleInputChange('position', e.target.value)}
               placeholder='  Position / موقف'
               className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
               disabled
             />
           </div>
           <div className='mb-4'>
             <label
               
               className='block dark:text-gray-200 text-sm font-medium text-gray-600'
             >
               Employee Number / کارکوونکی نمبر
             </label>
             <input
               type='text'
               name='contactNumber'
               value={formData.contactNumber}
               onChange={(e) => handleInputChange('contactNumber', e.target.value)}
               placeholder='Employee Number / کارکوونکی نمبر'
               className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
               disabled
             />
           </div>

           <div className='mb-4'>
             <label
               
               className='block dark:text-gray-200 text-sm font-medium text-gray-600'
             >
               Employee NIC / کارکوونکی تذکره
             </label>
             <input
               type='text'
               name='NIC'
               value={formData.NIC}
               onChange={(e) => handleInputChange('NIC', e.target.value)}
               placeholder='Employee NIC / کارکوونکی تذکره'
               className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
               disabled
             />
           </div>
      


       <div className='mb-4'>
         <label className='block dark:text-gray-200  font-medium text-gray-600'>
          Salary Date /  د معاش نیټه
         </label>
         <input
           type='date'
           value={formData.salaryDate}
           onChange={(e) => handleInputChange('salaryDate', e.target.value)}
           name='salaryDate'
           className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
         />
       </div>
       
       <div className='mb-4'>
         <label
          
           className='block dark:text-gray-200 text-sm font-medium text-gray-600'
         >
          Year /  کال
         </label>
         <input
           type='text'
           name='salaryYear'
           value={formData.salaryYear}
           onChange={(e) => handleInputChange('salaryYear', e.target.value)}
        
           placeholder='2024'
           className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
         />
       </div>

       <div className='mb-4'>
         <label
           htmlFor='fuelType'
           className='block dark:text-gray-200 text-sm font-medium text-gray-600'
         >
           Month / میاشت
         </label>
         <select
           name='salaryMonth'
           value={formData.salaryMonth}
           onChange={(e) => handleInputChange('salaryMonth', e.target.value)}
           className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-2'
         >
            <option value='select'>select.../...انتخاب</option>
            <option value='January'>January   /  جنوری</option>
            <option value='February'>February  /  فیبروری</option>
            <option value='March'>March  /  مارچ</option>
            <option value='April'>April  /  اپریل</option>
            <option value='May'>May  /  می</option>
            <option value='June'>June  /  جون</option>
            <option value='July'>July  /  جولی</option>
            <option value='August'>August  /  اګست</option>
            <option value='September'>September  /  سیپتمبر</option>
            <option value='October'>October  /  اوکتوبر</option>
            <option value='November'>November  /  نومبر</option>
            <option value='December'>December  /  دیسمبر</option>
           {/* Add more options as needed */}
         </select>
       </div>

      

       

       {/* Second input row */}

       <div className='mb-4'>
         <label
          
           className='block dark:text-gray-200 text-sm font-medium text-gray-600'
         >
           Salary in dollars / معاش په ډالرو
         </label>
         <input
           type='text'
           name='salaryAmount'
           value={formData.salaryAmount}
           onChange={(e) => handleInputChange('salaryAmount', e.target.value)}
        
           placeholder=' Salary in dollars / معاش په ډالرو'
           className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
         />
       </div>

       <div className='mb-4'>
         <label
          
           className='block dark:text-gray-200 text-sm font-medium text-gray-600'
         >
           Salary / معاش اصلی
         </label>
         <input
           type='text'
          
           value={formData.salary}
          disabled
        
           placeholder={formData.salary}
           className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'/>
       </div>

       <div className='mb-4'>
         <label
          
           className='block dark:text-gray-200 text-sm font-medium text-gray-600'
         >
           Comment / تبصره
         </label>
         <textarea
           type='text'
           name='comment'
           value={formData.comment}
           onChange={(e) => handleInputChange('comment', e.target.value)}
        
           placeholder=' Comment / تبصره'
           className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'/>
       </div>

     
    
     </div>
    
     <button
     disabled={disableAddButton}
       onClick={handleSave}
    
       style={disableAddButton?{background:'#808080'}:{  background: currentColor }} className={` mt-4 dark:text-gray-200 text-white py-2 px-4 rounded-md ${disableAddButton?'':'hover:drop-shadow-lg'}  ${disableAddButton?'cursor-not-allowed':''}`}>
       Save/ثبتول
     </button>
     <SalaryPopup
     salaryData={receivedSalaryData}
     onSaveAndExit={handleSaveAndExit}
     onClose={closePopup}
   />
   </div>
    
     
      <ToastContainer />
      {/* Image on the left side */}
    </div>
  );
};

export default NewSalary;
