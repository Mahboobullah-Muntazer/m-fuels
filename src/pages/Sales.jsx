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
import {  useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { FaPlus  } from "react-icons/fa";
import { ClipLoader     } from 'react-spinners';
import LoadingDropDown from '../components/LoadingDropDown';
import Select from 'react-select';

const Sales = () => {

  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const navigate = useNavigate(); // Get the navigate function

  const toolbarOptions = ['Search'];
  const { currentColor } = useStateContext();
  const [isLoading,setIsLoading]=useState(true)

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const { user } = useAuthContext();
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    
    if(selectedCollection!==null && selectedCollection!==undefined && selectedCollection!=='') {
      getAllSales();
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
       
          const sortedData = res.data.sort((a, b) => {
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
 

  const getAllSales = async function () {
    setIsLoading(true)
    const config = {
      headers: {
        'x-auth-token': user.token,
      },
    };
    try {
      const res = await axios.get(
        SERVER_PATH + 'api/actions/getAllSales',
        {
          ...config,
          params: {
            monthYear: selectedCollection,
          },
        }
      );

      if (res.data.status !== 'FAILED') {
        const sortedSales = res.data.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        setSales(sortedSales); // Set the fetched user data in the state
        setLoading(false);
        console.log(res.data);
        setIsLoading(false)
      } else {
        console.log(res);
        setSales(res.data.data)
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
    console.log(selectedValue);
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const { value } = selectedValue;
  
     
      // Update only the specific fields in formData
      setSelectedCollection(value)
    }
  };

  const handleButtonClick = () => {
    // Navigate to the new route and pass selectedCollection as state
    navigate('/sales/new', { state: { selectedCollection } });
  };

  const handleRowClick = (args) => {
    // Log the row data to the console
    console.log(args.data);
    navigate('/sales/details', { state: { data: args.data, selectedCollection } });
  };
 
 
  const columns = [
 
    { field: 'billNumber', headerText: '# بیل', width: 100 ,textAlign: 'Center',},
    { field: 'saleDate', headerText: 'خرڅلاو نیټه', width: 100 ,textAlign: 'Center',},
    { field: 'customer.customerName', headerText: 'پیرودونکی', width: 100,textAlign: 'Center', },
    { field: 'fuelType', headerText: 'تیل ډول', width: 100,textAlign: 'Center',},
    { field: 'quantityInLiters', headerText: 'لیتر', width: 100 ,textAlign: 'Center',},
    { field: 'quantityInTons', headerText: 'ټن', width: 100 ,textAlign: 'Center',},
    { field: 'pricePerTon', headerText: 'فی ټن قیمت', width: 100 ,textAlign: 'Center',},
    { field: 'totalPrice', headerText: 'قیمت مجمعی', width: 100 ,textAlign: 'Center',},
    
    // ... other columns
  ]; 

  return (
    <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
      <Header category='Page' title='Sales/خرڅلاو' />
      <div className='w-full mb-2 flex justify-end'>
       
      {loading ? (
              // Show loading indicator while data is being fetched
            <LoadingDropDown/>
            ) : (
              // Render supplier options once data is fetched
             
              <Select
              
              options={availableCollections.map(item => ({ label: item.collectionName, value: item.collectionName }))}
              value={{ label: selectedCollection, value: selectedCollection }}
              isSearchable
              className='w-full dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
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
          <ClipLoader     color={'#36D7B7'} loading={isLoading} size={50} />
        </div>
      )}
        <GridComponent
        dataSource={sales}
        width='auto'
        allowPaging
        allowSorting
        pageSettings={{ pageCount: 5 , pageSize: 6 }}
        toolbar={toolbarOptions}
        rowHeight={40}
        rowSelected={handleRowClick} // Attach the rowSelected event
      >
        <ColumnsDirective>
          {columns.map((column, index) => (
            <ColumnDirective key={index} {...column} />
          ))}
        </ColumnsDirective>
        <Inject services={[Search, Page, Toolbar]} />
      </GridComponent>
    </div>
  );
};
export default Sales;
