class UserService {
  constructor() {
    this.users = {};
    this.namespaces = {};
  }

  assignUserToId(user, id) {
    this.users[id] = user;
  }

  assignUsernameToNamespaceName(username, namespaceName) {
    this.namespaces[username] = namespaceName;
  }

  getUserFrom(id) {
    return this.users[id];
  }

  getNamespaceNameFrom(username) {
    return this.namespaces[username];
  }

  removeUser(id) {
    delete this.users[id];
  } 
}

module.exports = UserService;
