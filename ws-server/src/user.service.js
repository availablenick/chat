const { v4: uuidv4 } = require("uuid");

class UserService {
  constructor() {
    this.usernameById = {};
    this.idByUsername = {};
    this.roomByUserPair = {};
    this.roomsByUsername = {};
  }

  assignUsernameToId(username, id) {
    this.usernameById[id] = username;
    this.idByUsername[username] = id;
  }

  assignRoomToUserPair(username1, username2) {
    if (!this.roomsByUsername[username1]) {
      this.roomsByUsername[username1] = new Set();
    }

    if (!this.roomsByUsername[username2]) {
      this.roomsByUsername[username2] = new Set();
    }

    const id = uuidv4();
    this.roomsByUsername[username1].add(id);
    this.roomsByUsername[username2].add(id);
    this.roomByUserPair[`${username1}:${username2}`] = id;
    return id;
  }

  getUsernames() {
    return Object.keys(this.idByUsername);
  }
  
  getUsernameFrom(id) {
    return this.usernameById[id];
  }

  getIdFrom(username) {
    return this.idByUsername[username];
  }

  getRoomsFrom(username) {
    if (this.roomsByUsername[username]) {
      return Array.from(this.roomsByUsername[username]);
    }

    return [];
  }

  hasUser(username) {
    return this.idByUsername.hasOwnProperty(username);
  }

  hasRoomForPair(username1, username2) {
    if (this.roomByUserPair[`${username1}:${username2}`] || this.roomByUserPair[`${username2}:${username1}`]) {
      return true;
    }

    return false;
  }

  removeUser(id) {
    delete this.idByUsername[this.usernameById[id]];
    delete this.usernameById[id];
  }

  removeUserPairRoom(username1, username2) {
    const room = this.roomByUserPair[`${username1}:${username2}`] || this.roomByUserPair[`${username2}:${username1}`];
    this.roomsByUsername[username1].delete(room);
    this.roomsByUsername[username2].delete(room);
    delete this.roomByUserPair[`${username1}:${username2}`];
    delete this.roomByUserPair[`${username2}:${username1}`];
  }

  clear() {
    this.usernameById = {};
    this.idByUsername = {};
    this.roomByUserPair = {};
    this.roomsByUsername = {};
  }
}

module.exports = UserService;
