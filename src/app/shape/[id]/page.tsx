import { notFound } from 'next/navigation'
import { ShapeConfigurator } from '@/components/ShapeConfigurator'

export default async function ShapePage ({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // `id` is the remote shape name, e.g. OAKSOME_SHAPE_FR.
  const { id } = await params
  if (!id) notFound()

  return <ShapeConfigurator shapeName={id} />
}
