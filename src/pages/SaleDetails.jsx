import React, { useState, useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader  } from 'react-spinners';
import useStockCalculator from '../hooks/useStockCalculator';

const SaleDetails = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const location = useLocation();

  const saleData = location.state?.data;
  const selectedCollection  = location.state?.selectedCollection;
  const [isLoading,setIsLoading]=useState(true)

  const { currentColor } = useStateContext();
  const { user } = useAuthContext();
  const navigate = useNavigate(); // Get the navigate function
  const [disableAddButton, setDisableAddButton] = useState(false);

  const [petrolStock, setPetrolStock] = useState(null);
  const [dieselStock, setDieselStock] = useState(null);
  const [gasStock, setGasStock] = useState(null);


  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const {stock } = useStockCalculator(
    selectedCollection,
    user
  );

const [remaining,setRemaining] = useState(0);

const [totalPrice,setTotalPrice] = useState('');

  const [formData, setFormData] = useState({
    _id: '',
    billNumber:'',
    fuelType: 'select',
    saleDate: '',
    driverName: '',
    plateNumber: '',
    quantityInTons: '',
    quantityInLiters: '',
    pricePerTon: '',
    totalPaid:'',
    customerId:'',
    customerName:'',
    contactNumber: '',
    address: ''
  });

  // Step 1: Add state variables
 
  const [newCustomer, setNewCustomer] = useState(false);

  useEffect(() => {
    // Calculate profit when quantityInTons or totalPrice changes
    setIsLoading(true);
   
    calculateRemining();
    setIsLoading(false);
  }, [formData.quantityInTons, formData.quantityInLiters,totalPrice,formData.totalPaid,formData.fuelType]);
  

  useEffect(() => {
    if (saleData) {
      const { 
        _id,
        billNumber,
        fuelType,
        saleDate,
        driverName,
        plateNumber,
        quantityInTons,
        quantityInLiters,
        pricePerTon,
       customer,
        totalPaid,
       

        
         } = saleData;
      setFormData({
        _id,
        billNumber,
        fuelType,
        saleDate,
        driverName,
        plateNumber,
        quantityInTons,
        quantityInLiters,
        pricePerTon,
        
        totalPaid,
        
        customerId:customer._id,
        customerName:customer.customerName,
       
       
      });

      console.log(saleData)
      setIsLoading(true)
    }
    
  }, [saleData]);


 
 
  





  const calculateRemining = () => {
    
    if (!isNaN(formData.totalPaid) && !isNaN(totalPrice)) {
    
      const totalPaid = parseFloat(formData.totalPaid);
      const totalPr = parseFloat(totalPrice);
      const remaining =totalPr - totalPaid;
     setRemaining(remaining);
    }
  };

  // Step 2: Update handleSelect to set customer details
  const handleSelect = (selectedValue) => {
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const { customerName, contactNumber, address } = selectedValue;
  
      // Update only the specific fields in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        customerName,
        contactNumber,
        address,
      }));
  
      setNewCustomer(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'quantityInTons' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }else if (field === 'quantityInLiters' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    } else if (field === 'pricePerTon' && isNaN(value)) {
      // You can display an error message, prevent setting the state, or handle it as needed
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }else if (field === 'totalPaid' && isNaN(value)) {
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }


    setFormData({ ...formData, [field]: value });
  };


  useEffect(() => {
    setTotalPrice((prevTotalPrice) => {
      const total = formData.pricePerTon * formData.quantityInTons;
      return total;
    });
  },[formData.pricePerTon, formData.quantityInTons])

  const handleUpdate =async () => {

   
    const isFormValid = Object.values(formData).every((value) => value !== null && value !== '');

    // Check if fuelType is 'select'
if (formData.fuelType === 'select') {
  toast.warning('لطفا د تیلو ډول انتخاب کړی ', { position: 'top-right' });
  return;
}
  
  if (!isFormValid) {
    // Display a warning message in Pashto language using toast
    toast.warning('ټول فیلدونه ضرور دی ', { position: 'top-right' });
    return;
  }

  if(totalPrice===0 ) {

    toast.warning('مجموعی قیمت چک کړی', { position: 'top-right' });
    return;
  }

    const { 
      _id,
      billNumber,
      fuelType,
      saleDate,
      driverName,
      plateNumber,
      quantityInTons,
      quantityInLiters,
      pricePerTon,
      totalPaid,
      customerId,
     
       } =
      formData;
  
      

   
   
 
      let availableStockInTon = 0;
      switch (fuelType) {
        case 'petrol':
          availableStockInTon = stock.petrol?  stock.petrol.totalQuantityInTons : 0;
          break;
        case 'diesel':
          availableStockInTon = stock.diesel?  stock.diesel.totalQuantityInTons : 0;
          break;
        case 'gas':
          availableStockInTon = stock.gas?  stock.gas.totalQuantityInTons : 0;
          break;
        default:
          break;
      }
      
    
      let availableStockInLiters = 0;
      switch (fuelType) {
        case 'petrol':
          availableStockInLiters =  stock.petrol? stock.petrol.totalQuantityInLiters : 0;
          break;
        case 'diesel':
          availableStockInLiters = stock.diesel? stock.diesel.totalQuantityInLiters : 0;
          break;
        case 'gas':
          availableStockInLiters = stock.gas? stock.gas.totalQuantityInLiters : 0;
          break;
        default:
          break;
      }
    
 
 if(formData.fuelType===saleData.fuelType)
 {
  if (
    parseFloat(quantityInTons)-parseFloat(saleData.quantityInTons) > availableStockInTon ||
    parseFloat(quantityInLiters)-parseFloat(saleData.quantityInLiters)  > availableStockInLiters
   ) {
    
     toast.error('د خرصولو اندازه زیاته ده نسبت ذخیری ته', {
       position: 'top-right',
     });
     return;
   }
 }else
 {
  if (
    parseFloat(quantityInTons) > availableStockInTon ||
    parseFloat(quantityInLiters) > availableStockInLiters
  ) {
   
    toast.error('د خرصولو اندازه زیاته ده نسبت ذخیری ته', {
      position: 'top-right',
    });
    return;
  }
 }
  
  
   
   if(remaining<0)
   {
     toast.warning('بقایه فیلد منفی دی', { position: 'top-right' });
     return;
   }


   setIsLoading(true)

    const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      };
      const body = JSON.stringify({
        _id,
      billNumber,
      fuelType,
      saleDate,
      driverName,
      plateNumber,
      quantityInTons,
      quantityInLiters,
      totalPrice,
      pricePerTon,
      totalPaid,
      customerId,
      remaining,
      selectedCollection,
    
      });
  
      try {
        const res = await axios.put(
          SERVER_PATH + 'api/actions/updateSale',
          body,
          config
        );
  
        console.log("updated",res.data)
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
          navigate('/sales');
        }
      } catch (err) {
        setIsLoading(false)
        console.log(err);
  
        if (err.response.data.status === 'FAILED') {
          toast.error(err.response.data.message, {
            position: 'top-center',
          });
        } else {
          toast.error('Error occurred while updating supplier data', {
            position: 'top-right',
          });
        }
      }finally{
        setIsLoading(false)
      }
  

  };

  
  const handleDelete = () => {
    // Display confirmation box
    setIsConfirmVisible(true);

  
  };

  const confirmDelete = async () => {
    const { _id } = saleData;
  
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': user.token,
      },
    };
  
    try {
      setIsLoading(true)
      setIsConfirmVisible(false);
      // Include the _id in the URL
      const res = await axios.delete(
        `${SERVER_PATH}api/actions/deleteSale/${selectedCollection}/${_id}`,
        config
      );
  
      if (res.data.status === 'success') {
        setIsLoading(false)
        toast.success('ریکارد دلیت شو', {
          position: 'top-center',
        });
        // Redirect or update your UI as needed
        navigate('/sales');
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
    <div className='m-2 md:m-10 p-2 md:p-10 dark:bg-gray-600 bg-white rounded-3xl flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      <div className='md:w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
       

       
     <div className='w-full bg-slate-200 flex flex-col md:flex-row justify-between rounded-2xl mb-4'>
  <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 md:mb-0 mt-2 md:mt-7 pl-4'>
  Sale Details /  خرڅلاو جزیات
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
              htmlFor='fuelType'
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Fuel Type / د تیلو ډول
            </label>
            <select
              id='fuelType'
              value={formData.fuelType}
              
              onChange={(e) => handleInputChange('fuelType', e.target.value)}
              className='w-full   border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-2'
            >
               
              <option value='petrol'>Petrol / پترول</option>
              <option value='diesel'>Diesel / ډیزل</option>
              <option value='gas'>Gas / ګاز</option>
              {/* Add more options as needed */}
            </select>
          </div>
          <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium text-gray-600'>
             Sales Date /  د خرڅلاو نیټه
            </label>
            <input
              type='date'
              value={formData.saleDate}
              onChange={(e) => handleInputChange('saleDate', e.target.value)}
              name='saleDate'
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
              placeholder={saleData.driverName}
              value={formData.driverName}
              onChange={(e) => handleInputChange('driverName', e.target.value)}
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
              placeholder={saleData.plateNumber}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

      

       




          <div className='mb-4'>
          <div className='flex'>
            <label
         
              className='w-full block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              
              Quantity in Tons / مقدار په ټن
            </label>
            <label
         
         className='w-1/3 block dark:text-gray-200 text-sm font-medium text-gray-600'
       >
          Stock/ذخیره   
            </label>
            </div>
            <div className='flex'>
            <input
              type='text'
              id='quantityInTons'
              name='quantityInTons'
              value={formData.quantityInTons}
              onChange={(e) => handleInputChange('quantityInTons', e.target.value)}
              placeholder={saleData.quantityInTons}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />

<input
              type='text'
             name='stockInTons'
              // value={formData.quantityInTons}
              value={
                formData.fuelType === 'petrol'
                  ? stock?.petrol.totalQuantityInTons
                  : formData.fuelType === 'diesel'
                  ? stock?.diesel.totalQuantityInTons
                  : formData.fuelType === 'gas'
                  ? stock?.gas.totalQuantityInTons
                  : ''
              }
  disabled
              placeholder='  Stock /ذخیره'
              className='w-1/3 bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />

            </div>
          </div>

          <div className='mb-4'>
          <div className='flex'>
            <label
              
              className='w-full block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Quantity in Liters / مقدار په لیټرو
            </label>
            <label
              
              className='w-1/3 block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
           Stock/ ذخیره
            </label>
            </div>
          <div className='flex'>
          <input
              type='text'
              name='quantityInLiters'
              value={formData.quantityInLiters}
              onChange={(e) => handleInputChange('quantityInLiters', e.target.value)}
              placeholder={saleData.quantityInLiters}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
             <input
             type='text'
            disabled
            name='stockInLiters'
            value={
              formData.fuelType === 'petrol'
                ? stock?.petrol.totalQuantityInLiters
                : formData.fuelType === 'diesel'
                ? stock?.diesel.totalQuantityInLiters
                : formData.fuelType === 'gas'
                ? stock?.gas.totalQuantityInLiters
                : ''
            }
  placeholder=' Stock /ذخیره'
              className='w-1/3 bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
          </div>

          {/* Second input row */}

         
          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
               price per Ton in dollars /  فی ټڼ قیمت په ډالرو
            </label>
            <input
              type='text'
              name='pricePerTon'
              value={formData.pricePerTon}
              onChange={(e) => handleInputChange('pricePerTon', e.target.value)}
              
              placeholder='price per Ton in dollars /  فی ټڼ قیمت په ډالرو '
              className='w-full border  dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>



          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Total price in dollars / مجمعی قیمت په ډالرو
            </label>
            <input
              type='text'
              name='totalPrice'
              value={totalPrice}
              onChange={(e) => handleInputChange('totalPrice', e.target.value)}
              disabled
              placeholder={saleData.totalPrice}
              className='w-full border bg-slate-400 dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>


      

          
          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Total Paid /  ټول تادیه
            </label>
            <input
              type='text'
              name='totalPaid'
              
              onChange={(e) => handleInputChange('totalPaid', e.target.value)}
             
             value={formData.totalPaid}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium text-gray-600'
            >
              Remaining /  بقایه
            </label>
            <input
              type='text'
              name='remaining'
              disabled
             value={remaining}
              className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>



        
          
        
              <div className='mb-4'>
                <label
             
                  className='block dark:text-gray-200 text-sm font-medium text-gray-600'
                >
                 Customer Name / پیرودونکی نوم
                </label>
                <input
                  type='text'
                  value={formData.customerName}
                  name='customerName'
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder={saleData.customerName}
                  className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
                  disabled={!newCustomer}
                />
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

export default SaleDetails;
