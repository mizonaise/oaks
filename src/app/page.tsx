import Link from 'next/link'
import { datasetList } from '@/data'

export default function Home () {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Shapes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Select a shape to open its configurator.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {datasetList.map(({ id, name }) => (
          <li key={id}>
            <Link
              href={`/shape/${id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <span className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="font-mono text-xs text-gray-400">{id}</span>
              </span>
              <span aria-hidden className="text-gray-300">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
