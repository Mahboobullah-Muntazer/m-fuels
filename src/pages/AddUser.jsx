import React, { useState,useEffect } from 'react';

import axios from 'axios';
import { useStateContext } from '../contexts/ContextProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { ClipLoader  } from 'react-spinners';

const AddUser = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate(); // Get the navigate function

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    password: '',
    confirmPassword: '',
    userType: 'userType', // Default value, you can set it as needed
    email: '',
    confirmationCode: '',
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [disableAddUser,setDisableAddUser] =useState(true);
  const [emailConfirmation, setEmailConfirmation] = useState(false);
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const [isSendCodeButtonDisabled, setSendCodeButtonDisabled] = useState(false);
  const [isConfirmButtonDisabled, setConfirmButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isLoading,setIsLoading]=useState(false)


  useEffect(() => {
    let interval;
    if (isSendCodeButtonDisabled) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isSendCodeButtonDisabled]);

  useEffect(() => {
    if (countdown === 0) {
      setSendCodeButtonDisabled(false);
      setCountdown(60);
    }
  }, [countdown]);











  const handleInputChange = (field, value) => {
    // Validate input based on field
    let validatedValue = value;

    if (field === 'userName') {
        validatedValue = !/\s/.test(value) ? value : formData[field];
      }else if (field === 'confirmationCode') {
        // Validate that the value is a number and does not exceed 6 digits
        const confirmationCodeRegex = /^\d{0,6}$/;
        validatedValue = confirmationCodeRegex.test(value) ? value : formData[field];
      }
      

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: validatedValue,
    }));

    // Handle password mismatch
    if ( field === 'confirmPassword') {
      setPasswordMismatch(formData.password !== value);
    }
    if (field === 'password' ) {
        setPasswordMismatch(formData.confirmPassword !== value);
      }

      if(field==='userType')
      {
        if(value==='Admin' ||value==='userType')
        {
          setDisableAddUser(true);
        }
        else
        {
          setDisableAddUser(false);
        }
      }
  };

 

  const handleAddUser=async()=>
  {


  

    if(formData.fullName.trim() === ''){
      toast.error('د شخص مکمل نوم ضروری دی', {
      position: 'top-center',
    }); return}
    if(formData.userName.trim() === ''){
      toast.error(' ضروری دی userName ', {
        position: 'top-center',
      }); return}
    if(formData.password.trim() === ''){
    toast.error('   پاسورد ضروری دی ', {
      position: 'top-center',
    }); return}
    if(formData.confirmPassword.trim()===''){  toast.error('  د پاسورد تاییدی ضروری دی ', {
      position: 'top-center',
    }); return}
    if(formData.password.trim()!==formData.confirmPassword.trim())
    {  toast.error(' پاسورد او تایید پاسورد یو شان ندی ', {
      position: 'top-center',
    }); return}
    if(formData.userType === 'userType' || formData.userType.trim()===  '')
    {  toast.error(' انتخاب ضروری دی user type', {
      position: 'top-center',
    }); return}


    const {fullName,
    userName,
    password,
    userType,
    email,
    }=formData;





    if(formData.userType ==='Admin'){

        if(formData.email.trim()  === ''){alert('email is required'); return}
        if(formData.confirmationCode.trim()=== ''){alert('confirmation code is required'); return}
        if(!emailConfirmation){alert('Please Confirm your email address first!'); return}


        // rest of logic code

        console.log(SERVER_PATH);
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
    
        const body = JSON.stringify({ fullName, userName,userType,email, password });
    
        try {
          setIsLoading(true)
            setDisableAddUser(true);
          const res = await axios.post(
            SERVER_PATH + 'api/actions/users',
            body,
            config
          );
            
          console.log(res.data)
          if (res.data.status !== 'FAILED') {
            setIsLoading(false)
            setDisableAddUser(false);
            setFormData({
                fullName: '',
                userName: '',
                password: '',
                confirmPassword: '',
                userType: 'userType',
                email: '',
                confirmationCode: '',
              });
              setEmailConfirmation(false);
              setDisableAddUser(false);

              navigate('/users');
            toast.success('Success', {
              position: 'top-center',
            });
        }else
        {setIsLoading(false)
            setDisableAddUser(false);
            toast.error(res.data.message, {
                position: 'top-center',
              });
        }
          
          }catch(err){
            setIsLoading(false)
            console.log(err)
            setDisableAddUser(false);
          }

       

    }else if(formData.userType !== 'Admin')
    {
        // rest of logic code

       
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
    
        const body = JSON.stringify({ fullName, userName,userType,email, password });
    
        try {
          setIsLoading(true)
            setDisableAddUser(true);
          const res = await axios.post(
            SERVER_PATH + 'api/actions/users',
            body,
            config
          );
            
          console.log(res)
          console.log(res.data.status)
          if (res.data.status !== 'FAILED') {
            setIsLoading(false)
            setFormData({
                fullName: '',
                userName: '',
                password: '',
                confirmPassword: '',
                userType: 'userType',
                email: '',
                confirmationCode: '',
              });
              setEmailConfirmation(false);
              setDisableAddUser(true);

              navigate('/users');
            toast.success('Success', {
              position: 'top-center',
            });
        }else
        {
          setIsLoading(false)
            setDisableAddUser(false);
            toast.error(res.data.message, {
                position: 'top-center',
              });
        }
        } catch (err) {
          setIsLoading(false)
            setDisableAddUser(false);
          console.log(err)
        } 

    }
  }


