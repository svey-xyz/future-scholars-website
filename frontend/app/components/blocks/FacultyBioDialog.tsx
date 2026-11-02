'use client'

import type {ReactNode} from 'react'
import {XMarkIcon} from '@heroicons/react/24/outline'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Props = {
  /** Visual content of the trigger button (portrait, name, role, sr-only cue). */
  trigger: ReactNode
  /** Larger portrait shown in the dialog header (decorative). */
  media?: ReactNode
  /** Dialog title — the teacher's name. */
  name: ReactNode
  /** Dialog description — the teacher's role. */
  role?: ReactNode
  /** Credentials + bio, rendered by the server component that owns the data. */
  children: ReactNode
  /** Visual Editing attribute for the card (click-to-edit in Presentation). */
  dataSanity?: string
}

/**
 * Faculty bio dialog (FB7) — the only client code the split faculty grid
 * adds. Everything it shows arrives as already-rendered `children`/props, so
 * this island ships the Radix dialog behaviour and nothing else.
 *
 * Radix owns the modal contract: focus moves into the dialog on open, is
 * trapped while open, Esc closes it, and focus returns to the same card. No
 * custom key handlers (docs/A11Y.md). Enter/exit ride `tw-animate-css` via the
 * shadcn `DialogContent`, switched off under `prefers-reduced-motion` below;
 * no `<ViewTransition>` here, since it would fight Radix's own presence
 * animation.
 *
 * The trigger is a real `<button>` (Radix default) whose accessible name is
 * its text: "{name}, {role}: read bio".
 */
export default function FacultyBioDialog({
  trigger,
  media,
  name,
  role,
  children,
  dataSanity,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger
        data-sanity={dataSanity}
        className="group/teacher flex w-full flex-col items-center gap-3 rounded-xl p-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {trigger}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        // `!`: the shadcn `data-[state=…]:animate-in/out` utilities out-rank a
        // plain `motion-reduce:animate-none`, and tw-animate-css does not
        // gate them on prefers-reduced-motion itself.
        // z-[70]: above the mobile top bar (z-[60]), which otherwise draws
        // over the backdrop and the top of a tall dialog.
        overlayClassName="z-[70] motion-reduce:animate-none!"
        className="z-[70] max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl gap-6 overflow-y-auto rounded-xl p-6 sm:p-8 motion-reduce:animate-none!"
      >
        <div className="flex flex-col items-center gap-4 pr-10 text-center sm:flex-row sm:items-center sm:text-left">
          {media}
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="font-display text-2xl font-medium leading-tight">
              {name}
            </DialogTitle>
            {role ? (
              <DialogDescription className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {role}
              </DialogDescription>
            ) : null}
          </div>
        </div>
        {children}
        {/* 44×44 close target (2.5.5 AAA) — the shadcn default is a 16px icon. */}
        <DialogClose className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <XMarkIcon aria-hidden="true" className="size-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
