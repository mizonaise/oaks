import { notFound } from 'next/navigation'
import { ShapeConfigurator } from '@/components/ShapeConfigurator'
import { fetchShape } from '@/lib/shape/fetchShape'

export default async function ShapePage ({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // `id` is the remote shape name, e.g. OAKSOME_SHAPE_FR.
  const { id } = await params
  if (!id) notFound()

  // `?country=` selects the price list (e.g. `?country=ma`).
  const { country: countryParam } = await searchParams
  const country = Array.isArray(countryParam) ? countryParam[0] : countryParam

  // Fetched here rather than in the client component so neither endpoint
  // appears as a browser request.
  const shape = await fetchShape(id)
  if (!shape) notFound()

  // The shape response carries its own article bundle, so no separate article
  // request is made. Products whose `articles` is the empty skeleton simply
  // render no articles.
  const articleData = shape.articles ?? null

  return (
    <ShapeConfigurator
      dev={true}
      shapeName={id}
      shape={shape}
      articleData={articleData}
      country={country}
    />
  )
}
