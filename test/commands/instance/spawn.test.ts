import { expect, test } from '@oclif/test'

describe('instance:spawn', () => {
  test
    .timeout(10000)
    .stdout()
    .command(['instance:spawn'])
    .it('Spawns a new Kuzzle', ctx => {
      expect(ctx.stdout).to.contain('Kuzzle version 2 is launching')
    })

  test
    .timeout(10000)
    .stdout()
    .command(['instance:spawn', '--version', '1'])
    .it('Spawns a new Kuzzle v1', ctx => {
      expect(ctx.stdout).to.contain('Kuzzle version 1 is launching')
    })
})
