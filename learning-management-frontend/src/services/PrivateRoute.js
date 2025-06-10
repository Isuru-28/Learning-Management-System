import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenValid = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decodedToken.exp > currentTime; // Check if token is expired
  } catch (error) {
    console.error('Token is invalid or expired:', error);
    return false; // Token is invalid
  }
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');

  useEffect(() => {
    // Check if token is valid and user role is allowed
    if (!(token && isTokenValid(token) && allowedRoles.includes(userRole))) {
      // If not valid or role not allowed navigate to login page
      navigate('/login');
    }
  }, [token, userRole, allowedRoles, navigate]);

  // If valid render the children components
  return token && isTokenValid(token) && allowedRoles.includes(userRole) ? children : null;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PrivateRoute;
