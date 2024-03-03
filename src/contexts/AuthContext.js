import { createContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        isLoggedIn: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        isLoggedIn: false,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, {
    isLoggedIn: false,
    user: null,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const tokenExpirationDate = localStorage.getItem('tokenExpirationDate');

    if (user && tokenExpirationDate) {
      const currentTime = new Date().getTime();
      const isTokenExpired = currentTime > tokenExpirationDate;

      if (!isTokenExpired) {
        dispatch({
          type: 'LOGIN',
          payload: user,
        });
      } else {
        // Token has expired, log out the user
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, []);

  console.log('Authcontext state:', state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
