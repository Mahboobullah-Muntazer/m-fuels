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
import { ClipLoader } from 'react-spinners';

const SarafiMain = ({ handleAddSarafi, handleUpdateSarafi }) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const toolbar = ['Search', 'ExcelExport'];
  const { currentColor } = useStateContext();
  const [loading, setLoading] = useState(true);
  const [sarafis, setSarafis] = useState([]);
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const getAllsarafis = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true);
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAllsarafis',
          config
        );

        if (res.data.status !== 'FAILED') {
          setIsLoading(false);
          const sortedSarafis = res.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setSarafis(sortedSarafis);
          setLoading(false);
        } else {
          setIsLoading(false);
          console.log(res);
        }
      } catch (err) {
        setIsLoading(false);
        console.log('error' + err);
      }
    };

    getAllsarafis();
  }, [SERVER_PATH, user.token]);

  const buttonTemplate = (props) => {
    return (
      <div className="flex justify-center gap-2">
      
        <button
          className="bg-green-500 text-white px-4 py-4 rounded hover:bg-green-700"
          onClick={() => handleUpdateSarafi(props)}
        >
          Edit
        </button>
      </div>
    );
  };

  const getColumns = () => {
    return (
      <ColumnsDirective>
        <ColumnDirective
          field='name'
          headerText='صرافی'
          width='120'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
        <ColumnDirective
          field='contactNumber'
          headerText='Contact/شماره'
          width='200'
          textAlign='Center'
          allowSorting={false}
        />
        <ColumnDirective
          field='address'
          headerText='address/ادرس'
          width='200'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
         <ColumnDirective
          field='balance'
          headerText='balance/بلانس'
          width='200'
          allowSorting={true}
          tooltip={{ enable: true }}
        />
        <ColumnDirective
          headerText='Actions'
          width='150'
          template={buttonTemplate}
          textAlign='Center'
        />
      </ColumnsDirective>
    );
  };

  return (
    <div className='w-full p-4 md:mt-20 bg-white'>
      <Header category='Page' title='Sarafi/صرافی' />
      <div className='w-full mb-2 flex'>
        <button
          onClick={() => handleAddSarafi()}
          style={{ background: currentColor }}
          className='w-32 flex justify-center dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg'
        >
          <IoPersonAddSharp size={30} />
        </button>
      </div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <ClipLoader color={'#36D7B7'} loading={isLoading} size={50} />
        </div>
      )}
      <div className='max-w-screen-lg mt-10'>
        <GridComponent
          id='Grid'
          dataSource={sarafis}
          excelExportComplete={excelExportComplete}
          allowExcelExport={true}
          toolbar={toolbar}
          width='100%'
          toolbarClick={toolbarClick}
          allowResizing={true}
          frozenRows={0}
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

export default SarafiMain;
