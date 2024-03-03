import React, { useState, useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingDropDown from '../components/LoadingDropDown';

import SearchAbleDropDown from '../components/SearchAbleDropDown';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RingLoader } from 'react-spinners';


const Test = () => {
    const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
    const [isLoading,setIsLoading]=useState(true)
    const { currentColor } = useStateContext();
    const { user } = useAuthContext();
    const navigate = useNavigate(); // Get the navigate function
    const [disableAddButton, setDisableAddButton] = useState(false);
  
    const [petrolStock, setPetrolStock] = useState(null);
    const [dieselStock, setDieselStock] = useState(null);
    const [gasStock, setGasStock] = useState(null);
  
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const getStock = async function () {
        const config = {
          headers: {
            'x-auth-token': user.token,
          },
        };
        try {
          setIsLoading(true)
          const res = await axios.get(SERVER_PATH + 'api/actions/stock', config);
      
          if (res.data.status !== 'FAILED') {
            setIsLoading(false)
            // Iterate through the available stock and update the state variables
            res.data.availableStock.forEach((stock) => {
              switch (stock.fuelType) {
                case 'petrol':
                  setPetrolStock(stock);
                  break;
                case 'diesel':
                  setDieselStock(stock);
                  break;
                case 'gas':
                  setGasStock(stock);
                  break;
                default:
                  break;
              }
            });
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
      
      useEffect(() => {
       if(user?.token){
        getStock();
        getInfo();
       }
      }, [user?.token]);

      const getInfo = async function () {
        const config = {
          headers: {
            'x-auth-token': user.token,
          },
        };
        try {
          setIsLoading(true)
          const res = await axios.get(SERVER_PATH + 'api/actions/average-cost-per-liter', config);
      
          if (res.data.status !== 'FAILED') {
            setIsLoading(false)
            console.log(res.data)
            // Iterate through the available stock and update the state variables
          
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






  return (






    <div>
    <div>petrol amount</div>
    <div>petrol price per litters</div>

    <button className='bg-slate-500 w-11 h-10' type="button" value="get"/>
    </div>
  )
}

export default Test