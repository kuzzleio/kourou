import { expect, test } from '@oclif/test'
import { execSync } from 'child_process'

const SECOND = 1000
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

xdescribe('minikube:start', () => {
  test
    .timeout(50 * SECOND)
    .stdout({ print: false })
    .command(['minikube:start'])
    .finally(() => {
      execSync('minikube delete')
    })
    .it('Spawns Kuzzle v2 stack', async (ctx, done) => {
      await wait(10 * SECOND)
      expect(ctx.stdout).to.contain('Apply completed')
      done()
    })
})
