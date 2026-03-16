'use client';

import UnstyledLink from '@/components/links/UnstyledLink';

export function SiteFooter() {
  return (
    <footer className='border-t border-slate-200 bg-surface-card py-8'>
      <div className='layout flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <div className='flex items-center gap-2'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/logo.png'
            alt='SolRun'
            className='h-7 w-7 object-contain'
          />
          <span className='font-display font-semibold text-slate-700'>
            SolRun
          </span>
        </div>
        <nav
          className='flex items-center gap-6 text-sm text-slate-600'
          aria-label='Footer'
        >
          <UnstyledLink
            href='/'
            className='rounded px-1 py-0.5 transition-all duration-200 hover:translate-y-[-1px] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0'
          >
            Home
          </UnstyledLink>
          <UnstyledLink
            href='/weather'
            className='rounded px-1 py-0.5 transition-all duration-200 hover:translate-y-[-1px] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0'
          >
            Weather
          </UnstyledLink>
        </nav>
      </div>
      <p className='layout mt-4 text-center text-sm text-slate-600 sm:text-left'>
        © {new Date().getFullYear()}{' '}
        <span className='font-display'>SolRun</span>. Find your perfect weather
        getaway.
      </p>
    </footer>
  );
}
