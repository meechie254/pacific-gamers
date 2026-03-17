import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page since registration is handled there
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default RegisterPage;