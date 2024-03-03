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

import { ClipLoader  } from 'react-spinners';
const CustomerAccountMain = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const navigate = useNavigate(); // Get the navigate function

  const toolbarOptions = ['Search'];
  const { currentColor } = useStateContext();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const { user } = useAuthContext();

  const [isLoading,setIsLoading]=useState(true)

  useEffect(() => {
    const getAllcustomers = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true)
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAllcustomers',
          config
        );

        if (res.data.status !== 'FAILED') {
          setIsLoading(false)
          const sortedCustomers = res.data.sort((a, b) =>
        a.customerName.localeCompare(b.customerName)
      );

      setCustomers(sortedCustomers);// Set the fetched user data in the state
          setLoading(false);
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

    getAllcustomers();
  }, []);

  const handleRowClick = (args) => {
    // Log the row data to the console
    console.log(args.data);
    navigate('/customerAccountMain/accountDetails', { state: { data: args.data } });
  };

  const columns = [
 
    { field: 'customerName', headerText: 'Name / نوم', width: 100,textAlign: 'Center', },
    { field: 'contactNumber', headerText: 'Contact/شماره', width: 100 ,textAlign: 'Center',},
    { field: 'address', headerText: 'address/ادرس', width: 150,textAlign: 'Center',},
   
    // ... other columns
  ]; 
 
  return (
    <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
      <Header category='Page' title='Customers Account / پیرودونکو حساب' />
      <div className='w-full mb-2 flex justify-end'>
       
      </div>
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
      <GridComponent
        dataSource={customers}
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
export default CustomerAccountMain;
 