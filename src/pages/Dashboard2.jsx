import React, { useEffect, useState } from 'react';



import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';

import { ClipLoader } from 'react-spinners';

import Select from 'react-select';
import useStockCalculator from '../hooks/useStockCalculator';
import useFinancial from '../hooks/useFinancial';

const Dashboard = () => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const { currentColor } = useStateContext();

  const [loading, setLoading] = useState(true);

  const { user } = useAuthContext();
  const [availableCollections, setAvailableCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');

  const [totalPetrolPurchasePrice, setTotalPetrolPurchasePrice] = useState();
  const [totalDieselPurchasePrice, setTotalDieselPurchasePrice] = useState();
  const [totalGasPurchasePrice, setTotalGasPurchasePrice] = useState();

  const [totalPetrolSalePrice, setTotalPetrolSalePrice] = useState();
  const [totalDieselSalePrice, setTotalDieselSalePrice] = useState();
  const [totalGasSalePrice, setTotalGasSalePrice] = useState();

  const [
    averagePetrolPurchasePricePerTon,
    setAveragePetrolPurchasePricePerTon,
  ] = useState();
  const [
    averageDieselPurchasePricePerTon,
    setAverageDieselPurchasePricePerTon,
  ] = useState();
  const [averageGasPurchasePricePerTon, setAverageGasPurchasePricePerTon] =
    useState();

  const [petrolPurchasePricePerTon, setPetrolPurchasePricePerTon] = useState();
  const [dieselPurchasePricePerTon, setDieselPurchasePricePerTon] = useState();
  const [gasPurchasePricePerTon, setGasPurchasePricePerTon] = useState();

  const [totalPetrolProfit, setTotalPetrolProfit] = useState();
  const [totalDieselProfit, setTotalDieselProfit] = useState();
  const [totalGasProfit, setTotalGasProfit] = useState();
  const [netProfit, setNetProfit] = useState();
  const [loadingBar, setLoadingBar] = useState();
  const { isLoading,  purchaseData, saleData, stock } = useStockCalculator(
    selectedCollection,
    user
  );

 

  const { isFloading, salaryData, expensesData, totalSalary, totalExpense } =
    useFinancial(selectedCollection, user);

  useEffect(()=>{

    if(isLoading || isFloading) {
    setLoadingBar(true)
    }else
    {
      setLoadingBar(false)
    }
  },[isFloading,isLoading])



  useEffect(() => {
    const getAvailableCollections = async function () {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        const res = await axios.get(
          SERVER_PATH + 'api/actions/getAvailableCollections',
          config
        );

        if (res.data.status !== 'FAILED') {
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
          setLoading(false);
        } else {
          console.log(res);
        }
      } catch (err) {
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };

    getAvailableCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection === '' || selectedCollection === undefined) {
      setSelectedCollection(availableCollections[0]?.collectionName);
    }
  }, [availableCollections]);

  useEffect(() => {
    setTotalPetrolPurchasePrice(purchaseData?.petrol?.totalPrice);
    setTotalDieselPurchasePrice(purchaseData?.diesel?.totalPrice);
    setTotalGasPurchasePrice(purchaseData?.gas?.totalPrice);

    setTotalPetrolSalePrice(saleData?.petrol?.totalPrice);
    setTotalDieselSalePrice(saleData?.diesel?.totalPrice);
    setTotalGasSalePrice(saleData?.gas?.totalPrice);

    const avgPetrolPriceTon =
      purchaseData?.petrol?.totalPrice /
      purchaseData?.petrol?.totalQuantityInTons;
    const avgDieselPriceTon =
      purchaseData?.diesel?.totalPrice /
      purchaseData?.diesel?.totalQuantityInTons;
    const avgGasPriceTon =
      purchaseData?.gas?.totalPrice / purchaseData?.gas?.totalQuantityInTons;

    const roundTo3DecimalPlaces = (value) => parseFloat(value.toFixed(3));

    setAveragePetrolPurchasePricePerTon(
      roundTo3DecimalPlaces(avgPetrolPriceTon)
    );
    setAverageDieselPurchasePricePerTon(
      roundTo3DecimalPlaces(avgDieselPriceTon)
    );
    setAverageGasPurchasePricePerTon(roundTo3DecimalPlaces(avgGasPriceTon));

    setPetrolPurchasePricePerTon(roundTo3DecimalPlaces(avgPetrolPriceTon));
    setDieselPurchasePricePerTon(roundTo3DecimalPlaces(avgDieselPriceTon));
    setGasPurchasePricePerTon(roundTo3DecimalPlaces(avgGasPriceTon));
  }, [purchaseData, saleData, stock]);


  useEffect(()=>{
    if(totalGasProfit === undefined ||
      totalGasProfit === '' || 
     totalGasProfit === null ||
     totalPetrolProfit === undefined ||
      totalPetrolProfit === '' || 
     totalPetrolProfit === null ||
     totalDieselProfit === undefined ||
     totalDieselProfit === '' || 
    totalDieselProfit === null||
    totalSalary === undefined ||
    totalSalary === '' || 
    totalSalary === null ||
   totalExpense === undefined ||
   totalExpense === '' || 
   totalExpense === null
  
    
    ) 
     {

      }else
     {
       const netProfit=(parseFloat(totalDieselProfit)+parseFloat(totalPetrolProfit)+parseFloat(totalGasProfit))-(parseFloat(totalExpense)+parseFloat(totalSalary))
       setNetProfit(netProfit)
     }
  },[totalGasProfit,totalPetrolProfit,totalDieselProfit,totalSalary,totalExpense])



  const handleSelect = (selectedValue) => {
    if (selectedValue) {
      // Extract the specific fields you want to update from selectedValue
      const { value } = selectedValue;

      // Update only the specific fields in formData

      setTotalDieselProfit();
      setTotalGasProfit();
      setTotalPetrolProfit();
      setNetProfit();

      setSelectedCollection(value);
    }
  };

  const calculateProfit = () => {
    if (
      petrolPurchasePricePerTon === undefined ||
      petrolPurchasePricePerTon === '' ||
      petrolPurchasePricePerTon === null ||
      petrolPurchasePricePerTon === 0 ||
      petrolPurchasePricePerTon === '0'
    ) {
      alert('غلط نمبر مو داخل کړی');
    } else {
      if (
        parseFloat(totalPetrolSalePrice) !== 0 &&
        parseFloat(totalPetrolPurchasePrice) !== 0
      ) {
        const totalPetrolStockPrice =
          petrolPurchasePricePerTon * stock?.petrol?.totalQuantityInTons;
        const remainingPetrolPurchase =
          totalPetrolPurchasePrice - totalPetrolStockPrice;

        const totalProfit = totalPetrolSalePrice - remainingPetrolPurchase;
        const roundTo3DecimalPlaces = (value) => parseFloat(value.toFixed(3));

        setTotalPetrolProfit(roundTo3DecimalPlaces(totalProfit));
      } else {
        setTotalPetrolProfit(0);
      }
    }

    if (
      dieselPurchasePricePerTon === undefined ||
      dieselPurchasePricePerTon === '' ||
      dieselPurchasePricePerTon === null ||
      dieselPurchasePricePerTon === 0 ||
      dieselPurchasePricePerTon === '0'
    ) {
      alert('غلط نمبر مو داخل کړی');
    } else {
      if (
        parseFloat(totalDieselSalePrice) !== 0 &&
        parseFloat(totalDieselPurchasePrice) !== 0
      ) {
        const totalDieselStockPrice =
          dieselPurchasePricePerTon * stock?.diesel?.totalQuantityInTons;
        const remainingDieselPurchase =
          totalDieselPurchasePrice - totalDieselStockPrice;

        const totalProfit = totalDieselSalePrice - remainingDieselPurchase;
        const roundTo3DecimalPlaces = (value) => parseFloat(value.toFixed(3));
        setTotalDieselProfit(roundTo3DecimalPlaces(totalProfit));
      } else {
        setTotalDieselProfit(0);
      }
    }

    if (
      gasPurchasePricePerTon === undefined ||
      gasPurchasePricePerTon === '' ||
      gasPurchasePricePerTon === null ||
      gasPurchasePricePerTon === 0 ||
      gasPurchasePricePerTon === '0'
    ) {
      alert('غلط نمبر مو داخل کړی');
    } else {
      if (
        parseFloat(totalGasSalePrice) !== 0 &&
        parseFloat(totalGasPurchasePrice) !== 0
      ) {
        const totalGasStockPrice =
          gasPurchasePricePerTon * stock?.gas?.totalQuantityInTons;
        const remainingGasPurchase = totalGasPurchasePrice - totalGasStockPrice;

        const totalProfit = totalGasSalePrice - remainingGasPurchase;
        const roundTo3DecimalPlaces = (value) => parseFloat(value.toFixed(3));
        setTotalGasProfit(roundTo3DecimalPlaces(totalProfit));
      } else {
        setTotalGasProfit(0);
      }
    }



   
  };



  const handleInputChange = (field, value) => {
    if (field === 'petrolPrice') {
      setPetrolPurchasePricePerTon(value);
    }
    if (field === 'dieselPrice') {
      setDieselPurchasePricePerTon(value);
    }
    if (field === 'gasPrice') {
      setGasPurchasePricePerTon(value);
    }
  };

  return (
    <>
      {loadingBar && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
          <ClipLoader color={'#36D7B7'} loading={loadingBar} size={50} />
        </div>
      )}

    
      <div>
        <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-blue hover:shadow-2xl transition duration-300 mr-5 ml-5 mt-10'>
          <h2 className='text-xl font-bold mt-10 ml-5 md:mt-4  '>
            Select Collection
          </h2>

          <Select
            options={availableCollections.map((item) => ({
              label: item.collectionName,
              value: item.collectionName,
            }))}
            value={{ label: selectedCollection, value: selectedCollection }}
            isSearchable
            className='w-full dark:border-none dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-2 mt-1'
            onChange={(selectedOption) => handleSelect(selectedOption)}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
          />
        </div>
        <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300  transition duration-300 mt-2 mr-5 ml-5'>
          {/* Heading for available stock */}
          <h2 className='text-xl font-bold mt-4 ml-5 mb-10'>
            Stock Price Per Ton: {selectedCollection}
          </h2>

          {/* Displaying quantity in Liters and tons for the selected collection */}

          <div className='flex flex-col  md:flex-row ml-5 mr-5 mt-10'>
            {/* Petrol Stock Price Input */}
            <div className='mb-4 md:mr-4 w-full '>
              <label
                htmlFor='petrolPrice'
                className='block text-sm font-medium text-gray-700'
              >
                Petrol Stock Price per Ton :{' '}
                <span className='text-gray-500'>
                  {' '}
                  avg {averagePetrolPurchasePricePerTon}{' '}
                </span>
              </label>
              <input
                type='number'
                id='petrolPrice'
                min={0}
                name='petrolPrice'
                value={petrolPurchasePricePerTon}
                onChange={(e) =>
                  handleInputChange('petrolPrice', e.target.value)
                }
                className='mt-1 p-2 border rounded-md w-full'
                placeholder='Enter price'
              />
            </div>

            {/* Diesel Stock Price Input */}
            <div className='mb-4 md:mr-4 w-full '>
              <label
                htmlFor='dieselPrice'
                className='block text-sm font-medium text-gray-700'
              >
                Diesel Stock Price per Ton :{' '}
                <span className='text-gray-500'>
                  {' '}
                  avg {averageDieselPurchasePricePerTon}{' '}
                </span>
              </label>
              <input
                type='number'
                id='dieselPrice'
                min={0}
                name='dieselPrice'
                value={dieselPurchasePricePerTon}
                onChange={(e) =>
                  handleInputChange('dieselPrice', e.target.value)
                }
                className='mt-1 p-2 border rounded-md w-full'
                placeholder='Enter price'
              />
            </div>

            {/* Gas Stock Price Input */}
            <div className='mb-4 md:mr-4 w-full '>
              <label
                htmlFor='gasPrice'
                className='block text-sm font-medium text-gray-700'
              >
                Gas Stock Price per Ton :{' '}
                <span className='text-gray-500'>
                  {' '}
                  avg {averageGasPurchasePricePerTon}{' '}
                </span>
              </label>
              <input
                type='number'
                id='gasPrice'
                min={0}
                name='gasPrice'
                value={gasPurchasePricePerTon}
                onChange={(e) => handleInputChange('gasPrice', e.target.value)}
                className='mt-1 p-2 border rounded-md w-full'
                placeholder='Enter price'
              />
            </div>

            {/* Calculate Button */}
          </div>

          <div className='w-full flex items-center justify-center mt-5'>
            <button
              onClick={calculateProfit}
              style={{ background: currentColor }}
              className=' w-full md:w-1/2 text-white  hover:shadow-xl shadow-blue-300 transition duration-300 font-bold py-2 px-4 rounded-md mt-4 md:mt-0'
            >
              Calculate Profit
            </button>
          </div>
        </div>

        {/* Grids for Petrol, Diesel, and Gas */}
        <div className='grid grid-cols-1 mt-2'>
          {/* Petrol Grid */}
          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-blue hover:shadow-2xl transition duration-300 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-2 '>
              Petrol : {selectedCollection}
            </h3>

            <div className='flex flex-col md:flex-row w-full justify-between gap-2'>
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Stock:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Stock in Liters: {stock?.petrol?.totalQuantityInLiters}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Stock in Tons: {stock?.petrol?.totalQuantityInTons}
                </p>
              </div>

              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Purchase:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Ton:{' '}
                  {purchaseData?.petrol?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Liter:{' '}
                  {purchaseData?.petrol?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Price: {totalPetrolPurchasePrice} $
                </p>
              </div>

              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Sale:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Ton: {saleData?.petrol?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Liter: {saleData?.petrol?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Price: {totalPetrolSalePrice} $
                </p>
              </div>
            </div>

            <div className='w-full mt-5'>
              <p className='text-neon-blue font-bold text-lg mb-2'>
                Total Petrol Profit: {totalPetrolProfit} $
              </p>
            </div>
          </div>

          {/* Diesel Grid */}
          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-green hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-4'>
              Diesel : {selectedCollection}
            </h3>
            <div className='flex flex-col md:flex-row w-full justify-between gap-2'>
              {/* Stock */}
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Stock:</h3>
                <p className='text-neon-green text-lg mb-2'>
                  Stock in Liters: {stock?.diesel?.totalQuantityInLiters}
                </p>
                <p className='text-neon-green text-lg mb-2'>
                  Stock in Tons: {stock?.diesel?.totalQuantityInTons}
                </p>
              </div>

              {/* Purchase */}
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Purchase:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Ton:{' '}
                  {purchaseData?.diesel?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Liter:{' '}
                  {purchaseData?.diesel?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase: {totalDieselPurchasePrice} $
                </p>
              </div>

              {/* Sale */}
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Sale:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Ton: {saleData?.diesel?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Liter: {saleData?.diesel?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale: {totalDieselSalePrice} $
                </p>
              </div>
            </div>
            <div className='w-full mt-5'>
              <p className='text-neon-blue font-bold text-lg mb-2'>
                Total Diesel Profit: {totalDieselProfit} $
              </p>
            </div>
          </div>

          {/* Gas Grid */}
          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-4'>
              Gas : {selectedCollection}
            </h3>
            <div className='flex flex-col md:flex-row w-full justify-between gap-2'>
              {/* Stock */}
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Stock:</h3>
                <p className='text-neon-pink text-lg mb-2'>
                  Stock in Liters: {stock?.gas?.totalQuantityInLiters}
                </p>
                <p className='text-neon-pink text-lg mb-2'>
                  Stock in Tons: {stock?.gas?.totalQuantityInTons}
                </p>
              </div>

              {/* Purchase */}
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Purchase:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Ton: {purchaseData?.gas?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase Liter:{' '}
                  {purchaseData?.gas?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Purchase: {totalGasPurchasePrice} $
                </p>
              </div>

              {/* Sale */}
              <div className='flex-1 shadow-sm rounded-md shadow-teal-400 pr-4 pl-5'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>Sale:</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Ton: {saleData?.gas?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale Liter: {saleData?.gas?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  Total Sale: {totalGasSalePrice} $
                </p>
              </div>
            </div>
            <div className='w-full mt-5'>
              <p className='text-neon-blue font-bold text-lg mb-2'>
                Total Gas Profit: {totalGasProfit} $
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white  rounded-md shadow-lg border border-teal-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
     {/* Displaying quantity in Liters and tons for the selected collection */}
        <h2 className='text-xl font-bold mt-4 ml-5 mb-4'>
           Total Expenses: {selectedCollection}
          </h2>

</div>
  <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-4'>
              Salaries : {selectedCollection}
            </h3>

            <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Employee Name
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contact Number
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Salary Amount
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Salary Date
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Salary Month
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Salary Year
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Invoice Number
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {salaryData?.map((salary, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            <td className="px-6 py-4 whitespace-nowrap">{salary.employee.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{salary.employee.contactNumber}</td>
            <td className="px-6 py-4 whitespace-nowrap">{salary.salaryAmount}</td>
            <td className="px-6 py-4 whitespace-nowrap">{salary.salaryDate}</td>
            <td className="px-6 py-4 whitespace-nowrap">{salary.salaryMonth}</td>
            <td className="px-6 py-4 whitespace-nowrap">{salary.salaryYear}</td>
            <td className="px-6 py-4 whitespace-nowrap">{salary.invoiceNumber}</td>
          </tr>
        ))}

<tr className="bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap font-bold">Total:</td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap font-bold">{totalSalary}</td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
          </tr>
      </tbody>
    </table>
            </div>


            <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-4'>
              Expenses : {selectedCollection}
            </h3>
            <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Person Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expense Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expensesData?.map((expense, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-6 py-4 whitespace-nowrap">{expense.personName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{expense.expenseDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">{expense.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">{expense.reason}</td>
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap font-bold">Total:</td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap font-bold">{totalExpense}</td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
          </tr>
        </tbody>
      </table>
    </div>
          </div>


          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-4'>
              NetProfit : {selectedCollection}
            </h3>

              <h3 className='text-lg font-semibold mb-4'>
                Net Profit: {netProfit}
              </h3>

            </div>
      </div>
    </>
  );
};

export default Dashboard;
