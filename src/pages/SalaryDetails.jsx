import React, { useState, useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalaryPopup from '../components/SalaryPopup';
import { ClipLoader  } from 'react-spinners';

const SalaryDetails = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const location = useLocation();
  const [isLoading,setIsLoading]=useState(true)

  const salaryData = location.state?.data;
  const selectedCollection  = location.state?.selectedCollection;
  const { currentColor } = useStateContext();
  const { user } = useAuthContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);


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

  const [fullSalaryData, setFullSalaryData] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

console.log(salaryData)

  const [formData, setFormData] = useState({
    employeeName: 'select',
        _id:'',
         name:'',
        contactNumber:'',
        position:'',
        NIC:'',
        salary:'',
        employeeId:'',
        salaryDate: '',
        salaryMonth: 'select',
        salaryYear: '',
        salaryAmount: '',
        comment:'',
  });

  useEffect(() => {
    if (salaryData) {
      setIsLoading(false)
      const { 
        _id,
        salaryDate,
        salaryMonth,
        employee,
        salaryYear,
        salaryAmount,
        comment, } = salaryData;
      setFormData({
        _id,
        name:'',
        contactNumber:'',
        position:'',
        NIC:'',
        salaryDate:salaryDate,
        salaryMonth,
        salaryYear,
        salaryAmount:'',
        comment:'',
      });
    
    }
  }, [salaryData]);

  // Step 1: Add state variables
 


  


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

  const handleUpdate =async () => {
 
   
    const {
        _id,  
       
        salaryDate,
        salaryMonth,
        salaryYear,
        salaryAmount,
        comment,
       } = formData;
    
  
    // Continue with the save logic if the form is valid
    const isDataEmpty =  salaryDate===salaryData.salaryDate  && salaryYear===salaryData.salaryYear &&
    !salaryAmount &&!comment && salaryMonth ===salaryData.salaryMonth 
    ;

    if (isDataEmpty) {
      toast.info('هیس تغیرات نشته د ثبتولو لپاره', { position: 'top-right' });
      return;
    }

    if(salaryMonth==="select"){
        toast.info('لطفا صحیح میاشت انتخاب کړی', { position: 'top-right' });
      return;
    }


  if(salaryData!=null) {
    const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
      const body = JSON.stringify({
        _id,  
        employeeId:salaryData.employee._id,
        salaryDate,
        salaryMonth,
        salaryYear,
        salaryAmount,
        comment,
        selectedCollection
      });
  
      try {
        setIsLoading(true)
        const res = await axios.put(
          SERVER_PATH + 'api/actions/updateSalary',
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
            navigate('/salaries');
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
  


  }
   





  

  };

  
  const handleDelete = () => {
    // Display confirmation box
    setIsConfirmVisible(true);
  };

  const confirmDelete = async () => {
    const { _id } = salaryData;
  
    console.log(_id)
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
  
    try {
      setIsConfirmVisible(false);
      setIsLoading(true)
      // Include the _id in the URL
      const res = await axios.delete(
        `${SERVER_PATH}api/actions/deleteSalary/${selectedCollection}/${_id}`,
        config
      );
  
      if (res.data.status === 'success') {
        setIsLoading(false)
        toast.success('ریکارد دلیت شو', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        navigate('/salaries');
      } else {
        setIsLoading(false)
        toast.error(res.data.message, {
          position: 'top-right',
        });
      }
    } catch (err) {
      setIsLoading(false)
      console.log(err);
  
      toast.error('لطفا صفحه ریفریش کړی او بیا کوشش وکړی', {
        position: 'top-right',
      });
    }

  };
  
  const cancelDelete = () => {
    // Close the confirmation box
    setIsConfirmVisible(false);
  };

  




  const handlePrint=()=>{


    console.log("formdata",formData)
    console.log("salaryData",salaryData)

    // openPopup(formData._id)

  }

  return (
    <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      <div className='md:w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
     

        <div className='w-full bg-slate-200 flex flex-col md:flex-row justify-between rounded-2xl mb-4'>
  <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 md:mb-0 mt-2 md:mt-7 pl-4'>
  New Salary / نوی معاش
  </div>
  <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 mt-2 md:mt-7 pr-4'>
    Collection: {selectedCollection}
  </div>
</div>
        {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )} 
       <div className='flex-grow grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Input fields */}

        
          
        
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
                  placeholder={salaryData?.employee?.name}
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
                  placeholder={salaryData?.employee?.position}
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
                  placeholder={salaryData?.employee?.contactNumber}
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
                  placeholder={salaryData?.employee?.NIC}
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
              placeholder={salaryData?.salaryDate}
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
           
              placeholder={salaryData?.salaryYear}
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

         

          <div className='mb-4'>
          <label
           
            className='block dark:text-gray-200 text-sm font-medium text-gray-600'
          >
            Salary / معاش اصلی
          </label>
          <input
            type='text'
           
            value={salaryData?.employee?.salary}
           disabled
         
            placeholder={salaryData?.employee?.salary}
            className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'/>
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
           
              placeholder={salaryData?.salaryAmount}
            
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

        
          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Comment / تبصره
            </label>
            <input
              type='text'
              name='comment'
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
           
              placeholder={salaryData?.comment}
            
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'/>
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
            {/* <button
              onClick={handlePrint}
              style={{ background: currentColor }}
              className={`dark:text-gray-200 text-white py-2   px-4 rounded-md hover:drop-shadow-lg`}
            >
              print / پرینت
            </button> */}
          </div>
        <SalaryPopup
        salaryData={receivedSalaryData}
        onSaveAndExit={handleSaveAndExit}
        onClose={closePopup}
      />
      </div>
      <ToastContainer />
      {isConfirmVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p>Are you sure you want to delete this Salary?/ایا غواړی چی دا معاش دلیت کړی ؟</p>
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
      {/* Image on the left side */}
    </div>
  );
};

export default SalaryDetails;
