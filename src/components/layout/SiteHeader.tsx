'use client';

import ButtonLink from '@/components/links/ButtonLink';
import UnstyledLink from '@/components/links/UnstyledLink';

export function SiteHeader() {
  return (
    <header className='sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm'>
      <div className='layout flex h-16 items-center justify-between'>
        <UnstyledLink href='/' className='flex items-center gap-2'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/logo.png'
            alt='SolRun'
            className='h-9 w-9 object-contain'
          />
          <span className='font-wordmark text-xl font-bold tracking-tight text-slate-800'>
            SolRun
          </span>
        </UnstyledLink>
        <nav className='flex items-center gap-6' aria-label='Main'>
          <UnstyledLink
            href='/'
            className='text-sm font-medium text-slate-600 hover:text-slate-900'
          >
            Home
          </UnstyledLink>
          <ButtonLink href='/weather' variant='primary' size='base'>
            Explore Weather
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
