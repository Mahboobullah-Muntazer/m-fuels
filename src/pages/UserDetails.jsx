import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateContext } from '../contexts/ContextProvider';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { ClipLoader  } from 'react-spinners';
const UserDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function
  const [isLoading,setIsLoading]=useState(true)

  const userData = location.state?.data;
  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    _id:'',
    fullName: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {

    if (userData) {
     
      const {_id } = userData;
      setFormData({
        _id,
        fullName:'',
        password: '',
        confirmPassword: '',
      });
      setIsLoading(false);
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
  
  

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleUpdate = async() => {
    const { _id, fullName, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      toast.error('پاسورد او تاید پاسورد باید یو شان وی', {
        position: 'top-right',
      });
      return; // Stop further execution if passwords don't match
    }
  
    setIsLoading(true)
    const config = {
      headers: {
         'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
    const body = JSON.stringify({_id, fullName, password });
    
    try {
      
      const res = await axios.put(
        SERVER_PATH + 'api/actions/updateUser',
        body,
        config
      );

      console.log(res.data)
      if (res.data.status) {
        if (res.data.status == 'FAILED') {
          toast.error(res.data.message, {
            position: 'top-right',
          });
          
    setIsLoading(false)
        }else
        {
          
    setIsLoading(false)
          toast.success('د کارونکی معلومات تغیر شول', {
            position: 'top-center',
          });
          navigate('/users');
        }
      } 
    } catch (err) {
      console.log(err);
      setIsLoading(false)
      if(err.response.data.status === 'FAILED')
      {
        toast.error(err.response.data.message, {
          position: 'top-center',
        });
      }else
      {
        toast.error('لطفا بیا کوشش وکړی', {
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
    const { _id } = userData;
    setIsLoading(true)
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
  
    try {
      setIsConfirmVisible(false);
      // Include the _id in the URL
      const res = await axios.delete(
        `${SERVER_PATH}api/actions/deleteUser/${_id}`,
        config
      );
  
      if (res.data.status === 'success') {
        setIsLoading(false)
        toast.success('کارونکی دلیت شو', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        navigate('/users');
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


  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Doubled width of the form */}
      <div className=" w-760  m-2 p-10 md:p-10 dark:bg-gray-600 bg-white rounded-3xl">
        <h2 className="text-2xl dark:text-gray-200 font-semibold mb-6 mt-7">User Details</h2>

        {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )} 
       <div className="grid grid-cols-1 md:flex-row gap-4">
          {/* Full Name input field */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              Full Name / مکمل نوم 
            </label>
            <input
              type="text"
              id="fullName"
              
              placeholder={userData ? userData.fullName :'Full Name /مکمل نوم'}
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
            />
          </div>

          {/* Password input field */}
          <div className="mb-4">
            <label htmlFor="password" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              Password / پاسورد 
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password/پاسورد"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>

          {/* Confirm Password input field */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block dark:text-gray-200 text-sm font-medium text-gray-600">
              Confirm Password/ تایید پاسورد
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirm Password / تایید پاسورد"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center mt-4 space-x-4">
            <button
              onClick={handleUpdate}
              style={{ background: currentColor }}
              className={`dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg`}
            >
              Update /تغیرول
            </button>
            <button
              onClick={handleDelete}
              style={{ background: 'red' }}
              className={`dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg`}
            >
              Delete / دلیتول
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />


{/* Confirm Dialog */}


      {isConfirmVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p>Are you sure you want to delete this user?/ایا غواړی چی دا کارونکی دلیت کړی ؟</p>
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
    </div>
  );
};

export default UserDetails;
