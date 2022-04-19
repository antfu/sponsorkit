import { $fetch } from 'ohmyfetch'
import type { Provider, Sponsorship } from '../types'

const API = 'https://api.opencollective.com/graphql/v2/'
const graphql = String.raw

export const OpenCollectiveProvider: Provider = {
  name: 'opencollective',
  fetchSponsors(config) {
    return fetchOpenCollectiveSponsors(
      config.opencollective?.key,
      config.opencollective?.id,
      config.opencollective?.slug,
      config.opencollective?.githubHandle,
    )
  },
}

export async function fetchOpenCollectiveSponsors(key?: string, id?: string, slug?: string, githubHandle?: string): Promise<Sponsorship[]> {
  if (!key)
    throw new Error('OpenCollective api key is required')
  if (!slug && !id && !githubHandle)
    throw new Error('OpenCollective collective id or slug or GitHub handle is required')

  const sponsors: any[] = []
  let offset
  offset = 0

  do {
    const query = makeQuery(id, slug, githubHandle, offset)
    const data = await $fetch(API, {
      method: 'POST',
      body: { query },
      headers: {
        'Api-Key': `${key}`,
        'Content-Type': 'application/json',
      },
    }) as any

    sponsors.push(
      ...(data.data.collective.members.nodes || []),
    )
    if (data.data.collective.members.nodes.length !== 0)
      offset += data.data.collective.members.nodes.length
    else
      offset = undefined
  } while (offset)

  const processed = sponsors
    .map((raw: any): Sponsorship => ({
      sponsor: {
        type: raw.account.type === 'INDIVIDUAL' ? 'User' : 'Organization',
        login: raw.account.slug,
        name: raw.account.name,
        avatarUrl: raw.account.imageUrl,
        linkUrl: `https://opencollective.com/${raw.account.slug}`,
      },
      isOneTime: !raw.tier || raw.tier.type === 'DONATION',
      monthlyDollars: raw.totalDonations.value,
      privacyLevel: !raw.tier || raw.account.isIncognito ? 'PRIVATE' : 'PUBLIC',
      tierName: !raw.tier ? '' : raw.tier.name,
      createdAt: raw.createdAt,
    }))

  return processed
}

export function makeQuery(id?: string, slug?: string, githubHandle?: string, offset?: number) {
  return graphql`{
  collective(${id ? `id: "${id}", ` : ''}${slug ? `slug: "${slug}", ` : ''}${githubHandle ? `githubHandle: "${githubHandle}", ` : ''}, throwIfMissing: true) {
    members(limit: 100${offset ? ` offset: ${offset}` : ''} role: [BACKER]) {
      offset
      limit
      totalCount
      nodes {
        id
        role
        createdAt
        totalDonations {
          value
          currency
          valueInCents
        }
        tier {
          name
          type
        }
        account {
          name
          slug
          type
          isIncognito
          imageUrl(height: 460, format: png)
        }
      }
    }
  }
}`
}
