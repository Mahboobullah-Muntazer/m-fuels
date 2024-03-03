import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DebitOrCreditPopup = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    type: 'credit',
    date: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [buttonClicked, setButtonClicked] = useState(false); // Added state for button click

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

  const handleSave = () => {
    // Validate fields
    const errors = {};
    if (!formData.amount.trim()) {
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

    // Reset validation errors
    setValidationErrors({});
    setButtonClicked(true);

    // Proceed with saving
    onSave(formData);
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
        <ToastContainer />
      </div>
    </div>
  );
};

DebitOrCreditPopup.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DebitOrCreditPopup;