const handleSendCode=async()=>{
    setSendCodeButtonDisabled(true);
    const {
        email
        }=formData;


        const config = {
            headers: {
              'Content-Type': 'application/json',
            },
          };
      
          const body = JSON.stringify({email});
      
          try {
            setIsLoading(true)
            const res = await axios.post(
              SERVER_PATH + 'api/actions/sendEmailVerification',
              body,
              config
            );
              
            
          console.log(res.data.status)
            if (res.data.status !== 'FAILED') {
              setIsLoading(false)
  
              toast.success(res.data.message, {
                position: 'top-center',
              });
          }else
          {
            setIsLoading(false)
           
              toast.error(res.data.message, {
                  position: 'top-center',
                });
          }
          } catch (err) {
             
            console.log(err)
          } 

}


const handleConfirmation=async()=>{

    const {
        email,confirmationCode
        }=formData;

    if(formData.email.trim()  === ''){alert('email is required'); return}
    if(formData.confirmationCode.trim()=== ''){alert('confirmation code is required'); return}
   
    const confirmationCodeRegex = /^\d{6}$/;
    if (!confirmationCodeRegex.test(confirmationCode.trim())) {
      alert('Confirmation code must be a 6-digit number');
      return;
    }

    const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const body = JSON.stringify({email,confirmationCode});
      
      try {
        setIsLoading(true)
        const res = await axios.post(
          SERVER_PATH + 'api/actions/confirmOTP',
          body,
          config
        );
          
        
      console.log(res)
        if (res.data.status !== 'FAILED') {
          setIsLoading(false)

            setConfirmButtonDisabled(true)
            setDisableAddUser(false)
            setEmailConfirmation(true)
          toast.success(res.data.message, {
            position: 'top-center',
          });
      }else
      {
        setIsLoading(false)
       
          toast.error(res.data.message, {
              position: 'top-center',
            });
      }
      } catch (err) {
        setIsLoading(false)
        console.log("eror",err)
      } 

}






  return (
    <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
      <div className="md:w-2/3 dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-lg flex flex-col">
        <h2 className="text-2xl dark:text-gray-200 font-semibold mb-6 mt-7">Add User</h2>
        <div className="flex-grow grid grid-cols-1 md:flex-row gap-4">
          {/* Input fields */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              Full Name / مکمل نوم
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Full Name / مکمل نوم "
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="userName" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              UserName
            </label>
            <input
              type="text"
              id="userName"
              placeholder="UserName"
              required
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
            />
          </div>

       

          {/* User Type selection */}
          <div className="mb-4">
            <label htmlFor="userType" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              User Type/د کارونکي ډول
            </label>
            <select
              id="userType"
              className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
              onChange={(e) => handleInputChange('userType', e.target.value)}
              value={formData.userType}
            >
              <option value="userType">User Type</option>
              <option value="Admin">Admin/
اډمین </option>
              <option value="Viewer">Viewer/لیدونکی</option>
              <option value="Local">Local/عام</option>
              {/* Add more options as needed */}
            </select>
          </div>

          {/* Email input field */}
          {formData.userType === 'Admin' && (
            <div className="mb-4">
              <label htmlFor="email" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
                Email/ایمیل
              </label>
              <div className=" flex">
                <input
                  type="text"
                  id="email"
                  placeholder="Email/ایمیل"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-4/5 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
                />
                <button
                onClick={handleSendCode}
                disabled={isSendCodeButtonDisabled}
                  style={isSendCodeButtonDisabled?{background:'#808080'}:{  background: currentColor }}
                  className={`w-40 ml-2 dark:text-gray-200 text-white px-4 py-2 rounded-md ${isSendCodeButtonDisabled?'':'hover:drop-shadow-lg'}  ${isSendCodeButtonDisabled?'cursor-not-allowed':''}`}
                

                >
                   {isSendCodeButtonDisabled ? `Resend in ${countdown} seconds` : 'Send code '}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Code input field */}
          {formData.userType === 'Admin' && (
            <div className="mb-4">
              <label htmlFor="confirmationCode" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
                Confirmation code / کود تاییدی
              </label>
              <div className=" flex">
                <input
                  type="text"
                  id="confirmationCode"
                  placeholder="Confirmation code/کود تاییدی"
                  required
                  value={formData.confirmationCode}
                  onChange={(e) => handleInputChange('confirmationCode', e.target.value)}
                  className="w-4/5 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
                />
                <button
                onClick={handleConfirmation}
                disabled={isConfirmButtonDisabled}
                style={isConfirmButtonDisabled?{background:'#808080'}:{  background: currentColor }}
                  className={`w-40 ml-2 dark:text-gray-200 text-white px-4 py-2 rounded-md${isConfirmButtonDisabled?'':'hover:drop-shadow-lg'}  ${isConfirmButtonDisabled?'cursor-not-allowed':''}`}
                >
                  {isConfirmButtonDisabled ? 'Verified' : 'Confirm'}
                </button>
              </div>
            </div>
          )}


             {/* Password input field */}
             <div className="mb-4 relative">
            <label htmlFor="password" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              Password / پاسورد
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Password/پاسورد"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full border dark:border-none dark:bg-gray-700 rounded-md px-3 py-2 mt-1 ${
                passwordMismatch ? 'text-red-500' : ''
              }`}
            />
            <span
              className="absolute top-11 right-3 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          {/* Confirm Password input field */}
          <div className="mb-4 relative">
            <label htmlFor="confirmPassword" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              Confirm Password/ تایید پاسورد
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirm Password/تایید پاسورد"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full border dark:border-none dark:bg-gray-700 rounded-md px-3 py-2 mt-1 ${
                passwordMismatch ? 'text-red-500' : ''
              }`}
            />
            <span
              className="absolute top-11 right-3 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>
        <button onClick={handleAddUser} disabled={disableAddUser}  style={disableAddUser?{background:'#808080'}:{  background: currentColor }} className={` mt-4 dark:text-gray-200 text-white py-2 px-4 rounded-md ${disableAddUser?'':'hover:drop-shadow-lg'}  ${disableAddUser?'cursor-not-allowed':''}`}>
          Add User / کارونکی اضافه کړی
          
        </button>
      </div>

      {/* Image on the left side */}
      <div className="md:w-1/3 hidden sm:block">
        <div className="w-full h-full opacity-75 hover:opacity-100 bg-gray-300 rounded-lg"></div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddUser;
