const ms = require('ms');
const _ = require('lodash');
const { setWorldConstructor } = require('cucumber');

class KuzzleWorld {
  constructor(attach, parameters) {
    this.attach = attach.attach;
    this.parameters = parameters;

    this.host = process.env.KUZZLE_HOST || 'localhost';
    this.port = process.env.KUZZLE_PORT || '7512';

    // Intermediate steps should store values inside this object
    this.props = {};
  }

  parseObject(dataTable) {
    const
      rawContent = dataTable.rowsHash(),
      content = {};

    for (const [path, value] of Object.entries(rawContent)) {
      if (value.includes('_AGO_')) {
        // format: "_5m_AGO_"
        const timeAgo = ms(value.split('_')[1]);

        _.set(content, path, this.props.now - timeAgo);
      }
      else {
        _.set(content, path, eval(`var o = ${value}; o`));
      }
    }

    return content;
  }

  parseObjectArray(dataTable) {
    const
      objectArray = [],
      keys = dataTable.rawTable[0];

    for (let i = 1; i < dataTable.rawTable.length; i++) {
      const
        object = {},
        rawObject = dataTable.rawTable[i];

      for (let j = 0; j < keys.length; j++) {
        if (rawObject[j] !== '-') {
          _.set(object, keys[j], eval(`var o = ${rawObject[j]}; o`));
        }
      }

      objectArray.push(object);
    }

    return objectArray;
  }
}

setWorldConstructor(KuzzleWorld);

module.exports = KuzzleWorld;
