import React, { useState, useEffect } from 'react';


import axios from 'axios';

import LoadingDropDown from '../LoadingDropDown';

import SearchAbleDropDown from '../SearchAbleDropDown';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader  } from 'react-spinners';
import CustomerPopup from '../CustomerPopup';
import useStockCalculator from '../../hooks/useStockCalculator';
import { useStateContext } from '../../contexts/ContextProvider';
import { useAuthContext } from '../../hooks/useAuthContext';

const NewSale = ({selectedCollection,handleBackToHome}) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
 
  const { currentColor } = useStateContext();
  const { user } = useAuthContext();

  const [disableAddButton, setDisableAddButton] = useState(false);

 

  const [customers, setCustomers] = useState([]);
  const [sarafis, setSarafis] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLoading,setIsLoading]=useState(true)
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const {stock } = useStockCalculator(
    selectedCollection,
    user
  );

  const [totalPrice,setTotalPrice] = useState('');

  const [saleType,setSaleType] = useState('byTon');

  const [formData, setFormData] = useState({
    fuelType: 'select',
    saleDate: '',
    driverName: '',
    plateNumber: '',
    quantityInTons: '',
   
    pricePerTon: '',
    pricePerLiter: '',
    quantityInLiters: '',
   
    remaining:'',
    totalPaid:'',
    customerId:'',
    paymentType:'',
    collection:selectedCollection?._id || '',
    customerName:'',
    contactNumber: '',
    balance: '',
    address: '',
    personName:'',
     paymentDate:new Date().toISOString().split('T')[0],
    receiptNumber:'',
    description:'',
    sarafi:''
  }); 

  // Step 1: Add state variables
 
  const [newCustomer, setNewCustomer] = useState(false);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setFormData(prevData => ({
      ...prevData,
      saleDate: currentDate
    }));
  }, []);
  
  useEffect(() => {
   
    getAllSarafis();
    getAllCustomers();
  }, [user.token]);

  const getAllCustomers = async function () {
    const config = {
      headers: {
        'x-auth-token': user.token,
      },
    };
    try {
      setIsLoading(true)
      const res = await axios.get(SERVER_PATH + 'api/actions/getAllCustomers', config);

      if (res.data.status !== 'FAILED') {
        setIsLoading(false)
        const sortedCustomers = res.data.sort((a, b) =>
          a.customerName.localeCompare(b.customerName)
        );
        setCustomers(sortedCustomers);
      
        setLoading(false);
        console.log(res.data);
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
  
  const getAllSarafis = async function () {
    const config = {
      headers: {
        'x-auth-token': user.token,
      },
    };
    try {
      setIsLoading(true)
      const res = await axios.get(SERVER_PATH + 'api/actions/getAllSarafis', config);

      if (res.data.status !== 'FAILED') {
        setIsLoading(false)
        const sortedSarafis = res.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSarafis(sortedSarafis);
        setLoading(false);
        console.log(res.data);
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
  
  
  const handleSelect = (selectedValue) => {
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const {_id, customerName,balance, contactNumber, address } = selectedValue;
  
     
      // Update only the specific fields in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        customerName,
        contactNumber,
        balance,
        address,
        customerId: _id
      }));
  
      setNewCustomer(false);
    }
  };


  const handleSarafiSelect = (selectedValue) => {
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const {_id} = selectedValue;
  
     
      // Update only the specific fields in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        
        sarafi: _id
      }));
  
     
    }
  };


   useEffect(()=>{
    
   },[formData])
  
  const handleInputChange = (field, value) => {
    if (field === 'quantityInTons' && isNaN(value)) {
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    } else if (field === 'quantityInLiters' && isNaN(value)) {
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    } else if (field === 'pricePerTon' && isNaN(value)) {
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    } else if (field === 'pricePerLiter' && isNaN(value)) {
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }
    
    else if (field === 'totalPaid' && isNaN(value)) {
      toast.info('صرف انګلسی شماری(0-9) داخل کیدای شی ', { position: 'top-right' });
      return;
    }
 
    if (field === 'pricePerTon' || field === 'quantityInTons') {
    
    }
      // Update other form fields
      setFormData({ ...formData, [field]: value });
    
      if(field==='paymentType' && value==='cash')
        {
          setFormData((prevFormData) => ({
            ...prevFormData,
            
            personName:'',
     paymentDate:'',
    receiptNumber:'',
    description:'',
    sarafi:''
          }));
        }
  
  };


  const handleSaleTypeChange = (field, value) => {
    
    
      if(field==='saleType' && value==='byTon')
        {
          setSaleType('byTon')
          
          setFormData((prevFormData) => ({
            ...prevFormData,
            
            
    pricePerLiter: '',
    
          }));
        }else
        {
          setSaleType('byLiter')
          
          setFormData((prevFormData) => ({
            ...prevFormData,
            
          
   
    pricePerTon: '',
  
          }));
        }
  
  };
  
  useEffect(() => {
    setTotalPrice((prevTotalPrice) => {
      const total = formData.pricePerTon * formData.quantityInTons;
      return total;
    });
  },[formData.pricePerTon, formData.quantityInTons])

  useEffect(() => {
    setTotalPrice((prevTotalPrice) => {
      const total = formData.pricePerLiter * formData.quantityInLiters;
      return total;
    });
  },[formData.pricePerLiter, formData.quantityInLiters])

  const handleSave =async () => {
 


    
      // Check if fuelType is 'select'
  if (formData.fuelType === 'select') {
    toast.warning('لطفا د تیلو ډول انتخاب کړی ', { position: 'top-right' });
    return;
  }
    
   if (formData.saleDate === '' || !formData.saleDate  || formData.saleDate===null || formData.saleDate===undefined) {
    toast.warning(' لطفا د خرڅلاو تاریخ انتخاب کړی', { position: 'top-right' });
    return;
  }
  if (formData.driverName === '' || !formData.driverName  || formData.driverName===null || formData.driverName===undefined) {
    toast.warning(' لطفا د دریور نوم انتخاب کړی', { position: 'top-right' });
    return;
  }

  if (formData.plateNumber === '' || !formData.plateNumber  || formData.plateNumber===null || formData.plateNumber===undefined) {
    toast.warning(' لطفا د پلیټ نمبر انتخاب کړی', { position: 'top-right' });
    return;
  }
  
  if (formData.quantityInTons === '' || !formData.quantityInTons  || formData.quantityInTons===null || formData.quantityInTons===undefined) {
    toast.warning(' لطفا د خرڅلاو اندازه په ټن انتخاب کړی', { position: 'top-right' });
    return;
  }
  if (formData.quantityInLiters === '' || !formData.quantityInLiters  || formData.quantityInLiters===null || formData.quantityInLiters===undefined) {
    toast.warning('لطفا د خرڅلاو اندازه په لیتر انتخاب کړی ', { position: 'top-right' });
    return;
  }
  if(saleType==='byTon')
    {
    

      if (formData.pricePerTon === '' || !formData.pricePerTon  || formData.pricePerTon===null || formData.pricePerTon===undefined) {
        toast.warning(' لطفا د یو ټن خرڅلاو قیمت انتخاب کړی', { position: 'top-right' });
        return;
      }
    }
  
     
  if(saleType==='byLiter')
    {
 

  if (formData.pricePerLiter === '' || !formData.pricePerLiter  || formData.pricePerLiter===null || formData.pricePerLiter===undefined) {
    toast.warning(' لطفا د یو لیتر خرڅلاو قیمت انتخاب کړی', { position: 'top-right' });
    return;
  }
}
 
 
 
  if (formData.totalPaid === '' || !formData.totalPaid  || formData.totalPaid===null || formData.totalPaid===undefined) {
    toast.warning(' لطفا مکمل تادیه شوی پیسی انتخاب کړی', { position: 'top-right' });
    return;
  }
  if (formData.paymentType === '' || !formData.paymentType  || formData.paymentType===null || formData.paymentType===undefined) {
    toast.warning('لطفا د تادیه ډول انتخاب کړی ', { position: 'top-right' });
    return;
  }

  if (formData.customerId === '' || !formData.customerId  || formData.customerId===null || formData.customerId===undefined) {
    toast.warning(' لطفا پیرودونکی انتخاب کړی', { position: 'top-right' });
    return;
  }
  
 
 
  if (formData.collection === '' || !formData.collection  || formData.collection===null || formData.collection===undefined) {
    toast.warning(' میاشت کی مشکل دی لطفا صفحه ریفریش کړی', { position: 'top-right' });
    return;
  }
 
  if (
    formData.paymentType==='sarafi' && formData.sarafi===''
  ) {
   
    toast.error('لطفا صرافی انتخاب کړی', {
      position: 'top-right',
    });
    return;
  }

  if (
    formData.paymentType==='sarafi' && formData.personName===''
  ) {
   
    toast.error('لطفا د تادیه کوونکی شخص نوم انتخاب کړی', {
      position: 'top-right',
    });
    return;
  }

  if (
   formData.paymentType==='sarafi' && formData. paymentDate===''
  ) {
   
    toast.error('لطفا د تادیه تاریخ انتخاب کړی', {
      position: 'top-right',
    });
    return;
  }
 

 
  
 
   

    
    if(totalPrice===0 || totalPrice==='' || totalPrice===null || totalPrice===undefined) {

      toast.warning('مجموعی قیمت چک کړی', { position: 'top-right' });
      return;
    }
    
  
    // Continue with the save logic if the form is valid
    const { 
      fuelType,
      saleDate,
      driverName,
      plateNumber,
      quantityInTons,
      quantityInLiters,
      pricePerTon,
      pricePerLiter,
      totalPaid,
      remaining,
      paymentType,
      sarafi,
      personName,
       paymentDate,
      receiptNumber,
      description,
      collection,
      customerId
     } =
    formData;



    if(remaining<0)
    {
      toast.warning('بقایه فیلد منفی دی', { position: 'top-right' });
      return;
    }
  
  
    // Validate if the quantity to be sold is less than or equal to the available stock
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
  
  
    if (
      parseFloat(quantityInTons) > availableStockInTon ||
      parseFloat(quantityInLiters) > availableStockInLiters
    ) {
     
      toast.error('د خرصولو اندازه زیاته ده نسبت ذخیری ته', {
        position: 'top-right',
      });
      return;
    }

   

   
   
   

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': user.token,
    },
  };

  const body = JSON.stringify({
    fuelType,
      saleDate,
      driverName,
      plateNumber,
      quantityInTons,
      quantityInLiters,
      totalPrice,
      collection,
      pricePerTon,
      pricePerLiter,
      selectedCollection,
       totalPaid,
      remaining,
      paymentType,
      sarafi,
      personName,
       paymentDate,
      receiptNumber,
      description,
      customerId
  });

  try {
    setIsLoading(true)
    setDisableAddButton(true);
    const res = await axios.post(
      SERVER_PATH + 'api/actions/addSale',
      body,
      config
    );

    if (res.data.status === 'SUCCESS') {
      setIsLoading(false)
      toast.success('خرڅلاو اضافه شو', {
        position: 'top-center',
      });
      // Redirect or update your UI as needed
      
       handleBackToHome();
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



  
 

  
  useEffect(() => {
    // Calculate profit when quantityInTons or totalPrice changes
    if(totalPrice ==='' || totalPrice===undefined || totalPrice===null  || totalPrice===NaN)
    {
      return
    }
    calculateRemining();
  }, [formData.totalPaid, totalPrice, formData.fuelType]);
  
 


 const calculateRemining = () => {
    console.log('calculateRemining',totalPrice)
    if (!isNaN(formData.totalPaid) && !isNaN(totalPrice)) {
    
      const totalPaid = parseFloat(formData.totalPaid);
      const totalPr = parseFloat(totalPrice);
      const remaining =totalPr - totalPaid;
      setFormData({ ...formData, 'remaining': remaining.toFixed(2) });
      // Round to 2 decimal places
    }
  };



  // ... Existing code

  const handleNewCustomerClick = () => {
    setShowCustomerPopup(true);
  };

  const handleCloseCustomerPopup = () => {
    setShowCustomerPopup(false);
    getAllCustomers();
  };

  return (
    <div className='w-full p-4  md:mt-20 bg-white  flex flex-col md:flex-row'>
      {/* Employee Information on the right side */}
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
         <div className='md:w-full dark:bg-secondary-dark-bg bg-white p-8 rounded shadow-md flex flex-col'>
       
      
       <div className='w-full bg-slate-200 flex flex-col md:flex-row justify-between rounded-2xl mb-4'>
  <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 md:mb-0 mt-2 md:mt-7 pl-4'>
  New Sale / نوی خرڅلاو
  </div>
  <div className='text-lg md:text-2xl dark:text-gray-200 font-semibold mb-2 mt-2 md:mt-7 pr-4'>
    Collection: {selectedCollection?.collectionName}
  </div>
</div>



       
        <div className='flex-grow grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Input fields */}

         

          <div className='mb-4'>
            <label
              htmlFor='fuelType'
              className='block dark:text-gray-200 text-sm font-medium  '
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
            <label className='block dark:text-gray-200  font-medium  '>
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
              className='block dark:text-gray-200 text-sm font-medium  '
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
              className='block dark:text-gray-200 text-sm font-medium  '
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

      
          <div className='mb-4' >
          <label className="block  mb-2 text-sm font-bold">Sale Type/خرڅلاو ډول</label>
          <div className="flex space-x-4 border-1 p-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="saleType"
              value="byTon"
              checked={saleType === 'byTon'}
              onChange={(e) => handleSaleTypeChange('saleType', e.target.value)}
              className="mr-2"
            />
            Sale By Ton / خرڅلاو په ټڼ
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="saleType"
              value="byLiter"
              checked={saleType === 'byLiter'}
              onChange={(e) => handleSaleTypeChange('saleType', e.target.value)}
              className="mr-2"
            />
             Sale By Liter / خرڅلاو په لیتر
          </label>
        </div>
          </div>
       




     <div className='mb-4'>
          <div className='flex'>
            <label
         
              className='w-full block dark:text-gray-200 text-sm font-medium  '
            >
              
              Quantity in Tons / مقدار په ټن
            </label>
            <label
         
         className='w-1/3 block dark:text-gray-200 text-sm font-medium  '
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
              placeholder='Quantity in Tons / 
            مقدار په ټن'
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
              className='w-1/3  bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />

            </div>
          </div>

          <div className='mb-4'>
          <div className='flex'>
            <label
              
              className='w-full block dark:text-gray-200 text-sm font-medium  '
            >
              Quantity in Liters / مقدار په لیټرو
            </label>
            <label
              
              className='w-1/3 block dark:text-gray-200 text-sm font-medium  '
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
              placeholder='Quantity in Liters / مقدار په لیټرو'
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
          {saleType==='byTon' &&  <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium  '
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
          </div>}
 


          {saleType==='byLiter' &&  <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium  '
            >
               price per liter in dollars /  فی لیتر قیمت په ډالرو
            </label>
            <input
              type='text'
              name='pricePerLiter'
              value={formData.pricePerLiter}
              onChange={(e) => handleInputChange('pricePerLiter', e.target.value)}
              
              placeholder=' price per liter in dollars /  فی لیتر قیمت په ډالرو'
              className='w-full border  dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>}

          {/* Second input row */}

       
  

          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Total price in dollars / مجمعی قیمت په ډالرو
            </label>
            <input
              type='text'
              name='totalPrice'
              value={totalPrice}
              onChange={(e) => handleInputChange('totalPrice', e.target.value)}
              disabled
              placeholder=' Total price in dollars / مجمعی قیمت په ډالرو'
              className='w-full border bg-slate-400 dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>


          
          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Total Paid /  ټول تادیه
            </label>
            <input
              type='text'
              name='totalPaid'
              placeholder='Total Paid / ټول تادیه'
              onChange={(e) => handleInputChange('totalPaid', e.target.value)}
            
             value={formData.totalPaid}
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4'>
            <label
             
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Remaining /  بقایه
            </label>
            <input
              type='text'
              name='remaining'
              disabled
             value={formData.remaining}
              className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>

          <div className='mb-4' >
          <label className="block  mb-2 text-sm font-bold">Payment Type/تادیه ډول</label>
          <div className="flex space-x-4 border-1 p-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="cash"
              checked={formData.paymentType === 'cash'}
              onChange={(e) => handleInputChange('paymentType', e.target.value)}
              className="mr-2"
            />
            Cash / نقده
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="sarafi"
              checked={formData.paymentType === 'sarafi'}
              onChange={(e) => handleInputChange('paymentType', e.target.value)}
              className="mr-2"
            />
            Sarafi / صرافی
          </label>
        </div>
          </div>
       
      {formData.paymentType==='sarafi' &&   
        <div className='mb-4'>
           
           <label
                 htmlFor='sarafi'
                 className='block dark:text-gray-200 text-sm font-medium  '
               >
                 Sarafi / صرافی
               </label>
             
               <div className='flex'>
               {loading ? (
                 // Show loading indicator while data is being fetched
               <LoadingDropDown/>
               ) : (
                 // Render supplier options once data is fetched
                 <SearchAbleDropDown options={sarafis.map((item) => ({ value: item, label: item.name }))} onSelect={handleSarafiSelect} />
   
               )}
               
                 </div>
               
             </div>
          }



    {formData.paymentType==='sarafi' &&   <div className='mb-4'>
            <label
              htmlFor='personName'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Paid by / د چا لخوا
            </label>
            <input
              type='text'
              id='personName'
              value={formData.personName}
              onChange={(e) => handleInputChange('personName', e.target.value)}
              placeholder=' Paid by / د چا لخوا'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
   }

    {formData.paymentType==='sarafi' && <div className='mb-4'>
            <label className='block dark:text-gray-200  font-medium  '>
             Payment Date /  د تادیه نیټه
            </label>
            <input
              type='date'
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              name=' paymentDate'
              className='w-full  border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>}

          {formData.paymentType==='sarafi' &&   <div className='mb-4'>
            <label
              htmlFor='receiptNumber'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Receipt Number / د رسید شماره
            </label>
            <input
              type='text'
              id='receiptNumber'
              value={formData.receiptNumber}
              onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
              placeholder=' Receipt Number / د رسید شماره'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
   }

{formData.paymentType==='sarafi' &&   <div className='mb-4'>
            <label
              htmlFor='description'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Description / توضیحات
            </label>
            <textarea
             
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='    Description / توضیحات'
              className='w-full border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            />
          </div>
   }


          <div className='mb-4'>
            <div className='flex justify-between'>
            <label
              htmlFor='supplier'
              className='block dark:text-gray-200 text-sm font-medium  '
            >
              Customers / پیرودونکی
            </label>
            {/* <span
                onClick={handleNewCustomerClick}
                className=' text-blue-500 underlinecursor-pointer hover:drop-shadow-2xl'
              >
                New
              </span> */} 
            </div>
           
            <div className='flex'>
            {loading ? (
              // Show loading indicator while data is being fetched
            <LoadingDropDown/>
            ) : (
              // Render supplier options once data is fetched
              <SearchAbleDropDown options={customers.map((item) => ({ value: item, label: item.customerName }))} onSelect={handleSelect} />

            )}
            
              </div>
            
          </div>
          {showCustomerPopup && (
        <CustomerPopup onClose={handleCloseCustomerPopup}  />
      )}
        
              <div className='mb-4'>
                <label
             
                  className='block dark:text-gray-200 text-sm font-medium  '
                >
                 Customer Name / پیرودونکی نوم
              
                </label>
                <input
                  type='text'
                  value={formData.customerName}
                  name='customerName'
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder='Customer Name / پیرودونکی نوم'
                  className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
                  disabled
                />
              </div>
              <div className='mb-4'>
                <label
                  
                  className='block dark:text-gray-200 text-sm font-medium  '
                >
                  Customer Contact / پیرودونکی نمبر
                </label>
                <input
                  type='text'
                  name='contactNumber'
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder='Customer Contact / پیرودونکی نمبر'
                  className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
                  disabled
                />
              </div>
           
              <div className='mb-4'>
                <label
                  
                  className='block dark:text-gray-200 text-sm font-medium  '
                >
                  Customer Balance / پیرودونکی بلانس
                </label>
                <input
                  type='text'
                  name='contactNumber'
                  value={formData.balance}
                 
                  placeholder=' Customer Balance / پیرودونکی بلانس'
                  className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
                  disabled
                />
              </div>
             
        
       
        </div>

        <div className='mb-4'>
                <label
                
                  className='block dark:text-gray-200 text-sm font-medium  '
                >
                  Customer Address / پیرودونکی ادرس
                </label>
                <textarea
                  value={formData.address}
                  name='address'
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder='Customer Address / پیرودونکی ادرس'
                  className='w-full bg-slate-400 border dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
                  disabled
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

export default NewSale;
