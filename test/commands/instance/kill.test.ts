import { expect, test } from '@oclif/test'
import { execSync } from 'child_process'

const TEST_TIMEOUT = 120000
const PRINT_STDOUT = true

describe('instance:kill', () => {
  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 2')
    })
    .command(['instance:kill', '-i', 'stack-0_kuzzle_1'])
    .it('Kill a kuzzle v2', (ctx, done) => {
      expect(ctx.stdout).to.contain('stack-0_kuzzle_1')
      expect(ctx.stdout).to.contain('stack-0_elasticsearch_1')
      expect(ctx.stdout).to.contain('stack-0_redis_1')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 1')
    })
    .command(['instance:kill', '-i', 'stack-0_kuzzle_1'])
    .it('Kill a kuzzle v1', (ctx, done) => {
      expect(ctx.stdout).to.contain('stack-0_kuzzle_1')
      expect(ctx.stdout).to.contain('stack-0_elasticsearch_1')
      expect(ctx.stdout).to.contain('stack-0_redis_1')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 2')
      execSync('./bin/run instance:spawn -v 2')
    })
    .command(['instance:kill', '-i', 'stack-1_kuzzle_1'])
    .finally(() => {
      execSync('docker stop $(docker ps -aq)')
    })
    .it('Kill one of some kuzzle v2', (ctx, done) => {
      expect(ctx.stdout).to.contain('stack-1_kuzzle_1')
      expect(ctx.stdout).to.contain('stack-1_elasticsearch_1')
      expect(ctx.stdout).to.contain('stack-1_redis_1')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 1')
      execSync('./bin/run instance:spawn -v 1')
    })
    .command(['instance:kill', '-i', 'stack-1_kuzzle_1'])
    .finally(() => {
      execSync('docker stop $(docker ps -aq)')
    })
    .it('Kill one of some kuzzle v1', (ctx, done) => {
      expect(ctx.stdout).to.contain('stack-1_kuzzle_1')
      expect(ctx.stdout).to.contain('stack-1_elasticsearch_1')
      expect(ctx.stdout).to.contain('stack-1_redis_1')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 2')
      execSync('./bin/run instance:spawn -v 2')
    })
    .command(['instance:kill', '--all'])
    .it('Kill all running kuzzle', (ctx, done) => {
      expect(ctx.stdout).to.contain('stack-0_kuzzle_1')
      expect(ctx.stdout).to.contain('stack-0_elasticsearch_1')
      expect(ctx.stdout).to.contain('stack-0_redis_1')
      expect(ctx.stdout).to.contain('stack-1_kuzzle_1')
      expect(ctx.stdout).to.contain('stack-1_elasticsearch_1')
      expect(ctx.stdout).to.contain('stack-1_redis_1')
      done()
    })
})
