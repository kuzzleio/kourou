import {expect, test} from '@oclif/test'

describe('instance:spawn', () => {
  test
  .stdout()
  .command(['instance:spawn'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['instance:spawn', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
