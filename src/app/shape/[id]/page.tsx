import { notFound } from 'next/navigation'
import { ShapeConfigurator } from '@/components/ShapeConfigurator'
import { fetchShape } from '@/lib/shape/fetchShape'
import { fetchProductsConfig } from '@/lib/shape/fetchProductsConfig'

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
  // appears as a browser request. Both run in parallel. The template's saved
  // values have to be resolved before the first render: the form seeds itself
  // once and ignores `initialValues` afterwards, so a client-side fetch would
  // always land too late.
  const [shape, initialValues] = await Promise.all([
    fetchShape(id),
    template ? fetchProductsConfig(template) : Promise.resolve({})
  ])
  if (!shape) notFound()

  // The shape response carries its own article bundle, so no separate article
  // request is made. Products whose `articles` is the empty skeleton simply
  // render no articles.
  const articleData = shape.articles ?? null

  return (
    <ShapeConfigurator
      shapeName={id}
      shape={shape}
      articleData={articleData}
      initialValues={initialValues}
      country={country}
    />
  )
}
