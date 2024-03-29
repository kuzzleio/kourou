const _ = require("lodash"),
  should = require("should"),
  { When, Then } = require("cucumber");

When(
  /I (successfully )?call the route "(.*?)":"(.*?)" with args:/,
  async function (expectSuccess, controller, action, dataTable) {
    const rawArgs = this.parseObject(dataTable);

    const args = {
      body: {},
    };

    for (const [path, value] of Object.entries(rawArgs)) {
      _.set(args, path, value);
    }

    try {
      const response = await this.sdk.query({ controller, action, ...args });

      this.props.result = response.result;
    } catch (error) {
      if (expectSuccess) {
        throw error;
      }

      this.props.error = error;
    }
  }
);

When(
  /I (successfully )?call the route "(.*?)":"(.*?)"$/,
  async function (expectSuccess, controller, action) {
    try {
      const response = await this.sdk.query({ controller, action });

      this.props.result = response.result;
    } catch (error) {
      if (expectSuccess) {
        throw error;
      }

      this.props.error = error;
    }
  }
);

Then("I should receive a result matching:", function (dataTable) {
  const expectedResult = this.parseObject(dataTable);

  should(this.props.result).not.be.undefined();

  should(this.props.result).matchObject(expectedResult);
});

Then(
  "The property {string} of the result should match:",
  function (path, dataTable) {
    const expectedProperty = this.parseObject(dataTable);

    const property = _.get(this.props.result, path);

    should(property).not.be.undefined();

    if (_.isPlainObject(property)) {
      should(property).matchObject(expectedProperty);
    } else {
      should(property).match(expectedProperty);
    }
  }
);

Then(
  "The result should contain a property {string} of type {string}",
  function (path, type) {
    const property = _.get(this.props.result, path);

    should(property).not.be.undefined();

    should(typeof property).be.eql(type);
  }
);

Then(
  "I should receive a {string} result equals to {string}",
  function (type, rawResult) {
    let expectedResult;

    if (type === "string") {
      expectedResult = rawResult;
    } else if (type === "int") {
      expectedResult = parseInt(rawResult);
    } else {
      throw new Error(`Unknown result type '${type}'`);
    }

    should(this.props.result).not.be.undefined();

    should(this.props.result).eql(expectedResult);
  }
);

Then("I should receive an empty result", function () {
  should(this.props.result).be.undefined();
});

Then("I should receive an error matching:", function (dataTable) {
  const expectedError = this.parseObject(dataTable);

  should(this.props.error).not.be.undefined();

  should(this.props.error).match(expectedError);
});

Then("I debug {string}", function (path) {
  console.log(JSON.stringify(_.get(this.props, path), null, 2));
});

Then(
  "I should receive a {string} array of objects matching:",
  function (name, dataTable) {
    const expected = this.parseObjectArray(dataTable);

    should(this.props.result[name].length).be.eql(
      expected.length,
      `Array are not the same size: expected ${expected.length} got ${this.props.result[name].length}`
    );

    for (let i = 0; i < expected.length; i++) {
      should(this.props.result[name][i]).matchObject(expected[i]);
    }
  }
);

Then("I should receive a {string} array matching:", function (name, dataTable) {
  const expected = _.flatten(dataTable.rawTable).map(JSON.parse);

  should(this.props.result[name].length).be.eql(
    expected.length,
    `Array are not the same size: expected ${expected.length} got ${this.props.result[name].length}`
  );

  should(this.props.result[name].sort()).match(expected.sort());
});

Then("I should receive a empty {string} array", function (name) {
  should(this.props.result[name]).be.Array().be.empty();
});
