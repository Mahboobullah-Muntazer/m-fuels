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

import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';

import { ClipLoader  } from 'react-spinners';
const CustomerAccountMain = ({handleViewAccount}) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
 
  const toolbar = ['Search', 'ExcelExport'];


  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const { user } = useAuthContext();

  const [isLoading,setIsLoading]=useState(true)



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

  // const handleRowClick = (args) => {
  //   // Log the row data to the console
    
  //   handleViewAccount(args.data)
    
  // };


  const buttonTemplate = (props) => {
    return (
      <div className="flex justify-center gap-2">
      
        <button
          className="bg-green-500 text-white px-4 py-4 rounded hover:bg-green-700"
          onClick={() =>  handleViewAccount(props)}
        >
          View
        </button>
      </div>
    );
  };

  const getColumns = () => {
    return (
      <ColumnsDirective>
      <ColumnDirective
          headerText='Actions'
          width='150'
          template={buttonTemplate}
          textAlign='Center'
        />
      
         <ColumnDirective
          field='customerName'
         headerText= 'نوم'
          width='120'
            textAlign='Center'
          allowSorting={true}
          tooltip={{ enable: true }}
        />

<ColumnDirective
          field='type'
         headerText= 'پیرودونکی ډول'
          width='120'
            textAlign='Center'
          allowSorting={true}
          tooltip={{ enable: true }}
        />

<ColumnDirective
          field='balance'
         headerText= 'بلانس'
          width='120'
            textAlign='Center'
          allowSorting={true}
          tooltip={{ enable: true }}
        />

           <ColumnDirective
        field='contactNumber' // Use the correct field name
        headerText= 'شماره'
        width='200'
       
        textAlign='Center'
        allowSorting={false}
      />
        <ColumnDirective
          field='address'
          headerText='ادرس'
          width='120'
            textAlign='Center'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
    

       

      </ColumnsDirective>
    );
  };
  return (
    <div className='w-full p-4  md:mt-20 bg-white '>
      <Header category='Page' title='Customers Account / پیرودونکو حساب' />
      <div className='w-full mb-2 flex justify-end'>
       
      </div>
      {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
      <div className='max-w-screen-lg mt-10'>
 <GridComponent
          id='Grid'
          
          dataSource={customers}
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
        
          ref={(g) => (grid = g)}
        >
          {getColumns()}
          <Inject services={[Search, Page, Toolbar, ExcelExport, Sort]} />
        </GridComponent>
     </div>
    </div>
  );
};
export default CustomerAccountMain;
 