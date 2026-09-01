import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        return NextResponse.json({
          url: `/uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          fileName: file.name,
          size: file.size,
          type: file.type,
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const fileName = body.fileName || 'upload.jpg';
    return NextResponse.json({
      url: `/uploads/${Date.now()}-${fileName}`,
      fileName,
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

