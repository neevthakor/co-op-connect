import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const bucket = type === 'private' ? 'private-uploads' : 'public-uploads';
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Photo upload failed: Supabase storage is not configured on this server.' },
        { status: 500 }
      );
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
        }
        
        // Validate type
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 });
        }

        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(uniqueFileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          throw error;
        }

        let url = '';
        if (type === 'private') {
          const { data: signedData, error: signError } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(uniqueFileName, 3600);
          if (signError) throw signError;
          url = signedData.signedUrl;
        } else {
          const { data: publicData } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(uniqueFileName);
          url = publicData.publicUrl;
        }

        return NextResponse.json({
          url,
          fileName: file.name,
          size: file.size,
          type: file.type,
        });
      }
    }

    return NextResponse.json({ error: 'No file found in request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

