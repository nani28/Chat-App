const users = [];

const addUser = ({ id, username, room }) => {
  //clean data

  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  //validate user
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //add to user

  const user = { id, username, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return (user = users.find((user) => {
    return user.id === id;
  }));
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => {
    return user.room === room;
  });
};

module.exports = {
  getUser,
  getUsersInRoom,
  addUser,
  removeUser,
};
