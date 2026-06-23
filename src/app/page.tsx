import Link from 'next/link'
import { shapes } from '@/data'

export default function Home () {
  return (
    <main className='mx-auto w-full max-w-2xl flex-1 px-6 py-16'>
      <h1 className='text-2xl font-semibold tracking-tight'>Shapes</h1>
      <p className='mt-1 text-sm text-gray-500'>
        Select a shape to open its configurator.
      </p>

      <ul className='mt-8 flex flex-col gap-3'>
        {(Object.keys(shapes) as Array<keyof typeof shapes>).map(val => (
          <li key={val}>
            <Link
              href={`/shape/${val}`}
              className='flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-gray-400 hover:bg-gray-50'
            >
              <span className='flex flex-col'>
                <span className='font-medium'>{shapes[val].name}</span>
                <span className='font-mono text-xs text-gray-400'>{shapes[val].form.name}</span>
              </span>
              <span aria-hidden className='text-gray-300'>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
