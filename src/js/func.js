const getCurrentTime = () => {
  return new Date().toLocaleString();
};
  
const logMessage = (logType, message, type) => {
  const colors = {
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    default: '\x1b[0m', // Default
  };

  if (type === 'success') {
    console.log(
      `${colors.success} Succsess: ${logType}: ${message} | ${getCurrentTime()}${
        colors.default
      }`
    );
  }
  if (type === 'error') {
    console.log(`${colors.error} Error: ${logType}: ${message} | ${getCurrentTime()}${colors.default}`);
  } else {
    console.log(message);
  }
};

module.exports = {logMessage};