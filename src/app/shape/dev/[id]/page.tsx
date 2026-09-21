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
  const query = await searchParams
  const countryParam = query.country
  const country = Array.isArray(countryParam) ? countryParam[0] : countryParam

  // Dev-only: every other `?FIELD=value` pair seeds the form, the other half of
  // the "Copy link" button which encodes the current values into such a URL.
  // Read here rather than from `window.location` so the values are in hand for
  // the form's first render, which seeds once and ignores `initialValues`
  // afterwards. `id` is the template selector, not a form field, so it never
  // seeds a value; `country` is a page param, likewise.
  const initialValues: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (key === 'id' || key === 'country' || value === undefined) continue
    initialValues[key] = Array.isArray(value) ? value[0] : value
  }

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
      initialValues={initialValues}
      country={country}
    />
  )
}
