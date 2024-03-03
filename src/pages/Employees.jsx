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
import { NavLink, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { IoPersonAddSharp } from "react-icons/io5";
import { ClipLoader  } from 'react-spinners';
const Employees = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const navigate = useNavigate(); // Get the navigate function

  const toolbarOptions = ['Search'];
  const { currentColor } = useStateContext();

  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const { user } = useAuthContext();
  const [isLoading,setIsLoading]=useState(true)

  useEffect(() => {
    const getAllEmployees = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true)
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAllEmployees',
          config
        );

        console.log(res);
        if (res.data.status !== 'FAILED') {
          setIsLoading(false)
          setSuppliers(res.data);  // Set the fetched user data in the state
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

    getAllEmployees();
  }, []);


  const handleRowClick = (args) => {
    // Log the row data to the console
    console.log(args.data);
    navigate('/employees/details', { state: { data: args.data } });
  };

  const columns = [
 
    { field: 'name', headerText: 'Name/نوم', width: 100,textAlign: 'Center', },
    { field: 'NIC', headerText: 'NIC/تذکره', width: 100,textAlign: 'Center',},
    { field: 'contactNumber', headerText: 'cell/تلفون', width: 100 ,textAlign: 'Center',},
    { field: 'position', headerText: 'Position/پوزیشن', width: 120 ,textAlign: 'Center',},
    { field: 'joinDate', headerText: 'Join Date/استخدام نیټه', width: 130 ,textAlign: 'Center',},
    { field: 'salary', headerText: 'Salary/معاش', width: 100 ,textAlign: 'Center',},
    { field: 'isActive', headerText: 'Is Active/فعال', width: 100 ,textAlign: 'Center',},
    
    // ... other columns
  ];

  return (
    <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
      <Header category='Page' title='Employee/کارمند' />
      <div className='w-full mb-2 flex justify-end'>
        <NavLink to={`/employees/add`}>
          <button
            style={{ background: currentColor }}
            className='w-32 flex justify-center  dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg'
          >
            <IoPersonAddSharp size={30}/>
          </button>
        </NavLink>
      </div>
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
       <GridComponent
        dataSource={suppliers}
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
export default Employees;
