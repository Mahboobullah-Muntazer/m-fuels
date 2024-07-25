import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

import {
  ColumnDirective,
  ColumnsDirective,
  ExcelExport,
  GridComponent,
  Inject, 
  Page,
  Search,
  Sort,
  Toolbar,
} from '@syncfusion/ej2-react-grids';

import { FaPlus } from 'react-icons/fa';
import DebitOrCreditPopup from '../DebitOrCreditPopup';
import useAxiosGet from '../../hooks/useAxiosGet';
import { useAuthContext } from '../../hooks/useAuthContext';
import useAxiosPost from '../../hooks/useAxiosPost';

import UpdateDebitOrCreditPopup from '../UpdateDebitOrCreditPopup';
const ViewSarafiAccount = ({ sarafiData }) => {
    const sarafi_id = sarafiData?._id;
  const [isLoading, setIsLoading] = useState(false);

  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const toolbar = ['Search', 'ExcelExport'];
  const [viewDetails, setViewDetails] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [transactions,setTransactions]=useState('');
  const [sarafi,setSarafi]=useState('')
  const [rowData,setRowData]=useState('')
  
  const { user } = useAuthContext();

  const {
    response: getCollectionResponse,
    isLoading: getCollectionLoading,
    sendRequest:getCollectionRequest,
  } = useAxiosGet();


  const {
    response: getSarafiResponse,
    isLoading: getSarafiLoading,
    sendRequest:getSarafiRequest,
  } = useAxiosGet();

  const {
    response: getTransactionsResponse,
    isLoading: getTransactionsLoading,
    sendRequest:getTransactionsRequest,
  } = useAxiosGet();


  const {
    response:paymentResponse,
    error:paymentError,
    isLoading: paymentLoading,
    sendRequest:paymentRequest,
  } = useAxiosPost();

  useEffect(() => {
    handleFetchCollection();
    handleFetchSarafi();
  }, []);



  const handleFetchCollection=async()=>{

   

    const getCollection = `${SERVER_PATH}api/actions/getAvailableCollections`;

    try {
      await getCollectionRequest(getCollection);
    } catch (error) {
      toast.error(error.message, { position: 'top-right' });
    }


  }

  const handleFetchSarafi=async()=>{

   

    const getSarafi = `${SERVER_PATH}api/actions/getSarafiById/${sarafi_id}`;

    try {
      await getSarafiRequest(getSarafi);
    } catch (error) {
      toast.error(error.message, { position: 'top-right' });
    }


  }

 
  const handleTransactionFetch=async()=>{

   

    const getTransaction = `${SERVER_PATH}api/actions/getTransactionBySarafiIdAndMonthYear/${sarafi_id}`;

    try {
      await getTransactionsRequest(getTransaction);
    } catch (error) {
      toast.error(error.message, { position: 'top-right' });
    }


  }

  useEffect(() => {
    
    if (getCollectionResponse) {
        
        const sortedData = getCollectionResponse.sort((a, b) => {
            // Extract month and year from collectionName
            const [aMonth, aYear] = a.collectionName.split('-');
            const [bMonth, bYear] = b.collectionName.split('-');
  
            // Compare years first
            if (aYear !== bYear) {
              return bYear - aYear; // Sort by year in descending order
            }
  
            // If years are equal, compare months
            return bMonth - aMonth; // Sort by month in descending order
          });
  
          // Set the sorted data in the state
          setAvailableCollections(sortedData);
    }
  }, [getCollectionResponse]);
  


  useEffect(() => {
    setIsLoading(getCollectionLoading);
  }, [getCollectionLoading]);


  useEffect(() => {
    
    if (getSarafiResponse) {
        
          setSarafi(getSarafiResponse);
          console.log("sarafi",getSarafiResponse)
    }
  }, [getSarafiResponse]);
  


  useEffect(() => {
    setIsLoading(getSarafiLoading);
  }, [getSarafiLoading]);



  useEffect(() => {
    
    if (getTransactionsResponse) {
        
          setTransactions(getTransactionsResponse)
          console.log("transactions",getTransactionsResponse)
    }
  }, [getTransactionsResponse]);
  


  useEffect(() => {
    setIsLoading(getTransactionsLoading);
  }, [getTransactionsLoading]);


  useEffect(() => {
    if (paymentResponse) {
      if (paymentResponse.status === 'FAILED') {
        toast.error(paymentResponse.message, {
          position: 'top-right',
        });
      } else {
        handleFetchSarafi();
        toast.success(paymentResponse.message, {
          position: 'top-right',
        });
      }
    }
  }, [paymentResponse]);

  useEffect(() => {
    setIsLoading(paymentLoading);
  }, [paymentLoading]);

 

  


  let grid;

  const toolbarClick = (args) => {
    if (grid && args.item.id === 'Grid_excelexport') {
      grid.showSpinner();
      grid.excelExport();
    }
  };

  const excelExportComplete = () => {
    grid.hideSpinner();
  };

  const rowRendering = (args) => {
    if (args.row && args.row.index % 2 !== 0) {
      args.row.style.background = '#f5f5f5';
    }
  };

  const handleRowClick = (args) => {
    // Log the row data to the console
    // handleViewAccount(args.data)

    if(args.data.transactionType==='payment')
      {
        toast.warning('لطفا د خرڅلاو څخه نوموړی ریکارډ تغیر کړه')
        return;
      }
    setRowData(args.data)
    setShowUpdatePopup(true)
  };

  const getColumns = () => {
    return (
      <ColumnsDirective>
        <ColumnDirective
          field='date'
          headerText='تاریخ'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
      
        <ColumnDirective
          field='paidAmount' // Use the correct field name
          headerText='تادیه شوی پیسی'
          width='200'
          textAlign='Center'
          allowSorting={false}
        />
     
        

<ColumnDirective
          field='transactionType'
          headerText='معامله ډول'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
        <ColumnDirective
          field='customer.customerName'
          headerText='پیرودونکی'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
        <ColumnDirective
          field='customer.contactNumber'
          headerText=' پیرودونکی شماره'
          width='150'
          allowSorting={true}
          tooltip={{ enable: true }}
        />



      </ColumnsDirective>
    );
  };



  const handleSelect = (selectedValue) => {
    
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const { value } = selectedValue;
  
     
      // Update only the specific fields in formData
      setSelectedCollection(value)
    }
  };


  

  return (
    <div className="bg-white md:mt-20 w-full mx-auto">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <ClipLoader color={'#36D7B7'} loading={isLoading} size={50} />
        </div>
      )}

      <div className="shadow-sm shadow-teal-500 p-4 bg-white">
        <div className="text-xl font-bold mb-4 mt-5 flex justify-between">
          <h1>Sarafi Account  /   صرافی حساب</h1>
        
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 border border-teal-500 p-4">
          <div className="p-4 bg-green-200 rounded-lg shadow">
            <div className="text-gray-600">Sarafi Name</div>
            <div className="text-xl font-semibold">{sarafi?.name}</div>
          </div>
          <div className="p-4 bg-blue-200 rounded-lg shadow">
            <div className="text-gray-600">Mobile Number</div>
            <div className="text-xl font-semibold">{sarafi?.contactNumber}</div>
          </div>
          <div className="p-4 bg-red-200 rounded-lg shadow">
            <div className="text-gray-600">Address</div>
            <div className="text-xl font-semibold">{sarafi?.address}</div>
          </div>
          <div className={`p-4 ${sarafi?.balance >= 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-lg shadow md:col-span-4`}>
            <div className="text-white text-xl font-semibold tracking-wider">Balance</div>
            <div className="text-white"><strong>{sarafi?.balance}</strong></div>
          </div>
        </div>

      <div className='w-full flex justify-end'>
      <h1 className='pr-5  underline text-blue-800 text-2xl font-semibold hover:cursor-pointer hover:text-teal-500'
          onClick={() => { setViewDetails(!viewDetails) }}>
          {viewDetails ? 'Hide Details' : 'View Details'}
        </h1>
      </div>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ${viewDetails ? 'opacity-100' : 'max-h-0 opacity-0'}`}>
        {viewDetails &&
          <div className='shadow-sm mt-10 shadow-teal-500 p-4 bg-white'>
            <div className='text-2xl font-semibold'> Transactions </div>
              <div className='w-full max-w-screen-lg mb-2 flex justify-end'>
       
       {/* {isLoading ? (
               // Show loading indicator while data is being fetched
             <LoadingDropDown/>
             ) : (
               // Render supplier options once data is fetched
              
               <Select
               
               options={availableCollections.map(item => ({ label: item.collectionName, value: item }))}
               value={{ label: selectedCollection?.collectionName, value: selectedCollection }}
               isSearchable
              className='w-full dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md pr-3 py-2 mt-1'
               onChange={(selectedOption) => handleSelect(selectedOption)}
               getOptionLabel={(option) => option.label} // specify the label for display
               getOptionValue={(option) => option.value} // specify the value for comparison
             />
             
             )} */}
 
 <button
              onClick={handleTransactionFetch} // Handle button click
           
             className='w-40 h-11 mt-2 flex bg-blue-800 justify-center  dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg'
           > 
             Fetch / راوړل
           </button>
       </div>
            <div className='max-w-screen-lg h-auto'>
              <GridComponent
                id='Grid'
                 dataSource={transactions}
                excelExportComplete={excelExportComplete}
                allowExcelExport={true}
                toolbar={toolbar}
                width='100%'
                toolbarClick={toolbarClick}
                allowResizing={true} // Enable column resizing
                frozenRows={0} // Freeze the header row
                height={600}
                rowHeight={70}
                allowSorting={true}
                rowRendering={rowRendering}
                rowSelected={handleRowClick}
                ref={(g) => (grid = g)}
              >
                {getColumns()}
                <Inject services={[Search, Page, Toolbar, ExcelExport, Sort]} />
              </GridComponent>
            </div>
          </div>
        }



      </div>
    
      <ToastContainer />
    </div>
  );
};


export default ViewSarafiAccount