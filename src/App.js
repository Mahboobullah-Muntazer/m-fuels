import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthContext } from './hooks/useAuthContext';
import { Footer, Sidebar, ThemeSettings } from './components';
import {
  Dashboard,
 
  Login,
  Users,
  AddUser,

  UserDetails,

 



  Collections,

  Business,
  Managements,
  Reports,
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
            <div>
              {' '}
              {activeMenu ? (
                <div className='w-72  z-50 fixed sidebar dark:bg-secondary-dark-bg bg-white '>
                  <Sidebar />
                </div>
              ) : (
                <div className='w-0 z-50 dark:bg-secondary-dark-bg'>
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
            {/* {user ? (
              <div className='fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full '>
                <Navbar />
              </div>
            ) : (
              ''
            )} */}
            <div >


              <Routes>
                {/* dashboard  */}
                <Route
                  path='/login'
                  element={!user ? <Login /> : <Navigate to='/' />}
                />



                <Route
                  path='/'
                  element={user ? <Dashboard /> : <Navigate to='/login' />}
                />
                <Route
                  path='/dashboard'
                  element={user ? <Dashboard /> : <Navigate to='/login' />}
                />
                <Route
                  path='/business'
                  element={user ? <Business /> : <Navigate to='/login' />}
                />

                <Route
                  path='/management'
                  element={user ? <Managements /> : <Navigate to='/login' />}
                />

                <Route
                  path='/reports'
                  element={user ? <Reports /> : <Navigate to='/login' />}
                />

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
