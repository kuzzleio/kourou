// See https://docs.kuzzle.io/core/2/api/controllers/admin/load-securities/

module.exports = {
  users: {
    gordon: {
      content: {
        profileIds: ["default"],
      },
    },
    "test-admin": {
      content: {
        profileIds: ["admin"],
      },
      credentials: {
        local: {
          username: "test-admin",
          password: "password",
        },
      },
    },
  },
};
