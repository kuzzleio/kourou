'use strict';

const util = require('util')

const _ = require('lodash');
const should = require('should');
const { Then } = require('cucumber');

Then('I subscribe to {string}:{string} notifications', async function (index, collection) {
  if (! this.props.subscriptions) {
    this.props.subscriptions = {};
  }

  const roomId = await this.sdk.realtime.subscribe(
    index,
    collection,
    {},
    notification => {
      this.props.subscriptions[`${index}:${collection}`].notifications.push(notification);
    });

  this.props.subscriptions[`${index}:${collection}`] = {
    unsubscribe: () => this.sdk.realtime.unsubscribe(roomId),
    notifications: []
  };
});

Then('I should have receive {string} notifications for {string}:{string}', function (rawNumber, index, collection) {
  const expectedCount = parseInt(rawNumber, 10);

  should(this.props.subscriptions[`${index}:${collection}`].notifications)
    .have.length(expectedCount);
});

Then('I should receive realtime notifications for {string}:{string} matching:', function (index, collection, datatable, done) {
  setTimeout(() => {
    let expectedNotifications;
    let subscription;

    try {
      expectedNotifications = this.parseObjectArray(datatable);

      should(this.props.subscriptions[`${index}:${collection}`]).not.be.undefined();

      subscription = this.props.subscriptions[`${index}:${collection}`];
      should(subscription.notifications).be.length(expectedNotifications.length);

      for (let i = 0; i < expectedNotifications.length; i++) {
        should(subscription.notifications[i]).matchObject(expectedNotifications[i]);
      }

      done();
    }
    catch (error) {
      console.log('expected', util.inspect(expectedNotifications, false, null, true));

      if (subscription) {
        console.log('received', util.inspect(subscription.notifications, false, null, true));
      }

      done(error);
    }
  }, 100);
});

Then('I should have {string} subscriber on {string}:{string} with filter:', async function (rawCount, index, collection, rawFilter) {
  const filter = eval(`var o = ${rawFilter}; o`);
  const expectedCount = parseInt(rawCount, 10);

  const roomId = await this.sdk.realtime.subscribe(index, collection, filter, () => {});

  await this.sdk.realtime.unsubscribe(roomId);

  const { result: subscriptions } = await this.sdk.query({
    controller: 'realtime',
    action: 'list'
  });

  // If the count is not set because no subscriptions are left, set it to 0
  const count = _.get(subscriptions, `${index}.${collection}.${roomId}`) || 0;

  if (expectedCount === 0) {
    should(count).be.eql(0);
  }
  else {
    should(subscriptions).have.property(index);
    should(subscriptions[index]).have.property(collection);
    should(count).be.eql(expectedCount);
  }
});

Then('I should have {string} subscriber on {string}:{string} without filter', async function (rawCount, index, collection) {
  const expectedCount = parseInt(rawCount, 10);

  const roomId = await this.sdk.realtime.subscribe(index, collection, {}, () => {});

  await this.sdk.realtime.unsubscribe(roomId);

  const { result: subscriptions } = await this.sdk.query({
    controller: 'realtime',
    action: 'list'
  });

  // If the count is not set because no subscriptions are left, set it to 0
  const count = _.get(subscriptions, `${index}.${collection}.${roomId}`);

  if (expectedCount === 0) {
    should(count).be.eql(0);
  }
  else {
    should(subscriptions).have.property(index);
    should(subscriptions[index]).have.property(collection);
    should(count).be.eql(expectedCount);
  }
});
