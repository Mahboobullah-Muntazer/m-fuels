import React, { useEffect, useState } from 'react';
import {
  GridComponent,
  Inject,
  ColumnsDirective,
  ColumnDirective,
  Search,
  Page,
  Toolbar,

} from '@syncfusion/ej2-react-grids';

import { Header } from '../components';
import {  useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';

import { ClipLoader  } from 'react-spinners';
import { FaPlus } from 'react-icons/fa';
import DebitOrCreditPopup from '../components/DebitOrCreditPopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateDebitOrCreditPopup from '../components/UpdateDebitOrCreditPopup';
const CustomerAccount = () => {
    const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
    // Get the navigate function
    const location=useLocation();
    const customer_id = location.state?.data._id;
    const customer_name=location.state?.data.customerName;
    const customer_mobile=location.state?.data.contactNumber
    const toolbarOptions = ['Search'];
    const { currentColor } = useStateContext();
  
  
    const { user } = useAuthContext();
    const [customerPayments, setCustomerPayments] = useState([]);
   
    const [isLoading,setIsLoading]=useState(true)

    const [showPopup, setShowPopup] = useState(false);

    const [showUpdatePopup,setShowUpdatePopup] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState(null);

    const handleAddButtonClick = () => {
      setShowPopup(true);
    };
  
    const handlePopupSave = async (formData) => {
      // Add logic to save the data
      console.log('Saving data:', formData);
  
      const { 
        
        amount,
        date,
        reason,
        type,
    
      } =
     formData;
 
   const config = {
     headers: {
       'Content-Type': 'application/json',
       'x-auth-token': user.token,
     },
   };
 
   const body = JSON.stringify({
    customer_id,
    amount,
    paymentDate:date,
    reason,
    type,
   });
 
   try {
     
     setIsLoading(true)
     const res = await axios.post(
       SERVER_PATH + 'api/actions/updateAccount',
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
       getCustomerPaymentRecord();
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
   }
      // Close the popup after saving
      setShowPopup(false);
    };
  
    const handlePopupCancel = () => {
      // Close the popup without saving
      setShowPopup(false);
      setShowUpdatePopup(false)
      getCustomerPaymentRecord()
    };
     
    const getCustomerPaymentRecord = async function () {
          
      const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': user.token,
          },
        };
    try {
      setIsLoading(true)
      const res = await axios.get(
          `${SERVER_PATH}api/actions/getCustomerPaymentRecord/${customer_id}`,
          config
      );

      if (res && res.data && res.data.status !== 'FAILED') {
        setIsLoading(false);
        const formattedPayments = res.data[0].payments
        .map((payment) => ({
          ...payment,
          paymentDate: new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(new Date(payment.paymentDate)),
        }))
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      setCustomerPayments(formattedPayments);
      } else {
        setIsLoading(false)
        console.log(res);
      }
    } catch (err) {
      setIsLoading(false)
      
      if (err) {
        console.log('error' + err);
      }
    }
  }; 
    useEffect(() => {
     
     if(customer_id)
     {
     
      
      getCustomerPaymentRecord();
     }
  
    }, [customer_id]);
  
    const handleRowClick = (args) => {
      // Log the row data to the console
      setSelectedRowData(args.data);
      setShowUpdatePopup(true)
      console.log(args.data);
     // navigate('/customers/details', { state: { data: args.data } });
    };
  
    const columns = [
   
      { field: 'billNumber', headerText: 'بیل #', width: 100,textAlign: 'Center', },
      { field: 'paymentDate', headerText: 'نیټه', width: 100 ,textAlign: 'Center',},
      { field: 'amount', headerText: 'مقدار', width: 150,textAlign: 'Center',},
      { field: 'type', headerText: 'ډول', width: 150,textAlign: 'Center',},
      // ... other columns
    ]; 
   // Define aggregates for the credit and debit columns
   const [debitTotal, setDebitTotal] = useState(0);
   const [creditTotal, setCreditTotal] = useState(0);
   const [remaining,setRemaining] = useState(0);
   useEffect(() => {


    
     if (customerPayments.length > 0) {
       const debitSum = customerPayments
         .filter((payment) => payment.type === 'debit')
         .reduce((sum, payment) => sum + payment.amount, 0);
 
       const creditSum = customerPayments
         .filter((payment) => payment.type === 'credit')
         .reduce((sum, payment) => sum + payment.amount, 0);
 
       setDebitTotal(debitSum);
       setCreditTotal(creditSum);
       const rem=debitSum-creditSum;
       setRemaining(rem);
     }
   }, [customerPayments]);

  
   const handleUpdate = async (updatedData) => {
    // Implement the logic to update the record using the updatedData
    // You can use the record's unique identifier (e.g., _id) to identify the record
    // Update the customerPayments state after updating the record
  };

  const handleDelete = async () => {

      console.log('delete is called')
    // Implement the logic to delete the record
    // You can use the record's unique identifier (e.g., _id) to identify the record
    // Update the customerPayments state after deleting the record
  };


  return (
    <div className='m-2 md:m-10 mt-10 p-2 md:p-10 bg-white rounded-3xl'>


<Header category='Account / حساب' title={''+customer_name+'-'+customer_mobile} />
    

<button
onClick={handleAddButtonClick}
            style={{ background: currentColor }}
            className='w-32 mb-4 flex justify-center  dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg'
          >
            <FaPlus  size={30}/>
          </button>
          {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
          <>
        <GridComponent
            dataSource={customerPayments}
            width='auto'
            allowPaging
            allowSorting
            pageSettings={{ pageCount: 5, pageSize: 6 }}
            toolbar={toolbarOptions}
            rowHeight={40}
            rowSelected={handleRowClick}
          >
            <ColumnsDirective>
              {columns.map((column, index) => (
                <ColumnDirective key={index} {...column} />
              ))}
            </ColumnsDirective>
            <Inject services={[Search, Page, Toolbar]} />
          </GridComponent>
          <div className='flex flex-col gap-3 border p-3'>
  <div className='flex gap-5'>
    <div className='font-semibold w-56 border-r pr-3'>Total Debit / مجموعه پور</div>
    <div className='font-semibold'> : {debitTotal}</div>
  </div>

  <div className='flex gap-5'>
    <div className='font-semibold w-56 border-r pr-3'>Total Credit / مجموعه وصول</div>
    <div className='font-semibold'> : {creditTotal}</div>
  </div>

  <div className='flex gap-5'>
    <div className='font-semibold w-56 border-r pr-3'>Remaining / باقی</div>
    <div className='font-semibold'> : {remaining}</div>
  </div>
</div>
     </>

{showUpdatePopup && (
        <UpdateDebitOrCreditPopup
          onSave={handlePopupSave}
          onCancel={handlePopupCancel}
          selectedRowData={selectedRowData}
          customer_id={customer_id}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

{showPopup && (
        <DebitOrCreditPopup onSave={handlePopupSave} onCancel={handlePopupCancel} />
      )}
       <ToastContainer />
    </div>
  );
};
export default CustomerAccount;