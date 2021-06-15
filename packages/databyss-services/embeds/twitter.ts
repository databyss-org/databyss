export interface TweetAttributes {
  tweetId: string
  user: string
}

export const parseTweetUrl = (url: string): TweetAttributes | null => {
  const _regex = /https*:\/\/twitter\.com\/(?<USER>.+?)\/status\/(?<TID>\d+)/
  const match = _regex.exec(url)
  if (match?.groups) {
    return {
      tweetId: match.groups.TID,
      user: match.groups.USER,
    }
  }
  return null
}
