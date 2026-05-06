/**
 * Publisher dispatch — routes a post to the correct platform publisher.
 */

import type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult } from './types'
import { publishToX } from './x'
import { publishToLinkedIn } from './linkedin'
import { publishToInstagram } from './instagram'
import { publishToFacebook } from './facebook'
import { publishToReddit } from './reddit'
import { publishToYouTube } from './youtube'
import { publishToDiscord } from './discord'
import { publishToBluesky } from './bluesky'
import { publishToTelegram } from './telegram'
import { publishToThreads } from './threads'

export type { PublisherPost, PublisherChannel, PostChannelConfig, PublishResult }

export async function publish(
  post: PublisherPost,
  channel: PublisherChannel,
  channelConfig: PostChannelConfig,
): Promise<PublishResult> {
  switch (channel.platform.toLowerCase()) {
    case 'x':
    case 'twitter':
      return publishToX(post, channel, channelConfig)

    case 'linkedin':
      return publishToLinkedIn(post, channel, channelConfig)

    case 'instagram':
      return publishToInstagram(post, channel, channelConfig)

    case 'facebook':
      return publishToFacebook(post, channel, channelConfig)

    case 'reddit':
      return publishToReddit(post, channel, channelConfig)

    case 'youtube':
      return publishToYouTube(post, channel, channelConfig)

    case 'discord':
      return publishToDiscord(post, channel, channelConfig)

    case 'bluesky':
      return publishToBluesky(post, channel, channelConfig)

    case 'telegram':
      return publishToTelegram(post, channel, channelConfig)

    case 'threads':
      return publishToThreads(post, channel, channelConfig)

    default:
      return {
        success: false,
        error: `Platform '${channel.platform}' publishing is not yet implemented.`,
        retryable: false,
      }
  }
}
