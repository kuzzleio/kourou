// See https://docs.kuzzle.io/core/2/api/controllers/admin/load-mappings/
module.exports = {
  'nyc-open-data': {
    'yellow-taxi': {
      properties: {
        name: { type: "keyword" },
        city: { type: "keyword" },
      }
    }
  }
};
