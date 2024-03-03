import React, { useEffect, useState } from 'react';


import { ClipLoader  } from 'react-spinners';
import { useAuthContext } from './../hooks/useAuthContext';
import axios from 'axios';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const SERVER_PATH = process.env.REACT_APP_SERVER_PATH;

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  useEffect(() => {
    console.log('loginPage');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Username and password must not be empty.');
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({ emailOrUsername, password });

    console.log('handleSubmit', body);

    try {
      setIsLoading(true);
      const res = await axios.post(
        SERVER_PATH + 'api/actions/login',
        body,
        config
      );

      console.log(res);

      if (res.data.status === 'FAILED') {
        setIsLoading(false);
        setError(res.data.message);
      } else {
        const userData = {
          userId: res.data.userId,
          fullName: res.data.fullName,
          userType: res.data.userType,
          token: res.data.token,
        };

        localStorage.setItem('user', JSON.stringify(userData));

        //update the auth context
        dispatch({
          type: 'LOGIN',
          payload: userData,
        });
        setIsLoading(false);
        console.log(res.data);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className='grid bg-white grid-cols-1 sm:grid-cols-2 h-screen w-full'>
        {isLoading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <ClipLoader  color={'#36D7B7'} loading={isLoading} size={50} />
      </div>
    )}
      <div className='bg-white shadow-lg shadow-teal-500/20  rounded-3xl my-10 mx-2 flex flex-col justify-center'>
        <form
          className='max-w-[400px] 
        w-full mx-auto bg-
        p-8 px-8 rounded-lg
        
        bg-gray-100
        shadow-lg shadow-teal-500/50
        
      

        '
        
        
        >
          <h2
            className='text-4xl dark:text-white
        font-bold text-center'
          >
            Sign in
          </h2>
          <div
            className='flex flex-col 
        py-2'
          >
            <label>User Name</label>
            <input
              placeholder='UserName or Email'
              onChange={(e) => setEmailOrUsername(e.target.value)}
              name='emailOrUsername'
              className=' outline  outline-1 outline-teal-500/50 rounded-lg  mt-2 p-2 focus:outline-2   focus:outline-teal-500'
              type='text'
            />
          </div>

          <div className='flex flex-col  py-2'>
            <label>Password</label>
            <input
            placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
              name='password'
              className=' outline  outline-1 outline-teal-500/50  rounded-lg  mt-2 p-2  focus:outline-2  focus:outline-teal-500'
              type='password'
            />
          </div>

          <div className='flex justify-between text-blue-700 py-2'>
            <p className='font-'>Forgot passowrd</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={` w-full my-5 py-2 bg-teal-500 shadow-lg shadow-teal-500/50 ${
              isLoading ? '' : ' hover:bg-teal-400'
            }  ${isLoading ? 'cursor-not-allowed' : ''}`}
          >
            {' '}
            Sign In
          </button>

          {error && <div className='text-red-600 mt-2'>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
