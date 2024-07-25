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
import SarafiMain from '../components/sarafi/SarafiMain';
import AddSarafi from '../components/sarafi/AddSarafi';
import SarafiDetails from '../components/sarafi/SarafiDetails';



const Managements = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suppliers');
  const [reportData, setReportData] = useState();
  const [selectedData,setSelectedData]=useState();
  const [selectedCollection,setSelectedCollection]=useState();

  const handleBackToHome=()=>{
  
    setActiveTab("suppliers")

  }
  const handleBackToCustomers=()=>{
  
    setActiveTab("customers")

  }
 

  const handleBackToSarafis=()=>{
  
    setActiveTab("sarafi")

  }
 
 
  const handleAddSupplier=()=>{
    
    setActiveTab("addSupplier")

  }

  const handleAddCustomer=()=>{
    
    setActiveTab("addCustomer")

  }

  const handleAddSarafi=()=>{
    
    setActiveTab("addSarafi")

  }

 



  const handleUpdateSupplier=(data)=>{
    setSelectedData(data);
   
    setActiveTab("updateSupplier")

  }

  const handleUpdateCustomer=(data)=>{
    setSelectedData(data);
   
    setActiveTab("updateCustomer")

  }


  const handleUpdateSarafi=(data)=>{
    
    setSelectedData(data);
   
    setActiveTab("updateSarafi")

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
            activeTab === 'suppliers' ? 'bg-blue-500 text-white' : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('suppliers')}
        >
        <div className='flex-col'>
          <h1>Suppliers</h1>
          <h1 className='hidden md:block'>عرضه کوونکی</h1>
        </div>
        </button>
        <button
          className={`mr-2 w-28 md:w-40 rounded-tl-lg px-4 py-2 ${
            activeTab === 'addSupplier' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Add Supplier</h1>
          <h1 className='hidden md:block'> نوی عرضه کوونکی</h1>
        </div>
        </button>

        <button
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'updateSupplier' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Update Supplier</h1>
          <h1 className='hidden md:block'> د عرضه کوونکی تغیر </h1>
        </div>
        </button>

        <button
          className={`mr-2 w-28 md:w-40  rounded-tl-lg px-4 py-2 ${
            activeTab === 'customers'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('customers')}
        >
          
          <div className='flex-col'>
          <h1>Customers</h1>
          <h1 className='hidden md:block'>پیرودونکی</h1>
        </div>
        </button>

        <button
          className={`mr-2  rounded-tl-lg px-4 py-2 ${
            activeTab === 'addCustomer' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Add Customer</h1>
          <h1 className='hidden md:block'>نوی پیرودونکی</h1>
        </div>
        </button>

        <button
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'updateCustomer' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Update Customer</h1>
          <h1 className='hidden md:block'>  د پیرودونکی تغیر</h1>
        </div>
        </button>


        <button
          className={`mr-2 w-28 md:w-40  rounded-tl-lg px-4 py-2 ${
            activeTab === 'sarafi'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('sarafi')}
        >
          
          <div className='flex-col'>
          <h1>Sarafi</h1>
          <h1 className='hidden md:block'>صرافی</h1>
        </div>
        </button>


        <button
          className={`mr-2  rounded-tl-lg px-4 py-2 ${
            activeTab === 'addSarafi' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Add Sarafi</h1>
          <h1 className='hidden md:block'>نوی صرافی</h1>
        </div>
        </button>


        <button
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'updateSarafi' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Update Sarafi</h1>
          <h1 className='hidden md:block'>  د صرافی تغیر</h1>
        </div>
        </button>

     </div>

        
      </div>

      <div >
      {activeTab === 'suppliers' && <Suppliers handleAddSupplier={handleAddSupplier} handleUpdateSupplier={handleUpdateSupplier}  />}

{activeTab === 'addSupplier' && (
    <AddSupplier handleBackToHome={handleBackToHome}  />
  )}

{activeTab === 'updateSupplier' && (
    <SupplierDetails  handleBackToHome={handleBackToHome}  supplierData={selectedData}/>
  )}

{activeTab === 'customers' && <Customers handleAddCustomer={handleAddCustomer} handleUpdateCustomer={handleUpdateCustomer}  />}

 
{activeTab === 'addCustomer' && (
    <AddCustomer handleBackToCustomers={handleBackToCustomers}  />
  )}

{activeTab === 'updateCustomer' && (
    <CustomerDetails  handleBackToCustomers={handleBackToCustomers}  customerData={selectedData}/>
  )}

{activeTab === 'sarafi' && <SarafiMain handleAddSarafi={handleAddSarafi} handleUpdateSarafi={handleUpdateSarafi}  />}

{activeTab === 'addSarafi' && (
    <AddSarafi handleBackToSarafis={handleBackToSarafis}  />
  )}

{activeTab === 'updateSarafi' && (
    <SarafiDetails  handleBackToSarafis={handleBackToSarafis}  sarafiData={selectedData}/>
  )}
      </div>
   
      <ToastContainer />
    </div>
  );
};



export default Managements