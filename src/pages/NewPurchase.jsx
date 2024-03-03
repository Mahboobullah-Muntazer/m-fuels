import React, { useState, useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingDropDown from '../components/LoadingDropDown';

import SearchAbleDropDown from '../components/SearchAbleDropDown';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader  } from 'react-spinners';

const NewPurchase = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const location = useLocation();
  const selectedCollection = location.state?.selectedCollection;

  const { currentColor } = useStateContext();
  const { user } = useAuthContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [isLoading,setIsLoading]=useState(true)

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricePerLiter,setPricePerLiter] = useState(0);
  const [formData, setFormData] = useState({
    supplier: '',
    fuelType: '',
    driverName: '',
    plateNumber: '',
    quantityInTons:'',
    quantityInLiters:'',
    totalPrice:'',
    transferedFromAddress:'',
    purchaseDate:''
  });

  const handleInputChange = (field, value) => {

    
    if (field === 'quantityInTons' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }else if (field === 'quantityInLiters' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    } else if (field === 'totalPrice' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }

    

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  }; 

  useEffect(() => {
    const calculatePricePerLiter = () => {
      const totalPrice = parseFloat(formData.totalPrice);
      const quantityInLiters = parseFloat(formData.quantityInLiters);

      if (!isNaN(totalPrice) && !isNaN(quantityInLiters) && quantityInLiters !== 0) {
        const pricePerLiterValue = totalPrice / quantityInLiters;
        setPricePerLiter(pricePerLiterValue);
        console.log(pricePerLiterValue);
      } else {
        setPricePerLiter(0);
        console.log(0);
      }
    };

    calculatePricePerLiter();
  }, [formData.totalPrice, formData.quantityInLiters]);



  useEffect(() => {
    const getAllSuppliers = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true)
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAllSuppliers',
          config
        );

        if (res.data.status !== 'FAILED') {
          setIsLoading(false)
          setSuppliers(res.data);
          setLoading(false);
        } else {
          setIsLoading(false)
          console.log(res);
        }
      } catch (err) {
        setIsLoading(false)
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };

    getAllSuppliers();
  }, [user.token]);







  const handleSelect = (selectedValue) => {
 
    setFormData((prevFormData) => ({
      ...prevFormData,
      supplier: selectedValue,
    }));
  

    
  };
  const handleSave =async () => {
 


    const isFormValid = Object.values(formData).every((value) => value !== null && value !== '');

      // Check if fuelType is 'select'
  if (formData.fuelType === 'select') {
    toast.warning('لطفا د تیلو ډول انتخاب کړی ', { position: 'top-right' });
    return;
  }
    console.log(formData);
    if (!isFormValid) {
      // Display a warning message in Pashto language using toast
      toast.warning('ټول فیلدونه ضرور دی ', { position: 'top-right' });
      return;
    }
  
    // Continue with the save logic if the form is valid
    const { 
       supplier,
    fuelType,
    driverName,
    plateNumber,
    quantityInTons,
    quantityInLiters,
    totalPrice,
    transferedFromAddress,
    purchaseDate
     } =
    formData;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': user.token,
    },
  }; 

  const body = JSON.stringify({
    supplier,
    fuelType,
    driverName,
    plateNumber,
    selectedCollection,
    quantityInTons,
    quantityInLiters,
    totalPrice,
    transferedFromAddress,
    purchaseDate
  });

  try {
    setDisableAddButton(true);
    setIsLoading(true)
    const res = await axios.post(
      SERVER_PATH + 'api/actions/addPurchase',
      body,
      config
    );

    console.log(res.data);
    if (res.data.status === 'SUCCESS') {
      setIsLoading(false)
      toast.success('خدرید اضافه شو', {
        position: 'top-center',
      });
      // Redirect or update your UI as needed
      navigate('/Purchases');
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
    setDisableAddButton(false);
    setIsLoading(false)
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
  New Purchase / نوی خرید
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
              placeholder='Driver Name / دریور نوم'
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
              placeholder='Plate Number / نمبر پلیټ'
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
              placeholder='Quantity in Tons / 
            مقدار په ټن'
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
              placeholder='Quantity in Liters / مقدار په لیټرو'
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
           
              placeholder=' Total price in dollars / مجمعی قیمت په ډالرو'
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
            placeholder=' Transfered From: Address / د کوم ځای انتقال شوی'
            className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
          />
        </div>
        <button
        disabled={disableAddButton}
          onClick={handleSave}
       
          style={disableAddButton?{background:'#808080'}:{  background: currentColor }} className={` mt-4 dark:text-gray-200 text-white py-2 px-4 rounded-md ${disableAddButton?'':'hover:drop-shadow-lg'}  ${disableAddButton?'cursor-not-allowed':''}`}>
          Save/ثبتول
        </button>
      </div>
      <ToastContainer />
      {/* Image on the left side */}
    </div>
  );
};

export default NewPurchase;
