export async function restoreRoles(sdk: any, dump: any) {
  if (dump.type !== 'roles') {
    throw new Error('Dump file does not contain roles definition')
  }

  const promises = Object.entries(dump.content)
    .map(([roleId, role]) => (
      sdk.security.createOrReplaceRole(roleId, role, { force: true })
    ))

  await Promise.all(promises)

  return promises.length
}

export async function restoreProfiles(sdk: any, dump: any) {
  if (dump.type !== 'profiles') {
    throw new Error('Dump file does not contain profiles definition')
  }

  const promises = Object.entries(dump.content)
    .map(([profileId, profile]) => (
      sdk.security.createOrReplaceProfile(profileId, profile, { force: true })
    ))

  await Promise.all(promises)

  return promises.length
}

export async function restoreUsers(sdk: any, dump: any) {
  if (dump.type !== 'users') {
    throw new Error('Dump file does not contain users definition')
  }

  const promises = Object.entries(dump.content)
    .map(([userId, content]) => (
      sdk.security.createUser(userId, { content })
    ))

  await Promise.all(promises)

  return promises.length
}
