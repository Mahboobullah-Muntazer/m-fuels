import { useState, useEffect } from 'react';
import axios from 'axios';

const useStockCalculator = (selectedCollection, user) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  const [saleData, setSaleData] = useState([]);
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };

      try {
        setIsLoading(true);

        // Fetch purchase data
        const purchaseResponse = await axios.get(
          SERVER_PATH + 'api/actions/getAllPurchases',
          {
            ...config,
            params: {
              monthYear: selectedCollection,
            },
          }
        );

        if (purchaseResponse.data.status !== 'FAILED') {
          setIsLoading(false);
          const processedPurchaseData = processPurchaseData(
            purchaseResponse.data
          );
          setPurchaseData(processedPurchaseData);
        } else {
          setIsLoading(false);
          setPurchaseData(purchaseResponse.data.data);
          console.log(purchaseResponse);
        }
      } catch (err) {
        setIsLoading(false);
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };

    const processPurchaseData = (data) => {
      setIsLoading(true);
      const processedData = {
        petrol: {
          totalQuantityInTons: 0,
          totalQuantityInLiters: 0,
          totalPrice: 0,
        },
        diesel: {
          totalQuantityInTons: 0,
          totalQuantityInLiters: 0,
          totalPrice: 0,
        },
        gas: {
          totalQuantityInTons: 0,
          totalQuantityInLiters: 0,
          totalPrice: 0,
        },
      };

      data.forEach((purchase) => {
        const { fuelType, quantityInLiters, quantityInTons, totalPrice } =
          purchase;
        processedData[fuelType].totalQuantityInTons += quantityInTons;
        processedData[fuelType].totalQuantityInLiters += quantityInLiters;
        processedData[fuelType].totalPrice += totalPrice;
      });

      setIsLoading(false);
      return processedData;
    };

    fetchData();
  }, [selectedCollection, user.token]);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };
      try {
        setIsLoading(true);

        // Fetch sale data
        const saleResponse = await axios.get(
          SERVER_PATH + 'api/actions/getAllSales',
          {
            ...config,
            params: {
              monthYear: selectedCollection,
            },
          }
        );

        if (saleResponse.data.status !== 'FAILED') {
          setIsLoading(false);
          console.log('saD', saleResponse.data);
          const processedSaleData = processSaleData(saleResponse.data);
          setSaleData(processedSaleData);

          // Calculate available stock
        } else {
          setIsLoading(false);
          setSaleData(saleResponse.data.data);
          console.log(saleResponse);
        }
      } catch (err) {
        setIsLoading(false);
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };

    const processSaleData = (data) => {
      setIsLoading(true);
      const processedData = {
        petrol: {
          totalQuantityInTons: 0,
          totalQuantityInLiters: 0,
          totalPrice: 0,
        },
        diesel: {
          totalQuantityInTons: 0,
          totalQuantityInLiters: 0,
          totalPrice: 0,
        },
        gas: {
          totalQuantityInTons: 0,
          totalQuantityInLiters: 0,
          totalPrice: 0,
        },
      };

      data.forEach((sale) => {
        const { fuelType, quantityInLiters, quantityInTons, totalPrice } = sale;
        processedData[fuelType].totalQuantityInTons += quantityInTons;
        processedData[fuelType].totalQuantityInLiters += quantityInLiters;
        processedData[fuelType].totalPrice += totalPrice;
      });

      setIsLoading(false);
      return processedData;
    };

    fetchData();
  }, [selectedCollection, user.token]);

  const calculateStock = () => {
    setIsLoading(true);
    const availableStock = {
      petrol: {
        totalQuantityInTons: 0,
        totalQuantityInLiters: 0,
        totalPrice: 0,
      },
      diesel: {
        totalQuantityInTons: 0,
        totalQuantityInLiters: 0,
        totalPrice: 0,
      },
      gas: {
        totalQuantityInTons: 0,
        totalQuantityInLiters: 0,
        totalPrice: 0,
      },
    };

    // Check if saleData exists
    if (Object.keys(saleData).length > 0) {
      // Subtract saleData from purchaseData
      Object.keys(purchaseData).forEach((fuelType) => {
        availableStock[fuelType].totalQuantityInTons =
          purchaseData[fuelType].totalQuantityInTons -
          saleData[fuelType].totalQuantityInTons;
        availableStock[fuelType].totalQuantityInLiters =
          purchaseData[fuelType].totalQuantityInLiters -
          saleData[fuelType].totalQuantityInLiters;
        availableStock[fuelType].totalPrice =
          purchaseData[fuelType].totalPrice - saleData[fuelType].totalPrice;
      });
    } else {
      // If saleData is missing, transfer purchaseData to availableStock
      Object.keys(purchaseData).forEach((fuelType) => {
        availableStock[fuelType].totalQuantityInTons =
          purchaseData[fuelType].totalQuantityInTons;
        availableStock[fuelType].totalQuantityInLiters =
          purchaseData[fuelType].totalQuantityInLiters;
        availableStock[fuelType].totalPrice = purchaseData[fuelType].totalPrice;
      });
    }

    setIsLoading(false);
    setStock(availableStock);
  };

  useEffect(() => {
    calculateStock();
  }, [purchaseData, saleData]);

  return { isLoading, purchaseData, saleData, stock };
};

export default useStockCalculator;
