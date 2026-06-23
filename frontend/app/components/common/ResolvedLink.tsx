import Link from 'next/link'
import {forwardRef, type ComponentPropsWithoutRef} from 'react'

import {linkResolver} from '@/sanity/lib/utils'
import {DereferencedLink} from '@/sanity/lib/types'

type LinkProps = ComponentPropsWithoutRef<typeof Link>

interface ResolvedLinkProps extends Omit<LinkProps, 'href'> {
  link: DereferencedLink
  children: React.ReactNode
  className?: string
  /** Convenience aliases; native `aria-current`/`aria-label` also work via rest. */
  ariaCurrent?: LinkProps['aria-current']
  ariaLabel?: string
}

/**
 * Resolves a Sanity link to an href via the shared `linkResolver` and renders a
 * `next/link`. Forwards a ref and spreads remaining props so it composes cleanly
 * with Radix `asChild`/Slot (NavigationMenuLink, etc.) — ref, onClick/onSelect,
 * data-* and aria-* injected by the parent all reach the underlying anchor.
 */
const ResolvedLink = forwardRef<HTMLAnchorElement, ResolvedLinkProps>(
  ({link, children, className, ariaCurrent, ariaLabel, ...rest}, ref) => {
    // resolveLink() is used to determine the type of link and return the appropriate URL.
    const resolvedLink = linkResolver(link)

    if (typeof resolvedLink === 'string') {
      return (
        <Link
          ref={ref}
          href={resolvedLink}
          target={link?.openInNewTab ? '_blank' : undefined}
          rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
          className={className}
          aria-current={ariaCurrent}
          aria-label={ariaLabel}
          {...rest}
        >
          {children}
        </Link>
      )
    }
    return <>{children}</>
  },
)
ResolvedLink.displayName = 'ResolvedLink'

export default ResolvedLink
