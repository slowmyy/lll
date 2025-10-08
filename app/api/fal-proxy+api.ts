export async function GET(request: Request) {
  return handleFalProxy(request);
}

export async function POST(request: Request) {
  return handleFalProxy(request);
}

async function handleFalProxy(request: Request) {
  try {
    const targetUrl = request.headers.get('x-fal-target-url');

    if (!targetUrl) {
      return Response.json(
        { error: 'Header x-fal-target-url manquant' },
        { status: 400 }
      );
    }

    const parsedUrl = new URL(targetUrl);
    const isValidDomain =
      parsedUrl.hostname.endsWith('fal.ai') ||
      parsedUrl.hostname.endsWith('fal.run');

    if (!isValidDomain) {
      return Response.json(
        { error: 'Domaine non autorisé' },
        { status: 403 }
      );
    }

    const FAL_KEY = process.env.FAL_KEY || '6b5a8a7b-af78-4ca9-8466-c615058704d7:2b917d6d1974fc55ce7302b01f9319c7';

    if (!FAL_KEY) {
      console.error('FAL_KEY non configurée dans les variables serveur');
      return Response.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    const body = request.method === 'POST'
      ? await request.text()
      : undefined;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur fal.ai:', response.status, errorText);

      return Response.json(
        {
          error: 'Erreur de génération',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data, {
      status: response.status
    });

  } catch (error: any) {
    console.error('Erreur proxy fal.ai:', error);
    return Response.json(
      { error: 'Erreur interne du proxy', message: error.message },
      { status: 500 }
    );
  }
}
