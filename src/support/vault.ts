import { flags } from '@oclif/command'

export const vaultFlags = {
  'vault-key': flags.string({
    description: 'Kuzzle Vault Key (or KUZZLE_VAULT_KEY)',
    default: process.env.KUZZLE_VAULT_KEY,
  }),
}

export const vaultArgs = [
  { name: 'secrets-file', description: 'Secrets file', required: true }
]
