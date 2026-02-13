const calculateDeliveryFee = (distance, baseDeliveryFee = 5, feePerKm = 2) => {
  if (distance <= 1) {
    return baseDeliveryFee;
  }
  return baseDeliveryFee + (distance - 1) * feePerKm;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const generateOrderNumber = () => {
  return `FG-${Date.now()}`;
};

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

const isStoreOpen = (operatingHours) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const day = operatingHours[dayName];
  if (!day || !day.open || !day.close) {
    return false;
  }

  const [openHour, openMinute] = day.open.split(':').map(Number);
  const [closeHour, closeMinute] = day.close.split(':').map(Number);

  const currentTime = currentHour * 60 + currentMinute;
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return currentTime >= openTime && currentTime < closeTime;
};

module.exports = {
  calculateDeliveryFee,
  calculateDistance,
  generateOrderNumber,
  generateOTP,
  isStoreOpen,
};
