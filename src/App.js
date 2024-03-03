import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useAuthContext } from './hooks/useAuthContext';
import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import {
  Dashboard,
  Employees,
  AddEmploye,
  Suppliers,
  AddSupplier,
  Purchases,
  NewPurchase,
  Sales,
  Login,
  Users,
  AddUser,
  NewSale,
  Expenses,
  NewExpense,
  UserDetails,
  SupplierDetails,
  EmployeeDetails,
  Customers,
  AddCustomer,
  CustomerDetails,
  PurchaseDetails,
  SaleDetails,
  ExpenseDetails,
  Salaries,
  NewSalary,
  SalaryDetails,
  BackupAndRestore,
  SalesReport,
  PurchasesReport,
  ExpenseReport,
  SalaryReport,
  Test,
  CustomerAccountMain,
  CustomerAccount,
  Collections,
  GeneralReport,
} from './pages';
import './App.css';

import { useStateContext } from './contexts/ContextProvider';

const App = () => {
  const { user } = useAuthContext();

  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
  } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <BrowserRouter>
        <div className='flex relative dark:bg-main-dark-bg'>
          {user ? (
            <div className='fixed right-4 bottom-4' style={{ zIndex: '1000' }}>
              <TooltipComponent content='Settings' position='Top'>
                <button
                  type='button'
                  onClick={() => setThemeSettings(true)}
                  style={{ background: currentColor, borderRadius: '50%' }}
                  className='text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray'
                >
                  <FiSettings />
                </button>
              </TooltipComponent>
            </div>
          ) : (
            ''
          )}

          {user ? (
            <div>
              {' '}
              {activeMenu ? (
                <div className='w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white '>
                  <Sidebar />
                </div>
              ) : (
                <div className='w-0 dark:bg-secondary-dark-bg'>
                  <Sidebar />
                </div>
              )}
            </div>
          ) : (
            ''
          )}

          <div
            className={
              activeMenu
                ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  '
                : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
            }
          >
            {user ? (
              <div className='fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full '>
                <Navbar />
              </div>
            ) : (
              ''
            )}
            <div>
              {themeSettings && <ThemeSettings />}

              <Routes>
                {/* dashboard  */}
                <Route
                  path='/login'
                  element={!user ? <Login /> : <Navigate to='/' />}
                />

                <Route
                  path='/generalReport'
                  element={user ? <GeneralReport /> : <Navigate to='/login' />}
                />

                <Route
                  path='/'
                  element={user ? <Dashboard /> : <Navigate to='/login' />}
                />
                <Route
                  path='/dashboard'
                  element={user ? <Dashboard /> : <Navigate to='/login' />}
                />

                {/* pages  */}
                <Route
                  path='/sales'
                  element={user ? <Sales /> : <Navigate to='/login' />}
                />
                <Route
                  path='/sales/new'
                  element={user ? <NewSale /> : <Navigate to='/login' />}
                />
                <Route
                  path='/sales/details'
                  element={user ? <SaleDetails /> : <Navigate to='/login' />}
                />
                <Route
                  path='/salesReport'
                  element={user ? <SalesReport /> : <Navigate to='/login' />}
                />

                <Route
                  path='/purchases'
                  element={user ? <Purchases /> : <Navigate to='/login' />}
                />
                <Route
                  path='/purchases/new'
                  element={user ? <NewPurchase /> : <Navigate to='/login' />}
                />
                <Route
                  path='/purchases/details'
                  element={
                    user ? <PurchaseDetails /> : <Navigate to='/login' />
                  }
                />

                <Route
                  path='/purchaseReport'
                  element={
                    user ? <PurchasesReport /> : <Navigate to='/login' />
                  }
                />
                <Route
                  path='/expensesReport'
                  element={user ? <ExpenseReport /> : <Navigate to='/login' />}
                />

                <Route
                  path='/expenses'
                  element={user ? <Expenses /> : <Navigate to='/login' />}
                />
                <Route
                  path='/expenses/new'
                  element={user ? <NewExpense /> : <Navigate to='/login' />}
                />
                <Route
                  path='/expenses/details'
                  element={user ? <ExpenseDetails /> : <Navigate to='/login' />}
                />

                <Route
                  path='/salaries'
                  element={user ? <Salaries /> : <Navigate to='/login' />}
                />
                <Route
                  path='/salaries/new'
                  element={user ? <NewSalary /> : <Navigate to='/login' />}
                />

                <Route
                  path='/salaries/details'
                  element={user ? <SalaryDetails /> : <Navigate to='/login' />}
                />

                <Route
                  path='/slariesReport'
                  element={user ? <SalaryReport /> : <Navigate to='/login' />}
                />

                {/* Busseniss */}
                <Route
                  path='/employees'
                  element={user ? <Employees /> : <Navigate to='/login' />}
                />
                <Route
                  path='/employees/add'
                  element={user ? <AddEmploye /> : <Navigate to='/login' />}
                />
                <Route
                  path='/employees/details'
                  element={
                    user ? <EmployeeDetails /> : <Navigate to='/login' />
                  }
                />
                <Route
                  path='/suppliers'
                  element={user ? <Suppliers /> : <Navigate to='/login' />}
                />
                <Route
                  path='/suppliers/add'
                  element={user ? <AddSupplier /> : <Navigate to='/login' />}
                />
                <Route
                  path='/suppliers/details'
                  element={
                    user ? <SupplierDetails /> : <Navigate to='/login' />
                  }
                />
                <Route
                  path='/customers'
                  element={user ? <Customers /> : <Navigate to='/login' />}
                />
                <Route
                  path='/customerAccountMain'
                  element={
                    user ? <CustomerAccountMain /> : <Navigate to='/login' />
                  }
                />
                <Route
                  path='/customerAccountMain/accountDetails'
                  element={
                    user ? <CustomerAccount /> : <Navigate to='/login' />
                  }
                />
                <Route
                  path='/customers/add'
                  element={user ? <AddCustomer /> : <Navigate to='/login' />}
                />
                <Route
                  path='/customers/details'
                  element={
                    user ? <CustomerDetails /> : <Navigate to='/login' />
                  }
                />

                {/* Busseniss */}
                <Route
                  path='/users'
                  element={user ? <Users /> : <Navigate to='/login' />}
                />
                <Route
                  path='/users/add'
                  element={user ? <AddUser /> : <Navigate to='/login' />}
                />
                <Route
                  path='/users/details'
                  element={user ? <UserDetails /> : <Navigate to='/login' />}
                />

                <Route
                  path='/collections'
                  element={user ? <Collections /> : <Navigate to='/login' />}
                />
              </Routes>
            </div>
            {user ? <Footer /> : ''}
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
