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

  // `?id=` is the products-config template id (e.g. `?id=1269085`), whose saved
  // form values seed the configurator. Distinct from the route's `id` param,
  // which is the shape name.
  const { id: templateId, country: countryParam } = await searchParams
  const template = Array.isArray(templateId) ? templateId[0] : templateId

  // `?country=` selects the price list (e.g. `?country=ma`). Defaults to BE
  // downstream when absent.
  const country = Array.isArray(countryParam) ? countryParam[0] : countryParam

  // Fetched here rather than in the client component so neither endpoint

  const shape = await fetchShape(id)
  if (!shape) notFound()

  // The shape response carries its own article bundle, so no separate article
  // request is made. Products whose `articles` is the empty skeleton simply
  // render no articles.
  const articleData = shape.articles ?? null

  console.log('Fetched shape', templateId)

  return (
    <ShapeConfigurator
      shapeName={id}
      shape={shape}
      articleData={articleData}
      templateId={template}
      country={country}
    />
  )
}
