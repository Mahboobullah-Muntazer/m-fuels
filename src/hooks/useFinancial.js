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

        // Fetch salary data
        const salaryResponse = await axios.get(
          SERVER_PATH + 'api/actions/getAllSalaries',
          {
            ...config,
            params: {
              monthYear: selectedCollection,
            },
          }
        );

        if (salaryResponse.data.status !== 'FAILED') {
          setIsFloading(false);
          const processedSalaryData = processSalaryData(salaryResponse.data);
          setSalaryData(processedSalaryData);
        } else {
          setIsFloading(false);
          setTotalSalary(0);
          setSalaryData(salaryResponse.data.data);
          console.log(salaryResponse);
        }
      } catch (err) {
        setIsFloading(false);
        const errors = err.response.data.errors;
        if (errors) {
          console.log('error' + errors);
        }
      }

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
            expensesResponse.data
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

    const processSalaryData = (data) => {
      // Process your salary data as needed
      // ...
      setIsFloading(true);
      // Calculate total salary
      const totalSalary = data.reduce(
        (acc, salary) => acc + salary.salaryAmount,
        0
      );

      setTotalSalary(totalSalary);
      setIsFloading(false);
      return data;
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

  return { isFloading, salaryData, expensesData, totalSalary, totalExpense };
};

export default useFinancial;
