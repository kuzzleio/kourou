import { execSync } from 'child_process'
import fs from 'fs'

import should from 'should'

import { kourou } from '../../support'

describe('app:scaffold', () => {
  it('creates desired files and install packages', () => {
    execSync('rm -rf blackmesa/')

    kourou('app:scaffold blackmesa')

    should(fs.existsSync('blackmesa/.eslintignore')).be.eql(true)
    should(fs.existsSync('blackmesa/.eslintrc.json')).be.eql(true)
    should(fs.existsSync('blackmesa/.gitignore')).be.eql(true)
    should(fs.existsSync('blackmesa/.kuzzlerc')).be.eql(true)
    should(fs.existsSync('blackmesa/.mocharc.json')).be.eql(true)
    should(fs.existsSync('blackmesa/app.ts')).be.eql(true)
    should(fs.existsSync('blackmesa/package.json')).be.eql(true)
    should(fs.existsSync('blackmesa/README.md')).be.eql(true)
    should(fs.existsSync('blackmesa/tsconfig.json')).be.eql(true)

    const packageJson = JSON.parse(fs.readFileSync('blackmesa/package.json', 'utf8'))
    should(packageJson.name).be.eql('blackmesa')

    should(packageJson.dependencies.kuzzle).not.be.undefined()
  }).timeout(500 * 1000) // long timeout because of npm install which is slow af (and specially in Travis)
})
