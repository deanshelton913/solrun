'use client';

import UnstyledLink from '@/components/links/UnstyledLink';

export function SiteFooter() {
  return (
    <footer className='border-t border-slate-200 bg-white py-8'>
      <div className='layout flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <div className='flex items-center gap-2'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/logo.png'
            alt='SolRun'
            className='h-7 w-7 object-contain'
          />
          <span className='font-wordmark font-semibold text-slate-700'>
            SolRun
          </span>
        </div>
        <nav
          className='flex items-center gap-6 text-sm text-slate-600'
          aria-label='Footer'
        >
          <UnstyledLink href='/' className='hover:text-slate-900'>
            Home
          </UnstyledLink>
          <UnstyledLink href='/weather' className='hover:text-slate-900'>
            Weather
          </UnstyledLink>
        </nav>
      </div>
      <p className='layout mt-4 text-center text-sm text-slate-500 sm:text-left'>
        © {new Date().getFullYear()}{' '}
        <span className='font-wordmark'>SolRun</span>. Find your perfect weather
        getaway.
      </p>
    </footer>
  );
}
