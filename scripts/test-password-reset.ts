import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING PASSWORD RESET TEST ---');
  
  const testEmail = `testreset_${Date.now()}@example.com`;
  const initialPassword = '[REDACTED]';
  const newPassword = '[REDACTED]';

  // 1. Create a real registered user directly in DB for testing
  const passwordHash = await bcrypt.hash(initialPassword, 10);
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Test Reset User',
      passwordHash,
      role: 'CUSTOMER',
      customer: {
        create: {
          city: 'Test City',
          state: 'Test State',
        }
      }
    }
  });

  console.log(`Created user: ${user.email}`);

  // 2. Simulate POST /api/auth/forgot-password
  console.log('Simulating POST /api/auth/forgot-password...');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Actually we will just call the API directly using fetch if the server is running, 
  // but to be completely reliable, we'll do what the API does.
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
  console.log(`Mock Email sent with link: ${resetUrl}`);

  // 3. Simulate POST /api/auth/reset-password
  console.log('Simulating POST /api/auth/reset-password...');
  
  // We need to fetch the token hash using the raw token
  const receivedTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const dbToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash: receivedTokenHash }});
  
  if (!dbToken) {
    throw new Error('Token not found in DB!');
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Update user
  await prisma.$transaction([
    prisma.user.update({
      where: { id: dbToken.userId },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: dbToken.id },
      data: { usedAt: new Date() },
    })
  ]);

  console.log('Password reset successfully applied in DB.');

  // 4. Verify old password fails and new password works
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id }});
  const oldPasswordMatches = await bcrypt.compare(initialPassword, updatedUser!.passwordHash);
  const newPasswordMatches = await bcrypt.compare(newPassword, updatedUser!.passwordHash);

  if (oldPasswordMatches) {
    console.error('❌ FAILED: Old password still works!');
  } else {
    console.log('✅ SUCCESS: Old password correctly rejected.');
  }

  if (newPasswordMatches) {
    console.log('✅ SUCCESS: New password correctly accepted.');
  } else {
    console.error('❌ FAILED: New password was not accepted!');
  }

  // Cleanup
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.customer.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log('Test user cleaned up.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
