export const validationUtils = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password) => {
    return password && password.length >= 6;
  },
  
  required: (value) => {
    return value && value.toString().trim().length > 0;
  },
  
  minLength: (value, length) => {
    return value && value.toString().length >= length;
  },
  
  maxLength: (value, length) => {
    return value && value.toString().length <= length;
  },
};