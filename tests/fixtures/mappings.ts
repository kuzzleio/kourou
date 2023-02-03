// See https://docs.kuzzle.io/core/2/api/controllers/admin/load-mappings/
export const testMappings = {
  "nyc-open-data": {
    "yellow-taxi": {
      properties: {
        name: { type: "keyword" },
        city: { type: "keyword" },
        firstName: { type: "keyword" },
        lastName: { type: "keyword" }
      },
    },
  },
};
