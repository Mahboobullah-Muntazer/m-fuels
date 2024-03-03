import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Header } from '../components';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';

import { ClipLoader  } from 'react-spinners';
import LoadingDropDown from '../components/LoadingDropDown';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../contexts/ContextProvider';

const ExpenseReport = () => {

  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const navigate = useNavigate(); // Get the navigate function


  const { currentColor } = useStateContext();
  const [isLoading,setIsLoading]=useState(true)

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const { user } = useAuthContext();
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [totalPriceSum, setTotalPriceSum] = useState(0);
  const [quantityInLitersSum, setQuantityInLitersSum] = useState(0);
  const [quantityInTonsSum, setQuantityInTonsSum] = useState(0);

  useEffect(() => {
    // Calculate sums whenever expenses data changes
    calculateSums();
  }, [expenses]);

  const calculateSums = () => {
    let totalPriceSum = 0;


    expenses.forEach((expense) => {
      totalPriceSum += expense.amount;
   
    });

    setTotalPriceSum(totalPriceSum);
   
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
          console.log(res.data)
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
 

  const getAllExpenses = async function () {
    setIsLoading(true)
    const config = {
      headers: {
        'x-auth-token': user.token,
      },
    };
    try {
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
        const sortedExpenses = res.data.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
        setExpenses(sortedExpenses); // Set the fetched user data in the state
        setLoading(false);
        console.log(res.data);
        setIsLoading(false)
      } else {
        console.log(res);
        setExpenses(res.data.data)
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


 

 
  
  const handlePrint = () => {
    // Access the table element by its ID or class
    const tableToPrint = document.getElementById('expensesTable');

    // Check if the table exists
    if (tableToPrint) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Inject the table HTML into the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Expenses Report</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
          </head>
          <body>
           
            ${tableToPrint.outerHTML}
          </body>
        </html>
      `);

      // Close the document stream
      printWindow.document.close();

      // Print the new window
    
     
    } else {
      // Table not found, display an error or handle accordingly
      toast.error('Table not found for printing.');
    }
  };

  

  return (
    <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
    <Header category='Page' title='Expenses Report / لګښت ریپورټ' />
    
    <div className='flex items-center justify-between mb-4'>
     
            
    {loading ? (
              // Show loading indicator while data is being fetched
            <LoadingDropDown/>
            ) : (
              // Render supplier options once data is fetched
             
              <Select
              
              options={availableCollections.map(item => ({ label: item.collectionName, value: item.collectionName }))}
              value={{ label: selectedCollection, value: selectedCollection }}
              isSearchable
              className='w-3/4 dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
              onChange={(selectedOption) => handleSelect(selectedOption)}
              getOptionLabel={(option) => option.label} // specify the label for display
              getOptionValue={(option) => option.value} // specify the value for comparison
            />
            
            )}
      <div className='flex flex-col mr-4'>
        <label className='mt-2'></label>
      <button
        className='w-40 h-10 flex justify-center bg-blue-400 dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg border '
        onClick={handlePrint}
      >
         print / پرینت
      </button>
      </div>
    </div>
    {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )} 
       <div>

<div id="expensesTable" className=''>
<div className='flex w-full justify-center bg-slate-300 rounded-sm'>  <h2 className='font-bold text-lg mt-5 mb-5'>Expense Report / لګښت ریپورټ</h2></div>
<table className="min-w-full border border-gray-300">
           <thead>
             <tr>
          
               
           
              
               <th className="py-2 px-4 border-b">مقدار په ډالرو</th>
               <th className="py-2 px-4 border-b">لګښت دلیل</th>
               <th className="py-2 px-4 border-b">شخص نوم</th>
               <th className="py-2 px-4 border-b">خرید نیټه</th>

              
             </tr>
           </thead>
           <tbody>
             {expenses.map((expense,i) => (
               <tr key={i} className={i % 2 === 0 ? 'bg-gray-200' : ''}>
      
                
           
                 <td className="py-2 px-4 border-b text-center">{expense.amount}</td>
                 <td className="py-2 px-4 border-b text-center">{expense.reason}</td>
                 <td className="py-2 px-4 border-b text-center">{expense.personName}</td>
                 <td className="py-2 px-4 border-b text-center">{expense.expenseDate}</td>
               </tr>
             ))}
             <tr className="bg-gray-300">
               
           
               <td className="py-2 px-4 font-bold text-center">{totalPriceSum}</td>
        
               
               <td colSpan="1" className="py-2 px-4 font-bold">مجموعه</td>
               <td colSpan="1"></td>
           
           
               <td colSpan="1"></td>
             </tr>
           </tbody>
         </table>
</div>


         </div>

       <ToastContainer />
    </div>
  );
};

export default ExpenseReport;

