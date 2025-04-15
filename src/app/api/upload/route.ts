import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});



export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    
    // Check file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
       return NextResponse.json({ error: 'File size exceeds the 5MB limit.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto', // Automatically detect resource type (image, pdf, etc.)
          folder: 'qr-code-uploads' // Optional: specify a folder in Cloudinary
        }, 
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // Check if uploadResult is valid and contains secure_url
    if (uploadResult && typeof uploadResult === 'object' && 'secure_url' in uploadResult) {
      const secureUrl = (uploadResult as { secure_url: string }).secure_url;
      return NextResponse.json({ secure_url: secureUrl }, { status: 200 });
    } else {
      console.error('Cloudinary Upload Failed: No result or secure_url found');
      return NextResponse.json({ error: 'Upload failed after processing.' }, { status: 500 });
    }

  } catch (error) {
    console.error('API Route Error:', error);
    // Determine if the error is a Cloudinary API error or something else
    let errorMessage = 'An unknown error occurred during upload.';
    const statusCode = 500;

    if (error instanceof Error) {
       errorMessage = error.message;
       // You might want to check for specific error types or codes from Cloudinary
       // if (error.http_code === 401) { ... }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 