import React, { useState,useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

import { AiOutlineMenu } from 'react-icons/ai';



import { useStateContext } from '../contexts/ContextProvider';

import Suppliers from '../components/suppliers/Suppliers';
import AddSupplier from '../components/suppliers/AddSupplier';
import SupplierDetails from '../components/suppliers/SupplierDetails';
import Customers from '../components/customers/Customers';
import AddCustomer from '../components/customers/AddCustomer';
import CustomerDetails from '../components/customers/CustomerDetails';
import GeneralReport from '../components/reports/GeneralReport';
import SalesReport from '../components/reports/SalesReport';
import PurchasesReport from '../components/reports/PurchasesReport';
import ExpenseReport from '../components/reports/ExpenseReport';



const Reports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generalReport');
  const [reportData, setReportData] = useState();
  const [selectedData,setSelectedData]=useState();
  
  const handleBackToHome=()=>{
  
    setActiveTab("generalReport")

  }
  const handleBackToCustomers=()=>{
  
    setActiveTab("customers")

  }
 
 
  const handleAddSupplier=()=>{
    
    setActiveTab("addSupplier")

  }

  const handleAddCustomer=()=>{
    
    setActiveTab("addCustomer")

  }

 



  const handleUpdateSupplier=(data)=>{
    setSelectedData(data);
   
    setActiveTab("updateSupplier")

  }

  const handleUpdateCustomer=(data)=>{
    setSelectedData(data);
   
    setActiveTab("updateCustomer")

  }


  





  const {  activeMenu, setActiveMenu, setScreenSize, screenSize } = useStateContext();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);


  return (
    <div >
      {isLoading && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <ClipLoader color={'#36D7B7'} loading={isLoading} size={50} />
        </div>
      )}
      <div className='  md:fixed md:top-0 w-full  z-50  border-b-teal-500 border-b-1  bg-white flex p-1  md:flex-nowrap  '>
      <button
        type="button"
        onClick={() => handleActiveMenu()}
       
        className=" text-xl mr-4 w rounded-full p-3 hover:bg-light-gray"
      >
        <span
         
          className=" rounded-full h-2 w-2 right-2 top-2"
        />
        <AiOutlineMenu/>
      </button>

     <div className='space-y-2  flex-wrap md:flex-nowrap'>
     <button
          className={`mr-2 w-28 md:w-40  rounded-tl-lg px-4 py-2 ${
            activeTab === 'generalReport' ? 'bg-blue-500 text-white' : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('generalReport')}
        >
        <div className='flex-col'>
          <h1>General Report</h1>
          <h1 className='hidden md:block'> عمومی ریپورت</h1>
        </div>
        </button>
      

    

        <button
          className={`mr-2 w-28 md:w-40  rounded-tl-lg px-4 py-2 ${
            activeTab === 'salesReport'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('salesReport')}
        >
          
          <div className='flex-col'>
          <h1>Sales Report</h1>
          <h1 className='hidden md:block'>د خرڅلاو ريپورت</h1>
        </div>
        </button>

        <button
          className={`mr-2 w-28 md:w-40  rounded-tl-lg px-4 py-2 ${
            activeTab === 'purchasesReport'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('purchasesReport')}
        >
          
          <div className='flex-col'>
          <h1>Purchases Report</h1>
          <h1 className='hidden md:block'>د خرید ريپورت</h1>
        </div>
        </button>

        <button
          className={`mr-2 w-28 md:w-40  rounded-tl-lg px-4 py-2 ${
            activeTab === 'expensesReport'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('expensesReport')}
        >
          
          <div className='flex-col'>
          <h1>Expenses Report</h1>
          <h1 className='hidden md:block'>د مصارفو ريپورت</h1>
        </div>
        </button>

      

     


     </div>

        
      </div>

      <div>
      {activeTab === 'generalReport' && <GeneralReport  />}

      {activeTab === 'salesReport' && <SalesReport  />}
      {activeTab === 'purchasesReport' && <PurchasesReport  />}

      {activeTab === 'expensesReport' && <ExpenseReport  />}

      </div>
   
      <ToastContainer />
    </div>
  );
};



export default Reports