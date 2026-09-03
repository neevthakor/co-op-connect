import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const bucket = type === 'private' ? 'private-uploads' : 'public-uploads';
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(uniqueFileName, buffer, {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

