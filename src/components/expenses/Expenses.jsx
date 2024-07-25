import React, { useEffect, useState } from 'react';
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

import { Header } from '..';
import {  useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';
import { FaPlus  } from "react-icons/fa";
import { ClipLoader  } from 'react-spinners';
import LoadingDropDown from '../LoadingDropDown';
import Select from 'react-select';
import { toast } from 'react-toastify';

const Expenses = ({handleNewExpense,handleUpdateExpense}) => {

  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
 
  const toolbar = ['Search', 'ExcelExport'];
  const { currentColor } = useStateContext(); 
  const [isLoading,setIsLoading]=useState(true)

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const { user } = useAuthContext();

  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(''
  );



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
    // Apply alternate row color
    
    if (args.row && args.row.index % 2 !== 0) {
      args.row.style.background = '#f5f5f5';
    }
  
    // Check if createdAt and updatedAt are not equal

  };



  useEffect(() => {
    
    if(selectedCollection!==null && selectedCollection!==undefined && selectedCollection!=='') {
      getAllExpenses();
    }
  }, [selectedCollection]);

  useEffect(() => {
    const getAvailableCollections = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true)
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAvailableCollections',
          config
        );

        if (res.data.status !== 'FAILED') {
          setIsLoading(false)
       
          const sortedData = res.data.data.sort((a, b) => {
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
  // Set the fetched user data in the state
  setLoading(false)
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

    getAvailableCollections();
  }, []);

  useEffect(()=>{
    if(selectedCollection==='' || selectedCollection===undefined)
    {
      setSelectedCollection(availableCollections[0]?.collectionName);
    }
   
  },[availableCollections])

  const getAllExpenses = async function () {
    const config = {
      headers: {
        'x-auth-token': user.token,
      },
    };
    try {
      setIsLoading(true)
   
      const res = await axios.get(
        SERVER_PATH + 'api/actions/getAllExpenses',
        {
          ...config,
          params: {
            monthYear: selectedCollection,
          },
        }
      );

      if (res.data.status !== 'FAILED') {
        setExpenses(res.data.data);  // Set the fetched user data in the state
        setLoading(false);
        console.log(res.data.data);
        setIsLoading(false)
      } else {
        console.log(res);
        setExpenses(res.data.data); 
        setIsLoading(false)
   
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
      const { value } = selectedValue;
  
     
      // Update only the specific fields in formData
      setSelectedCollection(value)
    }
  };

  const handleButtonClick = () => {
    // Navigate to the new route and pass selectedCollection as state
    if(!selectedCollection._id)
      {
        toast.warning("لطفا لومړی میاشت انتخاب کړی")
        return
      }
    handleNewExpense(selectedCollection)
  };

  const handleRowClick = (args) => {
    // Log the row data to the console
    handleUpdateExpense(args.data,selectedCollection)
  };

 
  

  const getColumns = () => {
    return (
      <ColumnsDirective>
     
      
         <ColumnDirective
          field='expense.personName'
         headerText=  'شخص نوم'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
           <ColumnDirective
        field='expense.expenseDate' // Use the correct field name
        headerText=  'نیټه'
        width='200'
       
        textAlign='Center'
        allowSorting={false}
      />
        <ColumnDirective
          field='expense.amount'
          headerText='مقدار په ډالرو'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
        <ColumnDirective
          field='expense.reason'
          headerText='لګښت دلیل'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />

   

      </ColumnsDirective>
    );
  };

  return (
    <div className='w-full p-4  md:mt-20 bg-white '>
      <Header category='Page' title='expenses / لګښت' />
      <div className='w-full mb-2 flex justify-end'>
      {loading ? (
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
            
            )}
        
<button
            onClick={handleButtonClick} // Handle button click
            style={{ background: currentColor }}
            className='w-32 h-11 mt-2 flex justify-center  dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg'
          >
            <FaPlus size={30} />
          </button>
        
      </div>
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
       <div className='max-w-screen-lg mt-10'>
 <GridComponent
          id='Grid'
          
          dataSource={expenses}
          excelExportComplete={excelExportComplete}
          allowExcelExport={true}
          toolbar={toolbar}
          width='100%'
          
          toolbarClick={toolbarClick}
         
          allowResizing={true} // Enable column resizing
          frozenRows={0} // Freeze the header row
          height='auto'
          rowHeight={60}
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
  );
};
export default Expenses;
