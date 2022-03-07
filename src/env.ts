import dotenv from 'dotenv'
import type { SponsorkitConfig } from './types'

function getDeprecatedEnv(name: string, replacement: string) {
  const value = process.env[name]
  if (value !== null)
    console.warn(`[sponsorkit] env.${name} is deprecated, use env.${replacement} instead`)
  return value
}

export function loadEnv(): Partial<SponsorkitConfig> {
  dotenv.config()

  const config: Partial<SponsorkitConfig> = {
    github: {
      login: process.env.SPONSORKIT_GITHUB_LOGIN || process.env.GITHUB_LOGIN || getDeprecatedEnv('SPONSORKIT_LOGIN', 'SPONSORKIT_GITHUB_LOGIN'),
      token: process.env.SPONSORKIT_GITHUB_TOKEN || process.env.GITHUB_TOKEN || getDeprecatedEnv('SPONSORKIT_TOKEN', 'SPONSORKIT_GITHUB_TOKEN'),
    },
    opencollective: {
      key: process.env.SPONSORKIT_OPENCOLLECTIVE_KEY || process.env.OPENCOLLECTIVE_KEY,
      id: process.env.SPONSORKIT_OPENCOLLECTIVE_ID || process.env.OPENCOLLECTIVE_ID,
      slug: process.env.SPONSORKIT_OPENCOLLECTIVE_SLUG || process.env.OPENCOLLECTIVE_SLUG,
      githubHandle: process.env.SPONSORKIT_OPENCOLLECTIVE_GH_HANDLE || process.env.OPENCOLLECTIVE_GH_HANDLE,
    },
    outputDir: process.env.SPONSORKIT_DIR,
  }

  for (const key of Object.keys(config) as (keyof SponsorkitConfig)[]) {
    if (config[key] == null)
      delete config[key]
  }

  return config
}
