import React, { useEffect, useState } from 'react';


import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import useStockCalculator from '../hooks/useStockCalculator';
import useFinancial from '../hooks/useFinancial';

const GeneralReport = () => {
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


  const handlePrint = () => {
    // Access the table element by its ID or class
    const tableToPrint = document.getElementById('reportPage');

    // Check if the table exists
    if (tableToPrint) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Inject the table HTML into the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchases Report</title>
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
      alert('Table not found for printing.');
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
          <h2 className='text-xl font-bold mt-4 ml-5 mb-10 text-right'>
            د ذخیری فی ټڼ قیمت: {selectedCollection}
          </h2>

          {/* Displaying quantity in Liters and tons for the selected collection */}

          <div className='flex flex-col  md:flex-row ml-5 mr-5 mt-10'>
            {/* Petrol Stock Price Input */}
            <div className='mb-4 md:mr-4 w-full '>
              <label
                htmlFor='petrolPrice'
                className='block text-sm font-medium text-gray-700'
              >
                فی ټن پیترول قیمت :{' '}
                <span className='text-gray-500'>
                  {' '}
                  اوسط قیمت {averagePetrolPurchasePricePerTon}{' '}
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
                فی ټن ډیزل قیمت :{' '}
                <span className='text-gray-500'>
                  {' '}
                  اوسط قیمت {averageDieselPurchasePricePerTon}{' '}
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
                فی ټن ګازو قیمت :{' '}
                <span className='text-gray-500'>
                  {' '}
                  اوسط قیمت {averageGasPurchasePricePerTon}{' '}
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
              ګټه محاسبه کړی
            </button>
          </div>
        </div>

        {/* Grids for Petrol, Diesel, and Gas */}
  
  <div id='reportPage'>
  <div className='grid grid-cols-1 mt-2'>
          {/* Petrol Grid */}
          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-blue hover:shadow-2xl transition duration-300 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-2 text-right '>
              پیترول : {selectedCollection}
            </h3>

            <div className='flex flex-col md:flex-row w-full justify-between gap-2'>
            <div className='flex-1 items-end justify-end shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0 text-right ml-auto'> 
            <h3 className='text-lg font-semibold mb-2 mt-2'>ذخیره</h3>
                <p className='text-neon-blue text-lg mb-2'>
                 ذخیره په لیتر: {stock?.petrol?.totalQuantityInLiters}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                   ذخیره په ټن : {stock?.petrol?.totalQuantityInTons}
                </p>
              </div>

              <div className='flex-1 items-end justify-end shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0 text-right ml-auto'>   
                <h3 className='text-lg font-semibold mb-2 mt-2'>خرید</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرید په ټڼ:{' '}
                  {purchaseData?.petrol?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرید په لیتر:{' '}
                  {purchaseData?.petrol?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرید قیمت: {totalPetrolPurchasePrice} 
                </p>
              </div>

              <div className='flex-1 items-end justify-end shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0 text-right ml-auto'> 
                 <h3 className='text-lg font-semibold mb-2 mt-2'>خرڅلاو</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرڅلاو په ټڼ: {saleData?.petrol?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرڅلاو په لیتر: {saleData?.petrol?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرڅلاو قیمت: {totalPetrolSalePrice} 
                </p>
              </div>
            </div>

            <div className='w-full mt-5 text-right'>
              <p className='text-neon-blue font-bold text-lg mb-2'>
                مجموعه پیترول ګټه : {totalPetrolProfit} 
              </p>
            </div>
          </div>

          {/* Diesel Grid */}
          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-green hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg font-bold mb-4 text-right'>
              ډیزل : {selectedCollection}
            </h3>
            <div className='flex flex-col md:flex-row w-full justify-between gap-2'>
              {/* Stock */}
              <div className='flex-1 text-right shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>ذخیره</h3>
                <p className='text-neon-green text-lg mb-2'>
                 ذخیره په لیتر: {stock?.diesel?.totalQuantityInLiters}
                </p>
                <p className='text-neon-green text-lg mb-2'>
                  ذخیره په ټڼ: {stock?.diesel?.totalQuantityInTons}
                </p>
              </div>

              {/* Purchase */}
              <div className='flex-1 text-right shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>خرید</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرید په ټڼ:{' '}
                  {purchaseData?.diesel?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرید په لیتر:{' '}
                  {purchaseData?.diesel?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرید قیمت: {totalDieselPurchasePrice} $
                </p>
              </div>

              {/* Sale */}
              <div className='flex-1 text-right shadow-sm rounded-md shadow-teal-400 pr-4 pl-5'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>خرڅلاو</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرڅلاو په ټڼ: {saleData?.diesel?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرڅلاو په لیتر: {saleData?.diesel?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرڅلاو قیمت: {totalDieselSalePrice} 
                </p>
              </div>
            </div>
            <div className='w-full mt-5 text-right'>
              <p className='text-neon-blue  font-bold text-lg mb-2'>
                مجموعه ډیزلو ګټه:  {totalDieselProfit} 
              </p>
            </div>
          </div>

          {/* Gas Grid */}
          <div className='bg-white p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg text-right font-bold mb-4'>
              ګاز : {selectedCollection}
            </h3>
            <div className='flex flex-col md:flex-row w-full justify-between gap-2'>
              {/* Stock */}
              <div className='flex-1 text-right shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>ذخیره</h3>
                <p className='text-neon-pink text-lg mb-2'>
                 ذخیره په لیتر: {stock?.gas?.totalQuantityInLiters}
                </p>
                <p className='text-neon-pink text-lg mb-2'>
               ذخیره په ټڼ: {stock?.gas?.totalQuantityInTons}
                </p>
              </div>

              {/* Purchase */}
              <div className='flex-1 text-right shadow-sm rounded-md shadow-teal-400 pr-4 pl-5 mb-4 md:mb-0'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>خرید</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرید په ټڼ: {purchaseData?.gas?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرید په لیتر:{' '}
                  {purchaseData?.gas?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرید قیمت: {totalGasPurchasePrice} 
                </p>
              </div>

              {/* Sale */}
              <div className='flex-1 text-right shadow-sm rounded-md shadow-teal-400 pr-4 pl-5'>
                <h3 className='text-lg font-semibold mb-2 mt-2'>خرڅلاو</h3>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرڅلاو په ټڼ: {saleData?.gas?.totalQuantityInTons}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                 مجموعه خرڅلاو په لیتر: {saleData?.gas?.totalQuantityInLiters}{' '}
                </p>
                <p className='text-neon-blue text-lg mb-2'>
                  مجموعه خرڅلاو قیمت: {totalGasSalePrice} 
                </p>
              </div>
            </div>
            <div className='w-full text-right mt-5'>
              <p className='text-neon-blue font-bold text-lg mb-2'>
               مجموعه ګازو ګټه : {totalGasProfit} 
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white text-right rounded-md shadow-lg border border-teal-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
     {/* Displaying quantity in Liters and tons for the selected collection */}
        <h2 className='text-xl  font-bold mt-4 ml-5 mb-4 mr-5'>
          لګښتونه: {selectedCollection}
          </h2>
          <h2 className='text-lg  font-semibold mt-4 ml-5 mr-5 mb-4'>
                    مجموعه معاشات: {totalSalary}
                </h2>
                <h2 className='text-lg  font-semibold mt-4 mr-5 ml-5 mb-4'> نور مصارف : {totalExpense}</h2>
                <h2 className='text-lg text-red-500  font-bold mt-4 mr-5 ml-5 mb-4'>مجموعه  مصارف : {totalExpense+totalSalary}</h2>


</div>

          <div className='bg-white  p-6 rounded-md shadow-lg border border-gray-300 hover:border-neon-pink hover:shadow-2xl transition duration-300 mt-2 sm:mt-2 mr-5 ml-5'>
            <h3 className='text-lg text-right font-bold mb-4'>
            ګټه  : {selectedCollection}
            </h3>

              <h3 className={`text-xl ${netProfit>0?'text-blue-500':'text-red-500'}  text-right font-bold mb-4`}>
              خالصه ګټه: {netProfit}
              </h3>

            </div>
     
  </div>

 <div className='ml-5 w-full flex mt-2 justify-center content-center item-center'>
 <button
  style={{ background: currentColor }}
        className='w-2/3 h-10 flex justify-center  dark:text-gray-200 text-white py-2 px-4 rounded-md hover:drop-shadow-lg border '
        onClick={handlePrint}
      >
         print / پرینت
      </button>
 </div>
      </div>
    </>
  );
};

export default GeneralReport;
