/**
 * The All-in-One App — Post Normalisation Utilities
 * Cherry Computer Ltd.
 *
 * Every platform returns data in a completely different shape.
 * These functions transform that raw, platform-specific mess
 * into a clean, consistent NormalisedPost that the rest of
 * the app can work with without knowing anything about platforms.
 */

import { PLATFORMS } from '../services/platforms/PlatformService';

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISATION DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a raw platform post into a unified NormalisedPost object.
 * @param {object} rawPost — Raw API response from the platform
 * @param {string} platform — Platform identifier (e.g. 'instagram')
 * @returns {NormalisedPost}
 */
export const normalisePost = (rawPost, platform) => {
  const normalisers = {
    [PLATFORMS.INSTAGRAM]: normaliseInstagramPost,
    [PLATFORMS.TWITTER]: normaliseTwitterPost,
    [PLATFORMS.FACEBOOK]: normaliseFacebookPost,
    [PLATFORMS.TIKTOK]: normaliseTikTokPost,
    [PLATFORMS.LINKEDIN]: normaliseLinkedInPost,
    [PLATFORMS.YOUTUBE]: normaliseYouTubePost,
  };

  const normaliser = normalisers[platform];
  if (!normaliser) {
    console.warn(`No normaliser found for platform: ${platform}`);
    return null;
  }

  try {
    const normalised = normaliser(rawPost);
    // Prefix the ID with platform to guarantee uniqueness across platforms
    return { ...normalised, id: `${platform}_${normalised.id}`, platform };
  } catch (err) {
    console.error(`Failed to normalise ${platform} post:`, err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTAGRAM
// ─────────────────────────────────────────────────────────────────────────────

const normaliseInstagramPost = (post) => ({
  id: post.id,
  contentType: post.media_type === 'VIDEO' ? 'video' : 'image',
  text: post.caption || '',
  mediaUrls: post.media_type === 'CAROUSEL_ALBUM'
    ? (post.children?.data?.map(c => c.media_url) || [])
    : [post.media_url || post.thumbnail_url].filter(Boolean),
  authorId: post.user?.id || post.owner?.id,
  authorUsername: post.user?.username || post.owner?.username || 'instagram_user',
  authorDisplayName: post.user?.name || post.owner?.name || '',
  authorAvatarUrl: post.user?.profile_picture_url || null,
  likesCount: post.like_count || 0,
  commentsCount: post.comments_count || 0,
  sharesCount: 0, // Instagram API doesn't expose share counts
  viewsCount: post.video_view_count || null,
  createdAt: new Date(post.timestamp),
  url: post.permalink || `https://instagram.com/p/${post.shortcode}/`,
  raw: post,
});

// ─────────────────────────────────────────────────────────────────────────────
// TWITTER / X
// ─────────────────────────────────────────────────────────────────────────────

const normaliseTwitterPost = (tweet) => {
  const mediaItems = tweet.attachments?.media_keys
    ? tweet.includes?.media?.filter(m => tweet.attachments.media_keys.includes(m.media_key)) || []
    : [];

  return {
    id: tweet.id,
    contentType: mediaItems.some(m => m.type === 'video') ? 'video'
      : mediaItems.length > 0 ? 'image'
        : 'text',
    text: tweet.text || '',
    mediaUrls: mediaItems.map(m => m.preview_image_url || m.url).filter(Boolean),
    authorId: tweet.author_id,
    authorUsername: tweet.author?.username || 'twitter_user',
    authorDisplayName: tweet.author?.name || '',
    authorAvatarUrl: tweet.author?.profile_image_url || null,
    likesCount: tweet.public_metrics?.like_count || 0,
    commentsCount: tweet.public_metrics?.reply_count || 0,
    sharesCount: tweet.public_metrics?.retweet_count || 0,
    viewsCount: tweet.public_metrics?.impression_count || null,
    createdAt: new Date(tweet.created_at),
    url: `https://twitter.com/i/web/status/${tweet.id}`,
    raw: tweet,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK
// ─────────────────────────────────────────────────────────────────────────────

const normaliseFacebookPost = (post) => ({
  id: post.id,
  contentType: post.attachments?.data?.[0]?.type === 'video_inline' ? 'video'
    : post.attachments?.data?.length > 0 ? 'image'
      : 'text',
  text: post.message || post.story || '',
  mediaUrls: post.attachments?.data?.map(a => a.media?.image?.src).filter(Boolean) || [],
  authorId: post.from?.id || '',
  authorUsername: post.from?.name || 'facebook_user',
  authorDisplayName: post.from?.name || '',
  authorAvatarUrl: post.from?.id ? `https://graph.facebook.com/${post.from.id}/picture?type=normal` : null,
  likesCount: post.likes?.summary?.total_count || 0,
  commentsCount: post.comments?.summary?.total_count || 0,
  sharesCount: post.shares?.count || 0,
  viewsCount: null,
  createdAt: new Date(post.created_time),
  url: post.permalink_url || `https://facebook.com/${post.id}`,
  raw: post,
});

// ─────────────────────────────────────────────────────────────────────────────
// TIKTOK
// ─────────────────────────────────────────────────────────────────────────────

const normaliseTikTokPost = (video) => ({
  id: video.id,
  contentType: 'video',
  text: video.video_description || '',
  mediaUrls: [video.cover_image_url || video.thumbnail_url].filter(Boolean),
  authorId: video.author_info?.open_id || video.creator_id,
  authorUsername: video.author_info?.unique_id || video.creator_username || 'tiktok_user',
  authorDisplayName: video.author_info?.display_name || '',
  authorAvatarUrl: video.author_info?.avatar_url || null,
  likesCount: video.video_statistics?.digg_count || video.statistics?.digg_count || 0,
  commentsCount: video.video_statistics?.comment_count || video.statistics?.comment_count || 0,
  sharesCount: video.video_statistics?.share_count || video.statistics?.share_count || 0,
  viewsCount: video.video_statistics?.play_count || video.statistics?.play_count || null,
  createdAt: new Date(video.create_time * 1000), // TikTok uses Unix timestamps
  url: video.share_url || `https://tiktok.com/@${video.creator_username}/video/${video.id}`,
  raw: video,
});

// ─────────────────────────────────────────────────────────────────────────────
// LINKEDIN
// ─────────────────────────────────────────────────────────────────────────────

const normaliseLinkedInPost = (activity) => {
  const content = activity.value?.['com.linkedin.voyager.feed.render.UpdateV2'] || activity;
  const actor = content.actor || {};
  const commentary = content.commentary?.text?.text || '';

  return {
    id: activity.entityUrn || activity.id,
    contentType: content.content?.['com.linkedin.voyager.feed.render.ArticleComponent']
      ? 'article'
      : 'text',
    text: commentary,
    mediaUrls: [],
    authorId: actor.urn || '',
    authorUsername: actor.name?.text || 'linkedin_user',
    authorDisplayName: actor.name?.text || '',
    authorAvatarUrl: actor.image?.attributes?.[0]?.sourceType === 'PROFILE_PICTURE'
      ? null // LinkedIn requires separate auth'd call for profile photos
      : null,
    likesCount: content.socialDetail?.totalSocialActivityCounts?.numLikes || 0,
    commentsCount: content.socialDetail?.totalSocialActivityCounts?.numComments || 0,
    sharesCount: content.socialDetail?.totalSocialActivityCounts?.numShares || 0,
    viewsCount: null,
    createdAt: new Date(activity.created?.time || Date.now()),
    url: `https://linkedin.com/feed/update/${activity.entityUrn}/`,
    raw: activity,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE
// ─────────────────────────────────────────────────────────────────────────────

const normaliseYouTubePost = (item) => {
  const snippet = item.snippet || {};
  const videoId = item.contentDetails?.upload?.videoId
    || item.id?.videoId
    || item.id;

  return {
    id: videoId,
    contentType: 'video',
    text: snippet.description || snippet.title || '',
    mediaUrls: [
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url
    ].filter(Boolean),
    authorId: snippet.channelId || '',
    authorUsername: snippet.channelTitle || 'youtube_channel',
    authorDisplayName: snippet.channelTitle || '',
    authorAvatarUrl: null, // Requires separate channels.list API call
    likesCount: parseInt(item.statistics?.likeCount) || 0,
    commentsCount: parseInt(item.statistics?.commentCount) || 0,
    sharesCount: 0,
    viewsCount: parseInt(item.statistics?.viewCount) || null,
    createdAt: new Date(snippet.publishedAt || snippet.publishTime),
    url: `https://youtube.com/watch?v=${videoId}`,
    raw: item,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sort normalised posts by creation date, newest first.
 */
export const sortByRecent = (posts) =>
  [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

/**
 * Deduplicate posts by ID (useful after pagination merges).
 */
export const deduplicatePosts = (posts) => {
  const seen = new Set();
  return posts.filter(post => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
};

/**
 * Filter posts by platform.
 */
export const filterByPlatform = (posts, platformId) =>
  platformId === 'all' ? posts : posts.filter(p => p.platform === platformId);

/**
 * Filter posts by content type.
 */
export const filterByContentType = (posts, contentType) =>
  contentType === 'all' ? posts : posts.filter(p => p.contentType === contentType);
