/**
 * @deprecated Replaced by the platform-generic `SocialIcon` (issue #14). This
 * module is retained only as a thin wrapper so any lingering import keeps
 * resolving. Use `<SocialIcon platform="github" />` for new code.
 */
import SocialIcon from './SocialIcon'

export default function GithubIcon({className}: {className?: string}) {
  return <SocialIcon platform="github" className={className} />
}
