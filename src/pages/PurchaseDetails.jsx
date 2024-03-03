import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateContext } from '../contexts/ContextProvider';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingDropDown from '../components/LoadingDropDown';

import SearchAbleDropDown from '../components/SearchAbleDropDown';
import { ClipLoader  } from 'react-spinners';

const SupplierDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const purchaseData = location.state?.data;
  const selectedCollection  = location.state?.selectedCollection;
  const { user } = useAuthContext();
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading,setIsLoading]=useState(true)

  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    _id: '',
    supplier: '',
    fuelType: '',
    driverName: '',
    plateNumber: '',
    quantityInTons:'',
    quantityInLiters:'',
    totalPrice:'',
    transferedFromAddress:'',
    purchaseDate:'',
   
  });

  useEffect(() => {
    if (purchaseData) {
      setIsLoading(false);
      const { 
        _id,  
        supplier,
        fuelType,
        driverName,
        plateNumber,
        quantityInTons,
        quantityInLiters,
        totalPrice,
        transferedFromAddress,
        purchaseDate } = purchaseData;
      setFormData({
        _id,
    supplier,
    fuelType,
    driverName: '',
    plateNumber: '',
    quantityInTons:'',
    quantityInLiters:'',
    totalPrice:'',
    transferedFromAddress:'',
    purchaseDate
      });
    }
  }, [purchaseData]);

  useEffect(() => {
    const getAllSuppliers = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true);
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAllSuppliers',
          config
        );

        if (res.data.status !== 'FAILED') {
          setIsLoading(false);
          setSuppliers(res.data);
          setLoading(false);
        } else {
          setIsLoading(false);
          console.log(res);
        }
      } catch (err) {
        setIsLoading(false);
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };

    getAllSuppliers();
  }, [user.token]);



  const handleInputChange = (field, value) => {
    

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
   
  
      

    const {
      _id,  
      supplier,
      fuelType,
      driverName,
      plateNumber,
      quantityInTons,
      quantityInLiters,
      totalPrice,
      transferedFromAddress,
      purchaseDate,
      
     } = formData;

    // Check if all fields, except _id, are null or empty
    const isDataEmpty =  !driverName && !plateNumber && 
    !quantityInTons &&!quantityInLiters &&!totalPrice &&!transferedFromAddress 
    && supplier === purchaseData.supplier && fuelType ===purchaseData.fuelType && purchaseDate===purchaseData.purchaseDate
    ;

    if (isDataEmpty) {
      toast.info('هیس تغیرات نشته د ثبتولو لپاره', { position: 'top-right' });
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
    const body = JSON.stringify({
      _id,  
      supplier,
      fuelType,
      driverName,
      plateNumber,
      quantityInTons,
      quantityInLiters,
      totalPrice,
      transferedFromAddress,
      purchaseDate,
      selectedCollection,
    });

    try {
      setIsLoading(true);
      const res = await axios.put(
        SERVER_PATH + 'api/actions/updatePurchase',
        body,
        config
      );

      if (res.data.status) {
        if (res.data.status === 'FAILED') {
          setIsLoading(false);
          toast.error(res.data.message, {
            position: 'top-right',
          });
        } else {
          setIsLoading(false);
          toast.success('معلومات تغیر شول', {
            position: 'top-right',
          });
          navigate('/purchases');
        }
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
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

  };
  
  const handleSelect = (selectedValue) => {
 
    setFormData((prevFormData) => ({
      ...prevFormData,
      supplier: selectedValue,
    }));
  
   

    
  };

  const handleDelete = () => {
    // Display confirmation box
    setIsConfirmVisible(true);
  };

  const confirmDelete = async () => {
    const { _id } = purchaseData;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
  
    try {
      setIsConfirmVisible(false);
      setIsLoading(true);
      // Include the _id in the URL
      const res = await axios.delete(
        `${SERVER_PATH}api/actions/deletePurchase/${selectedCollection}/${_id}`,
        config
      );
  
      if (res.data.status === 'success') {
        setIsLoading(false);
        toast.success('ریکارد دلیت شو', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        navigate('/purchases');
      } else {
        setIsLoading(false);
        toast.error(res.data.message, {
          position: 'top-right',
        });
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
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
    <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
       <div className='w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
     

    
     <div className='w-full bg-slate-200 flex flex-col md:flex-row justify-between rounded-2xl mb-4'>
  <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 md:mb-0 mt-2 md:mt-7 pl-4'>
  Purchase Details / د خرید جزیات
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
              Supplier / عرضه کوونکی
            </label>
            {loading ? (
              // Show loading indicator while data is being fetched
            <LoadingDropDown/>
            ) : (
              // Render supplier options once data is fetched
              <SearchAbleDropDown options={suppliers.map((item) => ({ value: item.organizationName, label: item.organizationName }))} onSelect={handleSelect} />
     
            )}
          </div>

          <div className='mb-4'>
            <label
              htmlFor='fuelType'
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Fuel Type / د تیلو ډول
            </label>
            <select
              id='fuelType'
              value={formData.fuelType}
              onChange={(e) => handleInputChange('fuelType', e.target.value)}
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-2'
            >
               <option value='select'>select.../...انتخاب</option>
              <option value='petrol'>Petrol / پترول</option>
              <option value='diesel'>Diesel / ډیزل</option>
              <option value='gas'>Gas / ګاز</option>
              {/* Add more options as needed */}
            </select>
          </div>
          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
             Purchase Date /  د خرید نیټه
            </label>
            <input
              type='date'
              placeholder={purchaseData.purchaseDate}
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              name='purchaseDate'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='driverName'
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Driver Name / دریور نوم
            </label>
            <input
              type='text'
              id='driverName'
              value={formData.driverName}
              onChange={(e) => handleInputChange('driverName', e.target.value)}
              placeholder={purchaseData.driverName}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='plateNumber'
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Plate Number / نمبر پلیټ
            </label>
            <input
              type='text'
              id='plateNumber'
              value={formData.plateNumber}
              onChange={(e) => handleInputChange('plateNumber', e.target.value)}
              placeholder={purchaseData.plateNumber}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label
         
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Quantity in Tons / مقدار په ټن
            </label>
            <input
              type='text'
              id='quantityInTons'
              name='quantityInTons'
              value={formData.quantityInTons}
              onChange={(e) => handleInputChange('quantityInTons', e.target.value)}
              placeholder={purchaseData.quantityInTons}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label
              
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Quantity in Liters / مقدار په لیټرو
            </label>
            <input
              type='text'
              name='quantityInLiters'
              value={formData.quantityInLiters}
              onChange={(e) => handleInputChange('quantityInLiters', e.target.value)}
              placeholder={purchaseData.quantityInLiters}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          {/* Second input row */}

          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Total price in dollars / مجمعی قیمت په ډالرو
            </label>
            <input
              type='text'
              name='totalPrice'
              value={formData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', e.target.value)}
           
              placeholder={purchaseData.totalPrice}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
       
        </div>
        <div className='mb-4 mt-4'>
          <label
            htmlFor='transferedFromAddress'
            className='block dark:text-gray-200 text-sm font-medium text-gray-600'
          >
            Transfered From: Address / د کوم ځای انتقال شوی
          </label>
          <textarea
            type='text'
            name='transferedFromAddress'
            value={formData.transferedFromAddress}
            onChange={(e) => handleInputChange('transferedFromAddress', e.target.value)}
         
            rows={2}
            style={{ resize: 'none' }}
            placeholder={purchaseData.transferedFromAddress}
            className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
          />

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
          </div>
          
        </div>
       
      </div>
      <ToastContainer />
      {/* Image on the left side */}
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

export default SupplierDetails;
