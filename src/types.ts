import type { SvgComposer } from './svg'

export interface BadgePreset {
  boxWidth: number
  boxHeight: number
  avatar: {
    size: number
    classes?: string
  }
  name?: false | {
    color?: string
    classes?: string
    maxLength?: number
  }
  container?: {
    sidePadding?: number
  }
  classes?: string
}

export interface Provider {
  name: string
  fetchSponsors: (config: SponsorkitConfig) => Promise<Sponsorship[]>
}

export interface Sponsor {
  type: 'User' | 'Organization'
  login: string
  name: string
  avatarUrl: string
  avatarUrlHighRes?: string
  avatarUrlMediumRes?: string
  avatarUrlLowRes?: string
  linkUrl?: string
}

export interface Sponsorship {
  sponsor: Sponsor
  monthlyDollars: number
  privacyLevel?: 'PUBLIC' | 'PRIVATE'
  tierName?: string
  createdAt?: string
  isOneTime?: boolean
}

export type OutputFormat = 'svg' | 'png' | 'json'

export type ProviderName = 'github' | 'opencollective'

export interface ProvidersConfig {
  github?: {
    /**
     * User id of your GitHub account.
     *
     * Will read from `SPONSORKIT_LOGIN` environment variable if not set.
     */
    login?: string
    /**
     * GitHub Token that have access to your sponsorships.
     *
     * Will read from `SPONSORKIT_TOKEN` environment variable if not set.
     *
     * @deprecated It's not recommended set this value directly, pass from env or use `.env` file.
     */
    token?: string
  }
  opencollective?: {
    /**
     * Api key of your OpenCollective account.
     *
     * Will read from `SPONSORKIT_OPENCOLLECTIVE_KEY` environment variable if not set.
     */
    key?: string
    /**
     * The id of your collective.
     *
     * Will read from `SPONSORKIT_OPENCOLLECTIVE_ID` environment variable if not set.
     */
    id?: string
    /**
     * The slug of your collective.
     *
     * Will read from `SPONSORKIT_OPENCOLLECTIVE_SLUG` environment variable if not set.
     */
    slug?: string
    /**
     * The GitHub handle of your collective.
     *
     * Will read from `SPONSORKIT_OPENCOLLECTIVE_GH_HANDLE` environment variable if not set.
     */
    githubHandle?: string
  }
}

export interface SponsorkitConfig extends ProvidersConfig {
  /**
   * @deprecated use `github.login` instead
   */
  login?: string
  /**
   * @deprecated use `github.token` instead
   */
  token?: string

  /**
   * @default auto detect based on the config provided
   */
  providers?: ProviderName[]

  /**
   * By pass cache
   */
  force?: boolean

  /**
   * Directory of output files.
   *
   * @default './sponsorkit'
   */
  outputDir?: string

  /**
   * Name of exported files
   *
   * @default 'sponsors'
   */
  name?: string

  /**
   * Output formats
   *
   * @default ['json', 'svg', 'png']
   */
  formats?: OutputFormat[]

  /**
   * Hook to modify sponsors data before rendering.
   */
  onSponsorsFetched?: (sponsors: Sponsorship[], provider: ProviderName | string) => PromiseLike<void> | void

  /**
   * Hook to get or modify the SVG before writing.
   */
  onSvgGenerated?: (svg: string) => PromiseLike<string | void | undefined | null> | string | void | undefined | null

  /**
   * Compose the SVG
   */
  customComposer?: (composer: SvgComposer, sponsors: Sponsorship[], config: SponsorkitConfig) => PromiseLike<void> | void

  /**
   * Tiers
   */
  tiers?: Tier[]

  /**
   * Width of the image.
   *
   * @default 700
   */
  width?: number

  /**
   * Path to cache file
   *
   * @default './sponsorkit/.cache.json'
   */
  cacheFile?: string

  /**
   * Padding of image container
   */
  padding?: {
    top?: number
    bottom?: number
  }

  /**
   * Inline CSS of generated SVG
   */
  svgInlineCSS?: string
}

export interface Tier {
  /**
   * The lower bound of the tier (inclusive)
   */
  monthlyDollars?: number
  title?: string
  preset?: BadgePreset
  padding?: {
    top?: number
    bottom?: number
  }
  /**
   * Replace the default composer with your own.
   */
  compose?: (composer: SvgComposer, sponsors: Sponsorship[], config: SponsorkitConfig) => void
  /**
   * Compose the SVG before the main composer.
   */
  composeBefore?: (composer: SvgComposer, tierSponsors: Sponsorship[], config: SponsorkitConfig) => void
  /**
   * Compose the SVG after the main composer.
   */
  composeAfter?: (composer: SvgComposer, tierSponsors: Sponsorship[], config: SponsorkitConfig) => void
}
