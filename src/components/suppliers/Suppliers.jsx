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

import { useStateContext } from '../../contexts/ContextProvider';
import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';
import { IoPersonAddSharp } from "react-icons/io5";
import { ClipLoader  } from 'react-spinners';
const Suppliers = ({handleAddSupplier,handleUpdateSupplier}) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
 
  const toolbar = ['Search', 'ExcelExport'];

  const { currentColor } = useStateContext();
  const [isLoading,setIsLoading]=useState(true)

  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const { user } = useAuthContext();

  
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
    const getAllSuppliers = async function () {
      setIsLoading(true)
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAllSuppliers',
          config
        );

        if (res.data.status !== 'FAILED') {
          setSuppliers(res.data);  // Set the fetched user data in the state
          setLoading(false);
          setIsLoading(false)
        } else {
          console.log(res);
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

    getAllSuppliers();
  }, []);

  const handleRowClick = (args) => {
    // Log the row data to the console
  
    handleUpdateSupplier(args.data)
    
  };


  
  const getColumns = () => {
    return (
      <ColumnsDirective>


        <ColumnDirective
          field='organizationName'
          headerText='Inc / شرکت'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
        <ColumnDirective
          field='authorizedPerson' // Use the correct field name
          headerText='مسول شخص'
          width='200'

          textAlign='Center'
          allowSorting={false}
        />
       

       
      

        <ColumnDirective
          field='contactNumber'
          headerText='Contact/شماره'
          width='200'
          allowSorting={true}
          tooltip={{ enable: true }}
        />

<ColumnDirective
          field='address'
          headerText='ادرس'
          width='200'
          allowSorting={true}
          tooltip={{ enable: true }}
        />


      </ColumnsDirective>
    );
  };
 
 
  return (
    <div className='w-full p-4  md:mt-20 bg-white '>
      <Header category='Page' title='Suppliers/عرضه کوونکي' />
      <div className='w-full mb-2 flex '>
    
        <button
        onClick={()=>handleAddSupplier()}
            style={{ background: currentColor }}
            className='w-32 flex justify-center  dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg'
          >

            <IoPersonAddSharp size={30}/>
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

          dataSource={suppliers}
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
export default Suppliers;
 