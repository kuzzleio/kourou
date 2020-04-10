export async function restoreRoles(sdk: any, dump: any) {
  if (dump.type !== 'roles') {
    throw new Error('Dump file does not contains roles definition')
  }

  const promises = Object.entries(dump.content)
    .map(([roleId, role]) => (
      sdk.security.createOrReplaceRole(roleId, role, { force: true })
    ));

  await Promise.all(promises)

  return promises.length;
}

export async function restoreProfiles(sdk: any, dump: any) {
  if (dump.type !== 'profiles') {
    throw new Error('Dump file does not contains roles definition')
  }

  const promises = Object.entries(dump.content)
    .map(([profileId, profile]) => (
      sdk.security.createOrReplaceProfile(profileId, profile, { force: true })
    ));

  return promises.length;
}