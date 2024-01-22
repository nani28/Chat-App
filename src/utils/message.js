const getMessage = (username, message) => {
  return {
    username,
    message,
    createdAt: new Date().getTime(),
  };
};

const getLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};
module.exports = {
  getMessage,
  getLocationMessage,
};
