import * as _ from 'lodash'
import * as Bluebird from 'bluebird'

const sleep = (seconds: number) => new Promise((resolve: any) => setTimeout(resolve, seconds * 1000))

export async function restoreRoles(kommand: any, dump: any, preserveAnonymous = false) {
  if (dump.type !== 'roles') {
    throw new Error('Dump file does not contain roles definition')
  }

  const anonymousRights = _.get(dump.content, 'anonymous.controllers.*.actions.*')

  if (!preserveAnonymous && anonymousRights === false) {
    if (kommand.sdk.username === 'anonymous') {
      kommand.logKo('You are currently logged in as "anonymous" and anonymous role rights will be overwritten.')
      kommand.logInfo('Use the --preserve-anonymous flag to keep the default anonymous rights.')

      throw new Error('Please authenticate before importing or use --preserve-anonymous.')
    }
    else {
      kommand.logInfo('Anonymous user rights will be overwritten.')
      kommand.logInfo('Use the --preserve-anonymous flag to keep default anonymous rights.')
      kommand.logInfo('Press CTRL+C to abort or wait 4 sec')

      await sleep(4)
    }
  }
  else if (preserveAnonymous) {
    kommand.logInfo('Anonymous user rights has been preserved.')

    delete dump.content.anonymous
  }

  const results = await OiseauBleu.map(
    Object.entries(dump.content),
    ([roleId, role]: any) => (
      kommand.sdk.security.createOrReplaceRole(roleId, role, { force: true })
    ),
    { concurrency: 10 })

  return results.length
}

export async function restoreProfiles(kommand: any, dump: any) {
  if (dump.type !== 'profiles') {
    throw new Error('Dump file does not contain profiles definition')
  }

  const results = await Bluebird.map(
    Object.entries(dump.content),
    ([profileId, profile]: any) => (
      kommand.sdk.security.createOrReplaceProfile(profileId, profile, { force: true })
    ),
    { concurrency: 10 })

  return results.length
}

export async function restoreUsers(kommand: any, dump: any) {
  if (dump.type !== 'users') {
    throw new Error('Dump file does not contain users definition')
  }

  const results = await Bluebird.map(
    Object.entries(dump.content),
    ([userId, userBody]: any) => {
      return kommand.sdk.security.createUser(userId, userBody)
        .then(() => true)
        .catch((error: any) => kommand.logKo(`Error importing user ${userId}: ${error.message}`))
    },
    { concurrency: 10 })

  return results.filter((success: boolean) => success).length
}
