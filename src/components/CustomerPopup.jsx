import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';


import { useAuthContext } from '../hooks/useAuthContext';
import { RingLoader } from 'react-spinners';

const CustomerPopup = ({ onClose, onSave }) => {

    const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
    const { user } = useAuthContext();
// Get the navigate function
    const [disableAddButton, setDisableAddButton] = useState(false);
    const [isLoading,setIsLoading]=useState(false)
  



 
    const [formData, setFormData] = useState({
        customerName: '',
        contactNumber: '',
        address: '',
      });


  

      const handleInputChange = (field, value) => {

    

        setFormData((prevFormData) => ({
          ...prevFormData,
          [field]: value,
        }));
      }; 
  const handleSave = async () => {
    if (formData.customerName.trim() === '') {
      toast.error('پیرودونکی نوم داخلول ضروری دی', {
        position: 'top-right',
      });

      return;
    }

    const { customerName, contactNumber, address } =
      formData;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };

    const body = JSON.stringify({
      customerName,
      
      contactNumber,
      address,
    });

    try {
      setDisableAddButton(true);
      setIsLoading(true)
      const res = await axios.post(
        SERVER_PATH + 'api/actions/addCustomer',
        body,
        config
      );

      console.log(res.data);
      if (res.data.status === 'SUCCESS') {
        setIsLoading(false)
        toast.success('پیرودونکی ثب شو', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        onClose();
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
      setIsLoading(false)
      setDisableAddButton(false);
      onClose();
    }
  };

   






  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-slate-300 rounded p-8 max-w-md w-full">
        <label className="block font-semibold mb-4">Customer Name / پیرودونکی نوم</label>
        <input
          type="text"
          value={formData.customerName}
          placeholder='Customer Name / پیرودونکی نوم'
          onChange={(e) => handleInputChange('customerName', e.target.value)}
          className="w-full border p-2 mb-4 bg-slate-100"
        />
         <label className="block font-semibold mb-4">Customer Contact / پیرودونکی نمبر </label>
        <input
          type="text"
          value={formData.contactNumber}
          placeholder='Customer Contact / پیرودونکی نمبر'
          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          className="w-full border p-2 mb-4  bg-slate-100"
        />
         <label className="block font-semibold mb-4">Customer Address / پیرودونکی ادرس</label>
        <textarea
          type="text"
          value={formData.address}
          placeholder='Customer Address / پیرودونکی ادرس'
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full border p-2 mb-4  bg-slate-100"
        />
        {/* Add other input fields as needed */}
        <div className="flex justify-end">
        <button
            onClick={handleSave}
            className={`bg-blue-500 text-white px-4 py-2 rounded mr-2 ${disableAddButton ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || disableAddButton}
          >
            {isLoading ? (
              <RingLoader color={'#fff'} loading={isLoading} size={18} />
            ) : (
              'Save / ثبتول'
            )}
          </button>
          <button disabled={disableAddButton} onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel / لغوه
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPopup;
