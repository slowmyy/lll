// Ce fichier a été supprimé - utiliser /api/fal-proxy à la place
export async function POST(request: Request) {
  return Response.json(
    { error: 'Cette API route est obsolète. Utilisez /api/fal-proxy avec le hook usePixVerse.' },
    { status: 410 }
  );
}

export async function GET(request: Request) {
  return Response.json(
    { error: 'Cette API route est obsolète. Utilisez /api/fal-proxy avec le hook usePixVerse.' },
    { status: 410 }
  );
}
