import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UpdateDebitOrCreditPopup = ({ onUpdate, onDelete, onCancel, customer_id, selectedRowData }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [buttonClicked, setButtonClicked] = useState(false);

  const location = useLocation();

  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    _id:selectedRowData?._id || '',
    customerId: customer_id,
    amount: selectedRowData?.amount || '',
    reason: selectedRowData?.reason || '',
    type: selectedRowData?.type || 'credit',
    date: selectedRowData?.paymentDate || '',
  });

  const handleUpdate = async () => {
   
    const errors = {};
    const amountString = String(formData.amount);

    if (!amountString.trim()) {
      errors.amount = 'مقدار ضروری دی ';
    }
    if (!formData.reason.trim()) {
      errors.reason = 'دلیل ضروری دی';
    }
    if (!formData.date) {
      errors.date = 'تاریخ ضروری دی';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (
     formData.customerId !== undefined &&
      formData.customerId !== null &&
      formData.customerId !== '' &&
      formData._id !== undefined &&
      formData._id !== null &&
      formData._id !== ''
    ){
      const {   _id,
        customerId,
        amount,
        reason,
        type,
        date}=formData;

        const {billNumber }=selectedRowData
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
      const body = JSON.stringify({
        _id,
    customerId,
    amount,
    reason,
    type,
    date,
    billNumber
    
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
    }

   










  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('ایا غواړی دا ریکارد ډلیت شی ؟');

  if(confirmDelete)
  {
    if (
      customer_id !== undefined &&
      customer_id !== null &&
      customer_id !== '' &&
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
        console.log(selectedRowData._id, customer_id);
        const res = await axios.delete(
          `${SERVER_PATH}api/actions/deleteCustomerAccountRecord/${customer_id}/${selectedRowData._id}`,
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
    if (name === 'amount' && isNaN(value)) {
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
      <div className="bg-white p-6 rounded-md w-96 shadow-md">
        <label className="block mb-2 text-sm font-bold">Amount: مقدار</label>
        <input
          type="text"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          placeholder="Enter amount"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
            validationErrors.amount ? 'border-red-500' : ''
          }`}
        />
        {validationErrors.amount && (
          <p className="text-sm text-red-500">{validationErrors.amount}</p>
        )}

        <label className="block mt-4 mb-2 text-sm font-bold">Reason:دلیل</label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          placeholder="Enter reason"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
            validationErrors.reason ? 'border-red-500' : ''
          }`}
        />
        {validationErrors.reason && (
          <p className="text-sm text-red-500">{validationErrors.reason}</p>
        )}

        <label className="block mt-4 mb-2 text-sm font-bold">Type:ډول</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="credit"
              checked={formData.type === 'credit'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Credit / وصول
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="debit"
              checked={formData.type === 'debit'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Debit / پور
          </label>
        </div>

        <label className="block mt-4 mb-2 text-sm font-bold">Date:نیټه</label>
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
        )}

        <div className="flex justify-end mt-6 space-x-4">
        <button
            onClick={handleUpdate}
            disabled={buttonClicked}
            className={`px-4 py-2 ${
              buttonClicked ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-md focus:outline-none`}
          >
            {buttonClicked ? 'updating...' : 'Update / تغیرول'}
          </button>
          <button
            onClick={handleDelete}
            disabled={buttonClicked}
            className={`px-4 py-2 ${
              buttonClicked ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            } text-white rounded-md focus:outline-none`} >
            {buttonClicked ? 'waiting...' : 'Delete /دلیت'}
          
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none"
          >
            Cancel / لغوه  
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
