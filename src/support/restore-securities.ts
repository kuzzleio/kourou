import * as _ from 'lodash'

const sleep = (seconds: number) => new Promise((resolve: any) => setTimeout(resolve, seconds * 1000))

export async function restoreRoles(command: any, dump: any, preserveAnonymous: boolean = false) {
  if (dump.type !== 'roles') {
    throw new Error('Dump file does not contain roles definition')
  }

  const anonymousRights = _.get(dump.content, 'anonymous.controllers.*.actions.*')

  if (!preserveAnonymous && anonymousRights === false) {
    if (command.sdk.username === 'anonymous') {
      command.logKo('You are currently loggued as "anonymous" and anonymous role write will be overwritten.')
      command.logInfo('Use the --preserve-anonymous flag to keep default anonymous rights.')

      throw new Error('Please authenticate before importing or use --preserve-anonymous.')
    }
    else {
      command.logInfo('Anonymous user rights will be overwritten.')
      command.logInfo('Use the --preserve-anonymous flag to keep default anonymous rights.')
      command.logInfo('Press CTRL+C to abort or wait 4 sec')

      await sleep(4)
    }
  }
  else if (preserveAnonymous) {
    command.logInfo('Anonymous user rights has been preserved.')

    delete dump.content.anonymous
  }

  const promises = Object.entries(dump.content)
    .map(([roleId, role]) => (
      command.sdk.security.createOrReplaceRole(roleId, role, { force: true })
    ))

  await Promise.all(promises)

  return promises.length
}

export async function restoreProfiles(command: any, dump: any) {
  if (dump.type !== 'profiles') {
    throw new Error('Dump file does not contain profiles definition')
  }

  const promises = Object.entries(dump.content)
    .map(([profileId, profile]) => (
      command.sdk.security.createOrReplaceProfile(profileId, profile, { force: true })
    ))

  await Promise.all(promises)

  return promises.length
}

export async function restoreUsers(command: any, dump: any) {
  if (dump.type !== 'users') {
    throw new Error('Dump file does not contain users definition')
  }

  const promises = Object.entries(dump.content)
    .map(([userId, content]) => {
      return command.sdk.security.createUser(userId, { content })
        .then(() => true)
        .catch((error: any) => command.logKo(`Error importing user ${userId}: ${error.message}`))
    })

  const results = await Promise.all(promises)

  return results.filter(success => success).length
}
