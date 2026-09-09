import { notFound } from 'next/navigation'
import { ShapeConfigurator } from '@/components/ShapeConfigurator'

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

  return <ShapeConfigurator dev={true} shapeName={id} country={country} />
}
