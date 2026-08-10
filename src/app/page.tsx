'use client'

import Link from 'next/link'
import { useGetProductsQuery } from '@/lib/store/api/tecniboApi'

export default function Home () {
  const { data: products, isLoading, error } = useGetProductsQuery()

  return (
    <main className='mx-auto w-full max-w-2xl flex-1 px-6 py-16'>
      <h1 className='text-2xl font-semibold tracking-tight'>Shapes</h1>
      <p className='mt-1 text-sm text-gray-500'>
        Select a shape to open its configurator.
      </p>

      {isLoading && <p className='mt-8 text-sm text-gray-400'>Loading products…</p>}

      {error && (
        <p className='mt-8 text-sm text-red-500'>Failed to load products.</p>
      )}

      {products && (
        <ul className='mt-8 flex flex-col gap-3'>
          {products.map(product => (
            <li key={product.id}>
              <Link
                href={`/shape/${product.id}`}
                className='flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-gray-400 hover:bg-gray-50'
              >
                <span className='flex flex-col'>
                  <span className='font-medium'>{product.id}</span>
                  <span className='font-mono text-xs text-gray-400'>
                    {product.articleId} · form {product.configuratorId}
                  </span>
                </span>
                <span aria-hidden className='text-gray-300'>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
