// See https://docs.kuzzle.io/core/2/api/controllers/admin/load-securities/

export const testSecurities = {
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
