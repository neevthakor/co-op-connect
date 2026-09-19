import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  {
    trade: 'Electrician',
    question: 'What should you do before working on an electrical circuit?',
    answerType: 'TEXT'
  },
  {
    trade: 'Electrician',
    question: 'What is the purpose of an MCB?',
    answerType: 'TEXT'
  },
  {
    trade: 'Electrician',
    question: 'What is the difference between earthing and neutral?',
    answerType: 'TEXT'
  },
  {
    trade: 'Electrician',
    question: 'What safety equipment should be used while performing electrical work?',
    answerType: 'TEXT'
  },
  {
    trade: 'Electrician',
    question: 'What would you check if an MCB repeatedly trips?',
    answerType: 'TEXT'
  },
  {
    trade: 'Plumber',
    question: 'What is the purpose of a shut-off valve?',
    answerType: 'TEXT'
  },
  {
    trade: 'Plumber',
    question: 'How would you locate a concealed pipe leak?',
    answerType: 'TEXT'
  },
  {
    trade: 'Plumber',
    question: 'What safety precautions do you follow when repairing plumbing?',
    answerType: 'TEXT'
  },
  {
    trade: 'Plumber',
    question: 'Which tools do you commonly use?',
    answerType: 'TEXT'
  },
  {
    trade: 'Plumber',
    question: 'How would you diagnose low water pressure?',
    answerType: 'TEXT'
  },
  {
    trade: 'AC Repair',
    question: 'What can cause an AC to stop cooling?',
    answerType: 'TEXT'
  },
  {
    trade: 'AC Repair',
    question: 'What safety steps are required before servicing an AC?',
    answerType: 'TEXT'
  },
  {
    trade: 'AC Repair',
    question: 'What is the purpose of refrigerant?',
    answerType: 'TEXT'
  },
  {
    trade: 'AC Repair',
    question: 'Which components commonly need inspection during servicing?',
    answerType: 'TEXT'
  },
  {
    trade: 'AC Repair',
    question: 'How would you diagnose abnormal compressor behaviour?',
    answerType: 'TEXT'
  },
  {
    trade: 'Carpenter',
    question: 'What safety gear is essential when operating a power saw?',
    answerType: 'TEXT'
  },
  {
    trade: 'Carpenter',
    question: 'How do you ensure a joint is perfectly square?',
    answerType: 'TEXT'
  },
  {
    trade: 'Carpenter',
    question: 'What type of wood is best suited for outdoor furniture?',
    answerType: 'TEXT'
  },
  {
    trade: 'Painter',
    question: 'How do you prepare a wall with peeling paint before applying a new coat?',
    answerType: 'TEXT'
  },
  {
    trade: 'Painter',
    question: 'What is the purpose of using a primer?',
    answerType: 'TEXT'
  },
  {
    trade: 'Cleaner',
    question: 'What chemicals should never be mixed while cleaning?',
    answerType: 'TEXT'
  },
  {
    trade: 'Cleaner',
    question: 'How do you safely clean electronic appliances?',
    answerType: 'TEXT'
  },
  {
    trade: 'Appliance Repair',
    question: 'What is the first step in diagnosing a washing machine that won\'t spin?',
    answerType: 'TEXT'
  },
  {
    trade: 'Appliance Repair',
    question: 'How do you safely discharge a capacitor?',
    answerType: 'TEXT'
  },
  {
    trade: 'Caregiver',
    question: 'How do you handle a patient who refuses medication?',
    answerType: 'TEXT'
  },
  {
    trade: 'Caregiver',
    question: 'What are the basic vital signs you should monitor for an elderly patient?',
    answerType: 'TEXT'
  },
  {
    trade: 'Caregiver',
    question: 'What would you do in case of a medical emergency while caring for a patient?',
    answerType: 'TEXT'
  },
  {
    trade: 'Driver',
    question: 'What documents must you carry while driving commercially?',
    answerType: 'TEXT'
  },
  {
    trade: 'Driver',
    question: 'How do you handle a tyre blowout at high speed?',
    answerType: 'TEXT'
  },
  {
    trade: 'Driver',
    question: 'What basic vehicle checks do you perform before starting a trip?',
    answerType: 'TEXT'
  },
  {
    trade: 'Technician',
    question: 'How do you diagnose a fault when a device does not power on?',
    answerType: 'TEXT'
  },
  {
    trade: 'Technician',
    question: 'What safety precautions do you take when working with electronic equipment?',
    answerType: 'TEXT'
  },
  {
    trade: 'Technician',
    question: 'How would you explain a technical repair to a non-technical customer?',
    answerType: 'TEXT'
  },
  {
    trade: 'Gardener',
    question: 'How do you determine the watering needs of different plant types?',
    answerType: 'TEXT'
  },
  {
    trade: 'Gardener',
    question: 'What organic methods can be used for pest control in a garden?',
    answerType: 'TEXT'
  },
  {
    trade: 'Gardener',
    question: 'How do you prepare soil for planting seasonal flowers?',
    answerType: 'TEXT'
  },
  {
    trade: 'Pest Control',
    question: 'What safety precautions must be taken when applying pesticides indoors?',
    answerType: 'TEXT'
  },
  {
    trade: 'Pest Control',
    question: 'How do you identify a termite infestation?',
    answerType: 'TEXT'
  },
  {
    trade: 'Pest Control',
    question: 'What is the difference between gel baiting and spray treatment for cockroaches?',
    answerType: 'TEXT'
  },
  {
    trade: 'Waterproofing',
    question: 'What are the common causes of water seepage in buildings?',
    answerType: 'TEXT'
  },
  {
    trade: 'Waterproofing',
    question: 'What surface preparation is required before applying waterproofing chemicals?',
    answerType: 'TEXT'
  },
  {
    trade: 'Waterproofing',
    question: 'How do you determine whether to use membrane-based or chemical-based waterproofing?',
    answerType: 'TEXT'
  }
];

async function main() {
  console.log('Seeding questions...');
  for (const q of questions) {
    const existing = await prisma.skillVerificationQuestion.findFirst({
      where: { trade: q.trade, question: q.question }
    });
    if (!existing) {
      await prisma.skillVerificationQuestion.create({
        data: q
      });
    }
  }
  console.log('Questions seeded.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
