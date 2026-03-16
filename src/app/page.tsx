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
        {/* Hero — beach/sun background image */}
        <section className='relative overflow-hidden bg-primary-500 px-4 py-20 md:py-28'>
          <div
            className='absolute inset-0 bg-cover bg-center bg-no-repeat'
            style={{ backgroundImage: 'url("/images/header-bg.jpg")' }}
            aria-hidden
          />
          <div className='absolute inset-0 bg-primary-900/50' aria-hidden />
          <div className='layout relative flex flex-col items-center text-center'>
            <div className='animate-hero-fade-in motion-reduce:animate-none'>
              <h1 className='font-display text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl'>
                Find your perfect weather getaway
              </h1>
              <p className='mt-4 max-w-2xl text-lg leading-relaxed text-white/95 md:text-xl'>
                Pick your city. See top destinations ranked by forecast. Check
                flight prices. Plan your next trip around the weather that
                actually matters.
              </p>
              <ButtonLink
                href='/weather'
                variant='light'
                size='base'
                className='mt-8 bg-white px-6 py-3 text-base font-semibold text-primary-800 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-xl motion-reduce:translate-y-0'
              >
                Explore Weather →
              </ButtonLink>
            </div>
          </div>
          {/* Decorative weather icons with subtle motion */}
          <div
            className='absolute bottom-8 left-1/4 hidden md:block opacity-20 motion-reduce:animate-none animate-hero-float'
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/svg/wi-day-sunny.svg' alt='' className='h-20 w-20' />
          </div>
          <div
            className='absolute right-1/4 top-12 hidden md:block opacity-20 motion-reduce:animate-none animate-hero-pulse'
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/svg/wi-day-cloudy-high.svg'
              alt=''
              className='h-16 w-16'
            />
          </div>
        </section>

        {/* Features */}
        <section className='layout py-16 md:py-24'>
          <h2 className='animate-hero-fade-in text-center text-2xl font-bold text-slate-800 motion-reduce:animate-none md:text-3xl'>
            How it works
          </h2>
          <p className='mx-auto mt-2 max-w-xl animate-hero-fade-in text-center text-slate-600 motion-reduce:animate-none [animation-delay:80ms] [animation-fill-mode:both]'>
            Three steps to your next sunny (or snowy) escape.
          </p>
          <div className='mt-12 grid gap-8 md:grid-cols-3'>
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className='group animate-stagger-in rounded-2xl border border-slate-200 bg-white p-6 opacity-0 shadow-card-sm transition-shadow duration-200 hover:shadow-card-md motion-reduce:animate-none motion-reduce:opacity-100'
                style={{
                  animationDelay: `${120 + i * 80}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100'>
                  <Icon className='h-6 w-6' strokeWidth={2} />
                </div>
                <h3 className='mt-4 font-semibold text-slate-800'>{title}</h3>
                <p className='mt-2 text-sm text-slate-600'>{description}</p>
              </div>
            ))}
          </div>
          <div className='mt-12 text-center'>
            <ButtonLink
              href='/weather'
              variant='primary'
              size='base'
              className='animate-stagger-in opacity-0 motion-reduce:animate-none motion-reduce:opacity-100'
              style={{ animationDelay: '400ms', animationFillMode: 'both' }}
            >
              Try it now
            </ButtonLink>
          </div>
        </section>

        {/* CTA strip */}
        <section className='border-t border-slate-200 bg-slate-100/80 py-12'>
          <div className='layout text-center'>
            <p className='text-lg font-medium text-slate-700 transition-colors duration-200 hover:text-slate-800'>
              Ready to find where the weather’s best?
            </p>
            <ButtonLink
              href='/weather'
              variant='dark'
              size='base'
              className='mt-4 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:translate-y-0'
            >
              Go to Weather Explorer
            </ButtonLink>
          </div>
        </section>
      </main>
    </>
  );
}
