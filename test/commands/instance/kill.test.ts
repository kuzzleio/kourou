import { expect, test } from '@oclif/test'
import { execSync } from 'child_process'

const TEST_TIMEOUT = 120000
const PRINT_STDOUT = true

xdescribe('instance:kill', () => {
  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 2')
    })
    .command(['instance:kill', '-i', 'stack-0'])
    .it('Kill a kuzzle v2', (ctx, done) => {
      expect(ctx.stdout).to.contain('Instance stack-0 successfully killed.')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 1')
    })
    .command(['instance:kill', '-i', 'stack-0'])
    .it('Kill a kuzzle v1', (ctx, done) => {
      expect(ctx.stdout).to.contain('Instance stack-0 successfully killed.')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 2')
      execSync('./bin/run instance:spawn -v 2')
    })
    .command(['instance:kill', '-i', 'stack-1'])
    .it('Kill one of some kuzzle v2', (ctx, done) => {
      expect(ctx.stdout).to.contain('Instance stack-1 successfully killed.')
      done()
    })

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync('./bin/run instance:spawn -v 1')
      execSync('./bin/run instance:spawn -v 1')
    })
    .command(['instance:kill', '-i', 'stack-1'])
    .it('Kill one of some kuzzle v1', (ctx, done) => {
      expect(ctx.stdout).to.contain('Instance stack-1 successfully killed.')
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
      expect(ctx.stdout).to.contain('Instance stack-0 successfully killed.')
      expect(ctx.stdout).to.contain('Instance stack-1 successfully killed.')
      done()
    })
})
