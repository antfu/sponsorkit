import type { Provider, ProviderName, SponsorkitConfig } from '../types'
import { GitHubProvider } from './github'
import { OpenCollectiveProvider } from './opencollective'

export * from './github'

export const ProvidersMap = {
  github: GitHubProvider,
  opencollective: OpenCollectiveProvider,
}

export function guessProviders(config: SponsorkitConfig) {
  const items: ProviderName[] = []
  if (config.github && config.github.login)
    items.push('github')

  if (config.opencollective && (config.opencollective.id || config.opencollective.slug || config.opencollective.githubHandle))
    items.push('opencollective')

  // fallback
  if (!items.length)
    items.push('github')

  return items
}

export function resolveProviders(names: (ProviderName | Provider)[]) {
  return Array.from(new Set(names)).map((i) => {
    if (typeof i === 'string') {
      const provider = ProvidersMap[i]
      if (!provider)
        throw new Error(`Unknown provider: ${i}`)
      return provider
    }
    return i
  })
}
