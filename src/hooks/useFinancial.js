import { useState, useEffect } from 'react';
import axios from 'axios';

const useFinancial = (selectedCollection, user) => {
  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;
  const [isFloading, setIsFloading] = useState(false);
  const [salaryData, setSalaryData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          'x-auth-token': user.token,
        },
      };

      
      try {
        setIsFloading(true);

        // Fetch expenses data
        const expensesResponse = await axios.get(
          SERVER_PATH + 'api/actions/getAllExpenses',
          {
            ...config,
            params: {
              monthYear: selectedCollection,
            },
          }
        );

        if (expensesResponse.data.status !== 'FAILED') {
          setIsFloading(false);
          const processedExpensesData = processExpensesData(
            expensesResponse.data.data
          );
          setExpensesData(processedExpensesData);
        } else {
          setIsFloading(false);
          setTotalExpense(0);
          setExpensesData(expensesResponse.data.data);
          console.log(expensesResponse);
        }
      } catch (err) {
        setIsFloading(false);
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }
    };


    const processExpensesData = (data) => {
      // Process your expenses data as needed
      // ...
      setIsFloading(true);

      // Calculate total expenses
      const totalExpenses = data.reduce(
        (acc, expense) => acc + expense.amount,
        0
      );

      setTotalExpense(totalExpenses);
      setIsFloading(false);
      return data;
    };

    fetchData();
  }, [selectedCollection, user.token]);

  return { isFloading, expensesData, totalExpense };
};

export default useFinancial;
