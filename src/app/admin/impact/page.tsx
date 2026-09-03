import { prisma } from '@/lib/prisma'
import ImpactClient from './impact-client'

export default async function ImpactPage() {
  const workersSupported = await prisma.worker.count()
  const jobsCompleted = await prisma.booking.count({ where: { status: 'COMPLETED' } })
  
  const invoiceAgg = await prisma.invoice.aggregate({
    _sum: { labourCharge: true }
  })
  
  const ratingAgg = await prisma.rating.aggregate({
    _avg: { overall: true },
    _count: { _all: true }
  })

  // Calculate work distribution
  const bookingsByCategory = await prisma.booking.groupBy({
    by: ['categoryId'],
    _count: { id: true }
  })
  
  const categories = await prisma.serviceCategory.findMany()
  const data = categories.map(c => ({
    name: c.name,
    value: bookingsByCategory.find(b => b.categoryId === c.id)?._count.id || 0
  })).filter(c => c.value > 0)
  
  const defaultData = data.length > 0 ? data : [
    { name: 'Plumbing', value: 400 },
    { name: 'Electrical', value: 300 },
    { name: 'Cleaning', value: 300 },
    { name: 'Carpentry', value: 200 },
  ]

  const stats = {
    workersSupported,
    jobsCompleted,
    totalEarnings: invoiceAgg._sum.labourCharge || 0,
    avgRating: ratingAgg._avg.overall ? ratingAgg._avg.overall.toFixed(1) : "N/A",
    ratingCount: ratingAgg._count._all
  }

  return <ImpactClient stats={stats} chartData={defaultData} />
}
