import * as _ from 'lodash'

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

  const promises = Object.entries(dump.content)
    .map(([roleId, role]) => (
      kommand.sdk.security.createOrReplaceRole(roleId, role, { force: true })
    ))

  await Promise.all(promises)

  return promises.length
}

export async function restoreProfiles(kommand: any, dump: any) {
  if (dump.type !== 'profiles') {
    throw new Error('Dump file does not contain profiles definition')
  }

  const promises = Object.entries(dump.content)
    .map(([profileId, profile]) => (
      kommand.sdk.security.createOrReplaceProfile(profileId, profile, { force: true })
    ))

  await Promise.all(promises)

  return promises.length
}

export async function restoreUsers(kommand: any, dump: any) {
  if (dump.type !== 'users') {
    throw new Error('Dump file does not contain users definition')
  }

  const promises = Object.entries(dump.content)
    .map(([userId, content]) => {
      return kommand.sdk.security.createUser(userId, { content })
        .then(() => true)
        .catch((error: any) => kommand.logKo(`Error importing user ${userId}: ${error.message}`))
    })

  const results = await Promise.all(promises)

  return results.filter(success => success).length
}
