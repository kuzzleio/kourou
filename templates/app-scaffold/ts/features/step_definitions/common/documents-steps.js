const
  _ = require('lodash'),
  should = require('should'),
  {
    Then
  } = require('cucumber');

Then('The document {string} content match:', async function (documentId, dataTable) {
  const expectedContent = this.parseObject(dataTable);

  const document = await this.sdk.document.get(
    this.props.index,
    this.props.collection,
    documentId);

  should(document._source).matchObject(expectedContent);
});

Then('The document {string}:{string}:{string} content match:', async function (index, collection, documentId, dataTable) {
  const expectedContent = this.parseObject(dataTable);

  const document = await this.sdk.document.get(index, collection, documentId);

  should(document._source).matchObject(expectedContent);
});

Then('I {string} the following documents:', async function (action, dataTable) {
  action = `m${action[0].toUpperCase() + action.slice(1)}`;

  const documents = this.parseObjectArray(dataTable);

  this.props.result = await this.sdk.document[action](
    this.props.index,
    this.props.collection,
    documents);
});

Then('I {string} the document {string} with content:', async function (action, _id, dataTable) {
  const body = this.parseObject(dataTable);

  if (action === 'create') {
    this.props.result = await this.sdk.document[action](
      this.props.index,
      this.props.collection,
      body,
      _id);
  }
  else if (action === 'write') {
    const { _source: document } = await this.sdk.document.get(
      this.props.index,
      this.props.collection,
      _id);

    const content = {
      ...document,
      ...body
    };

    this.props.result = await this.sdk.bulk.write(
      this.props.index,
      this.props.collection,
      content,
      _id);
  }
  else {
    this.props.result = await this.sdk.document[action](
      this.props.index,
      this.props.collection,
      _id,
      body);
  }
});

Then('I should receive a {string} array of objects matching:', function (name, dataTable) {
  const expected = this.parseObjectArray(dataTable);

  should(this.props.result[name].length).be.eql(
    expected.length,
    `Array are not the same size: expected ${expected.length} got ${this.props.result[name].length}`);

  for (let i = 0; i < expected.length; i++) {
    should(this.props.result[name][i]).matchObject(expected[i]);
  }
});

Then('I should receive a {string} array matching:', function (name, dataTable) {
  const expected = _.flatten(dataTable.rawTable).map(JSON.parse);

  should(this.props.result[name].length).be.eql(
    expected.length,
    `Array are not the same size: expected ${expected.length} got ${this.props.result[name].length}`);

  should(this.props.result[name].sort()).match(expected.sort());
});

Then('I should receive a empty {string} array', function (name) {
  should(this.props.result[name]).be.Array().be.empty();
});

Then('I count {int} documents', async function (expectedCount) {
  const count = await this.sdk.document.count(
    this.props.index,
    this.props.collection);

  should(count).be.eql(expectedCount);
});

Then('I count {int} documents in {string}:{string}', async function (expectedCount, index, collection) {
  const count = await this.sdk.document.count(
    index,
    collection);

  should(count).be.eql(expectedCount);
});

Then('I count {int} documents matching:', async function (expectedCount, dataTable) {
  const properties = this.parseObject(dataTable);

  const query = {
    match: {
      ...properties
    }
  };

  const count = await this.sdk.document.count(
    this.props.index,
    this.props.collection,
    { query });

  should(count).be.eql(expectedCount);
});

Then(/The document "(.*?)":"(.*?)":"(.*?)"( does not)? exist/, async function (index, collection, id, not) {
  const exists = await this.sdk.document.exists(index, collection, id);

  if (not && exists) {
    throw new Error(`Document ${id} exists, but it shouldn't`);
  }

  if (!not && !exists) {
    throw new Error(`Expected document ${id} to exist`);
  }
});

Then(/I "(.*?)" the following document ids( with verb "(.*?)")?:/, async function (action, verb, dataTable) {
  action = `m${action[0].toUpperCase() + action.slice(1)}`;
  const options = verb ? { verb, refresh: 'wait_for' } : { refresh: 'wait_for' };

  const ids = _.flatten(dataTable.rawTable).map(JSON.parse);

  this.props.result = await this.sdk.document[action](
    this.props.index,
    this.props.collection,
    ids,
    options);
});

Then('I search documents with the following query:', function (queryRaw) {
  const query = JSON.parse(queryRaw);

  this.props.searchBody = { query };
});

Then('with the following highlights:', function (highlightsRaw) {
  const highlights = JSON.parse(highlightsRaw);

  this.props.searchBody.highlight = highlights;
});

Then('I execute the search query', async function () {
  this.props.result = await this.sdk.document.search(
    this.props.index,
    this.props.collection,
    this.props.searchBody);
});

Then('I delete the document {string}', async function (id) {
  this.props.result = await this.sdk.document.delete(
    this.props.index,
    this.props.collection,
    id);
});
