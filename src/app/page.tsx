'use client';

import { CloudSun, MapPin, Plane } from 'lucide-react';

import ButtonLink from '@/components/links/ButtonLink';

const features = [
  {
    icon: MapPin,
    title: 'Pick your starting city',
    description:
      'Choose where you’re leaving from. We compare weather across top travel destinations so you see the best options at a glance.',
  },
  {
    icon: CloudSun,
    title: 'See weather-ranked destinations',
    description:
      'Get a ranked list with daily forecasts, average temps, and how far each place is—by walking, biking, driving, or flying.',
  },
  {
    icon: Plane,
    title: 'Check flight prices',
    description:
      'One click to see real flight prices to any destination. Plan your escape to the sun (or snow) with confidence.',
  },
];

export default function HomePage() {
  return (
    <>
      <main className='flex-1'>
        {/* Hero */}
        <section className='relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-4 py-20 md:py-28'>
          <div className='absolute inset-0 bg-white/5' aria-hidden />
          <div className='layout relative flex flex-col items-center text-center'>
            <h1 className='font-primary text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl'>
              Find your perfect weather getaway
            </h1>
            <p className='mt-4 max-w-2xl text-lg text-amber-50 md:text-xl'>
              Pick your city. See top destinations ranked by forecast. Check
              flight prices. Plan your next trip around the weather that
              actually matters.
            </p>
            <ButtonLink
              href='/weather'
              variant='light'
              size='base'
              className='mt-8 bg-white px-6 py-3 text-base font-semibold text-amber-800 shadow-lg hover:bg-amber-50'
            >
              Explore Weather →
            </ButtonLink>
          </div>
          {/* Decorative weather icons */}
          <div className='absolute bottom-8 left-1/4 hidden opacity-20 md:block'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/svg/wi-day-sunny.svg' alt='' className='h-16 w-16' />
          </div>
          <div className='absolute right-1/4 top-12 hidden opacity-20 md:block'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/svg/wi-day-cloudy-high.svg'
              alt=''
              className='h-14 w-14'
            />
          </div>
        </section>

        {/* Features */}
        <section className='layout py-16 md:py-24'>
          <h2 className='text-center text-2xl font-bold text-slate-800 md:text-3xl'>
            How it works
          </h2>
          <p className='mx-auto mt-2 max-w-xl text-center text-slate-600'>
            Three steps to your next sunny (or snowy) escape.
          </p>
          <div className='mt-12 grid gap-8 md:grid-cols-3'>
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700'>
                  <Icon className='h-6 w-6' strokeWidth={2} />
                </div>
                <h3 className='mt-4 font-semibold text-slate-800'>{title}</h3>
                <p className='mt-2 text-sm text-slate-600'>{description}</p>
              </div>
            ))}
          </div>
          <div className='mt-12 text-center'>
            <ButtonLink href='/weather' variant='primary' size='base'>
              Try it now
            </ButtonLink>
          </div>
        </section>

        {/* CTA strip */}
        <section className='border-t border-slate-200 bg-slate-100 py-12'>
          <div className='layout text-center'>
            <p className='text-lg font-medium text-slate-700'>
              Ready to find where the weather’s best?
            </p>
            <ButtonLink
              href='/weather'
              variant='dark'
              size='base'
              className='mt-4'
            >
              Go to Weather Explorer
            </ButtonLink>
          </div>
        </section>
      </main>
    </>
  );
}
