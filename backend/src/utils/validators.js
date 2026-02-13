// Validation helper functions
const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateOrderData = (orderData) => {
  const errors = [];

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!orderData.deliveryAddress) {
    errors.push('Delivery address is required');
  }

  if (!orderData.paymentMethod) {
    errors.push('Payment method is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateOrderData,
};
