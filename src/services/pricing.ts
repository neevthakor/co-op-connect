import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export interface EstimatePriceParams {
  categoryId: string;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  distance: number;
}

export async function estimatePrice(params: EstimatePriceParams) {
  const { categoryId, description, urgency, distance } = params;

  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new Error('Service category not found');
  }

  const basePrice = category.basePrice || 500;
  
  // Urgency multiplier
  let urgencyMultiplier = 1.0;
  if (urgency === 'MEDIUM') urgencyMultiplier = 1.2;
  if (urgency === 'HIGH') urgencyMultiplier = 1.5;
  if (urgency === 'EMERGENCY') urgencyMultiplier = 2.0;

  // Complexity estimation based on description length/keywords (mock)
  let complexityMultiplier = 1.0;
  if (description.length > 200) complexityMultiplier = 1.3;

  // Travel cost (e.g., 10 INR per km)
  const travelCost = distance * 10;
  
  const labourMin = basePrice * urgencyMultiplier * complexityMultiplier * 0.8;
  const labourMax = basePrice * urgencyMultiplier * complexityMultiplier * 1.2;
  
  const estimatedMaterials = 0; // Baseline, can vary

  const minTotal = labourMin + travelCost + estimatedMaterials;
  const maxTotal = labourMax + travelCost + estimatedMaterials;

  return {
    min: Math.round(minTotal),
    max: Math.round(maxTotal),
    breakdown: {
      labour: { min: Math.round(labourMin), max: Math.round(labourMax) },
      travel: Math.round(travelCost),
      materials: estimatedMaterials
    },
    currency: 'INR',
    isEstimate: true
  };
}
