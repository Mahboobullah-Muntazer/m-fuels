import React, { useState,useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import Sales from '../components/sales/Sales';
import NewSale from '../components/sales/NewSale';
import { AiOutlineMenu } from 'react-icons/ai';



import { useStateContext } from '../contexts/ContextProvider';
import SaleDetails from '../components/sales/SaleDetails';
import Purchases from '../components/purchases/Purchases';
import NewPurchase from '../components/purchases/NewPurchase';
import PurchaseDetails from '../components/purchases/PurchaseDetails';
import Expenses from '../components/expenses/Expenses';
import NewExpense from '../components/expenses/NewExpense';
import ExpenseDetails from '../components/expenses/ExpenseDetails';
import CustomerAccountMain from '../components/customerAccount/CustomerAccountMain';
import CustomerAccount from '../components/customerAccount/CustomerAccount';
import ViewSarafies from '../components/sarafi/ViewSarafis';
import ViewSarafiAccount from '../components/sarafi/ViewSarafiAccount';
import CashAccount from '../components/cash/CashAccount';



const Business = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  const [reportData, setReportData] = useState();
  const [selectedData,setSelectedData]=useState();
  const [selectedCollection,setSelectedCollection]=useState();

  const handleBackToHome=()=>{
  
    setActiveTab("sales")

  }
  const handleBackToPurchaseHome=()=>{
  
    setActiveTab("purchases")

  }
  const handleBackToExpenseHome=()=>{
  
    setActiveTab("expenses")

  }
  const handleNewSale=(data)=>{
    setSelectedData(data);
    setActiveTab("newSale")

  }

  const handleNewPurchase=(data)=>{
    setSelectedData(data);
    setActiveTab("newPurchase")

  }
  const handleNewExpense=(data)=>{
    setSelectedData(data);
    setActiveTab("newExpense")

  }

  const handleViewAccount=(data)=>{
    setSelectedData(data)
    setActiveTab("viewAccount")
  }

  const handleUpdateSale=(data,colection)=>{
    setSelectedData(data);
    setSelectedCollection(colection)
    setActiveTab("updateSale")

  }

  const handleUpdatePurchase=(data,colection)=>{
    setSelectedData(data);
    setSelectedCollection(colection)
    setActiveTab("updatePurchase")

  }

  
  const handleUpdateExpense=(data,colection)=>{
    setSelectedData(data);
    setSelectedCollection(colection)
    setActiveTab("updateExpense")

  }

  const handleBackToSarafis=()=>{
  
    setActiveTab("sarafi")

  }

  const handleViewSarafi=(data)=>{
    setSelectedData(data);
    
    setActiveTab("viewSarafiAccount")

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
    <div  >
      {isLoading && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <ClipLoader color={'#36D7B7'} loading={isLoading} size={50} />
        </div>
      )}
      <div className='  md:fixed md:top-0 w-full  z-50 bg-white  border-b-teal-500 border-b-1 flex p-1   md:flex-nowrap  '>
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
          className={`mr-2 w-28  rounded-tl-lg px-4 py-2 ${
            activeTab === 'sales' ? 'bg-blue-500 text-white' : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('sales')}
        >
        <div className='flex-col'>
          <h1>Sales</h1>
          <h1 className='hidden md:block'>خرڅلاو</h1>
        </div>
        </button>
        <button
          className={`mr-2 w-28 rounded-tl-lg px-4 py-2 ${
            activeTab === 'newSale' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>New Sale</h1>
          <h1 className='hidden md:block'>نوی خرڅلاو</h1>
        </div>
        </button>

        <button
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'updateSale' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Update Sale</h1>
          <h1 className='hidden md:block'>  د خرڅلاو تغیر</h1>
        </div>
        </button>

        <button
          className={`mr-2 w-28  rounded-tl-lg px-4 py-2 ${
            activeTab === 'purchases'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('purchases')}
        >
          
          <div className='flex-col'>
          <h1>Purchases</h1>
          <h1 className='hidden md:block'>خرید</h1>
        </div>
        </button>

        <button
          className={`mr-2  rounded-tl-lg px-4 py-2 ${
            activeTab === 'newPurchase' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>New Purchase</h1>
          <h1 className='hidden md:block'>نوی خرید</h1>
        </div>
        </button>

        <button
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'updatePurchase' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Update Purchase</h1>
          <h1 className='hidden md:block'>  د خرید تغیر</h1>
        </div>
        </button>


        <button
          className={`px-4 w-28  mr-2  rounded-tl-lg py-2 ${
            activeTab === 'expenses'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          
          <div className='flex-col'>
          <h1>Expenses</h1>
          <h1 className='hidden md:block'>لګښتونه</h1>
        </div>
        </button>



        <button
          className={`mr-2  rounded-tl-lg px-4 py-2 ${
            activeTab === 'newExpense' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>New Expense</h1>
          <h1 className='hidden md:block'> نوی لګښت</h1>
        </div>
        </button>

        <button
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'updateExpense' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Update Expense</h1>
          <h1 className='hidden md:block'>  د لګښت تغیر</h1>
        </div>
        </button>

        <button
          className={`px-4 w-28  mr-2  rounded-tl-lg py-2 ${
            activeTab === 'account'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('account')}
        >
          
          <div className='flex-col'>
          <h1>Accounts</h1>
          <h1 className='hidden md:block'>حسابونه</h1>
        </div>
        </button>


        
        <button
          className={`mr-2  rounded-tl-lg px-4 py-2 ${
            activeTab === 'viewAccount' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1>Customer Account</h1>
          <h1 className='hidden md:block'>  دپیرودونکی حساب</h1>
        </div>
        </button>

        <button
          className={`mr-2   rounded-tl-lg px-4 py-2 ${
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
          className={`mr-2 rounded-tl-lg px-4 py-2 ${
            activeTab === 'viewSarafiAccount' ? 'bg-blue-500 text-white' : 'bg-blue-100 hidden'
          }`}
         
        >
        <div className='flex-col'>
          <h1> Sarafi Account</h1>
          <h1 className='hidden md:block'>  د صرافی کهاته</h1>
        </div>
        </button>

        <button
          className={`mr-2  w-20  rounded-tl-lg px-4 py-2 ${
            activeTab === 'cash'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100'
          }`}
          onClick={() => setActiveTab('cash')}
        >
          
          <div className='flex-col'>
          <h1>Cash</h1>
          <h1 className='hidden md:block'>نقده</h1>
        </div>
        </button>
     </div>



  
    
        
      </div>

      <div  >
      {activeTab === 'sales' && <Sales  handleNewSale={handleNewSale} handleUpdateSale={handleUpdateSale} />}

{activeTab === 'newSale' && (
    <NewSale handleBackToHome={handleBackToHome}  selectedCollection={selectedData} />
  )}

{activeTab === 'updateSale' && (
    <SaleDetails  handleBackToHome={handleBackToHome}  saleData={selectedData} selectedCollection={selectedCollection} />
  )}


{activeTab === 'purchases' && <Purchases handleNewPurchase={handleNewPurchase}   handleUpdatePurchase={handleUpdatePurchase}  />}


{activeTab === 'newPurchase' && (
    <NewPurchase handleBackToPurchaseHome={handleBackToPurchaseHome}  selectedCollection={selectedData} />
  )}

{activeTab === 'updatePurchase' && (
    <PurchaseDetails  handleBackToPurchaseHome={handleBackToPurchaseHome} purchaseData={selectedData} selectedCollection={selectedCollection} />
  )}


{activeTab === 'expenses' && <Expenses handleNewExpense={handleNewExpense}   handleUpdateExpense={handleUpdateExpense}  />}


{activeTab === 'newExpense' && (
    <NewExpense handleBackToExpenseHome={handleBackToExpenseHome}  selectedCollection={selectedData} />
  )}

{activeTab === 'updateExpense' && (
    <ExpenseDetails  handleBackToExpenseHome={handleBackToExpenseHome} expenseData={selectedData} selectedCollection={selectedCollection} />
  )}


{activeTab === 'account' && <CustomerAccountMain handleViewAccount={handleViewAccount}   />}


{activeTab === 'viewAccount' && (
    <CustomerAccount   accountData={selectedData} />
  )}

{activeTab === 'sarafi' && <ViewSarafies handleViewSarafi={handleViewSarafi} />}


{activeTab === 'viewSarafiAccount' && (
    <ViewSarafiAccount  handleBackToSarafis={handleBackToSarafis}  sarafiData={selectedData}/>
  )}



{activeTab === 'cash' && (
    <CashAccount/>
  )}
      </div>
   
      <ToastContainer />
    </div>
  );
};



export default Business