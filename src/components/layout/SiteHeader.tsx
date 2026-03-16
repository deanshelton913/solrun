'use client';

import ButtonLink from '@/components/links/ButtonLink';
import UnstyledLink from '@/components/links/UnstyledLink';

export function SiteHeader() {
  return (
    <header
      className='sticky top-0 z-50 isolate overflow-hidden backdrop-blur-xl motion-reduce:backdrop-blur-lg'
      role='banner'
    >
      {/* Usual header bar: subtle gradient */}
      <div
        className='absolute inset-0 bg-gradient-to-r from-white via-primary-50/10 to-white'
        aria-hidden
      />
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300/50 to-transparent'
        aria-hidden
      />
      <div className='layout relative flex h-16 items-center justify-between gap-6'>
        <UnstyledLink
          href='/'
          className='flex items-center gap-2.5 rounded-lg py-1.5 pr-2 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 motion-reduce:hover:scale-100'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/logo.png'
            alt='SolRun'
            className='h-9 w-9 object-contain drop-shadow-sm'
          />
          <span className='font-display text-xl font-bold tracking-tight text-slate-800'>
            SolRun
          </span>
        </UnstyledLink>
        <nav className='flex items-center gap-1' aria-label='Main'>
          <UnstyledLink
            href='/'
            className='rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-primary-50/50 hover:text-slate-900 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 motion-reduce:hover:translate-y-0'
          >
            Home
          </UnstyledLink>
          <ButtonLink
            href='/weather'
            variant='primary'
            size='base'
            className='px-4 py-2.5 text-sm font-semibold md:text-base'
          >
            Destinations
          </ButtonLink>
        </nav>
      </div>
      {/* Lifted shadow (sits on the bar, not the accent line) */}
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-full shadow-header'
        aria-hidden
      />
    </header>
  );
}
