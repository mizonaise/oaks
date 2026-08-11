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

  // `?id=` is the products-config template id (e.g. `?id=1269085`), whose saved
  // form values seed the configurator. Distinct from the route's `id` param,
  // which is the shape name.
  const { id: templateId } = await searchParams
  const template = Array.isArray(templateId) ? templateId[0] : templateId

  return <ShapeConfigurator shapeName={id} templateId={template} />
}
