import Image from '@/app/components/common/SanityImage'
import DateComponent from '@/app/components/common/Date'
import {Avatar as AvatarRoot, AvatarFallback} from '@/components/ui/avatar'
import {cn} from '@/lib/utils'

type Props = {
  person: {
    firstName: string | null
    lastName: string | null
    picture?: {
      asset?: {_ref: string}
      hotspot?: {x: number; y: number}
      crop?: {top: number; bottom: number; left: number; right: number}
      alt?: string
    }
  }
  date?: string
  small?: boolean
}

export default function Avatar({person, date, small = false}: Props) {
  const {firstName, lastName, picture} = person
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'
  const size = small ? 32 : 48

  return (
    <div className="flex items-center font-mono">
      <AvatarRoot className={cn(small ? 'h-6 w-6 mr-2' : 'h-9 w-9 mr-4')}>
        {picture?.asset?._ref ? (
          <Image
            id={picture.asset._ref}
            alt={picture?.alt || ''}
            className="aspect-square h-full w-full object-cover"
            height={size}
            width={size}
            hotspot={picture.hotspot}
            crop={picture.crop}
            mode="cover"
          />
        ) : (
          <AvatarFallback className={small ? 'text-[10px]' : 'text-xs'}>
            {initials}
          </AvatarFallback>
        )}
      </AvatarRoot>
      <div className="flex flex-col">
        {firstName && lastName && (
          <div className={small ? 'text-sm' : undefined}>
            {firstName} {lastName}
          </div>
        )}
        <div className={cn('text-muted-foreground', small ? 'text-xs' : 'text-sm')}>
          <DateComponent dateString={date} />
        </div>
      </div>
    </div>
  )
}
