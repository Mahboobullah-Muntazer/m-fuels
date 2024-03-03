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

import {  useNavigate } from 'react-router-dom';

import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';

import { RingLoader } from 'react-spinners';
const AvailableCollection = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const navigate = useNavigate(); // Get the navigate function

  const toolbarOptions = ['Search'];

  const [availableCollections, setAvailableCollections] = useState([]);
  const { user } = useAuthContext();

  const [isLoading,setIsLoading]=useState(true)

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
         
          setAvailableCollections(res.data)
            console.log(res.data)
  // Set the fetched user data in the state
      
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

  const handleRowClick = (args) => {
    // Log the row data to the console
    console.log(args.data);
    navigate('/customers/details', { state: { data: args.data } });
  };

  const columns = [
 
    { field: 'collectionName', headerText: 'Collections', width: 100,textAlign: 'left', },
 
    // ... other columns
  ]; 
 
  return (
    <div className='m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl'>
    
      <div className='w-full mb-2 flex justify-end'>
       
      </div>
      {isLoading?(<div className="loader-container">
        <RingLoader color={'#36D7B7'} loading={isLoading} size={50} />
      </div>)
      :(
      <GridComponent
        dataSource={availableCollections}
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
      )}
    </div>
  );
};
export default AvailableCollection;
 