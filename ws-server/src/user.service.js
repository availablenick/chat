const { v4: uuidv4 } = require("uuid");

class UserService {
  constructor() {
    this.userById = {};
    this.namespaceByUsername = {};
    this.idByUsername = {};
    this.roomByUserPair = {};
    this.roomsByUsername = {};
  }

  assignUserToId(user, id) {
    this.userById[id] = user;
    this.idByUsername[user.username] = id;
  }

  assignUsernameToNamespaceName(username, namespaceName) {
    this.namespaceByUsername[username] = namespaceName;
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

  getUserFrom(id) {
    return this.userById[id];
  }

  getNamespaceNameFrom(username) {
    return this.namespaceByUsername[username];
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
    delete this.namespaceByUsername[this.userById[id].username];
    delete this.idByUsername[this.userById[id].username];
    delete this.userById[id];
  }

  removeUserPairRoom(username1, username2) {
    const room = this.roomByUserPair[`${username1}:${username2}`] || this.roomByUserPair[`${username2}:${username1}`];
    this.roomsByUsername[username1].delete(room);
    this.roomsByUsername[username2].delete(room);
    delete this.roomByUserPair[`${username1}:${username2}`];
    delete this.roomByUserPair[`${username2}:${username1}`];
  }

  clear() {
    this.userById = {};
    this.namespaceByUsername = {};
    this.idByUsername = {};
    this.roomByUserPair = {};
    this.roomsByUsername = {};
  }
}

module.exports = UserService;
