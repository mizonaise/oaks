import { notFound } from 'next/navigation'
import { ShapeConfigurator } from '@/components/ShapeConfigurator'
import { datasetIds, getShapeRefs } from '@/data'

export function generateStaticParams () {
  return datasetIds.map(id => ({ id }))
}

export default async function ShapePage ({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!getShapeRefs(id)) notFound()

  return <ShapeConfigurator dev={true} id={id} />
}
