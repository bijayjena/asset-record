import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, brand, category } = await req.json();

    if (!name || !brand) {
      return new Response(
        JSON.stringify({ error: 'Name and brand are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!GOOGLE_SEARCH_ENGINE_ID) {
      console.error('GOOGLE_SEARCH_ENGINE_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'Google Search Engine ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query with gadget details
    let searchQuery = `${brand} ${name} ${category || ''} product`.trim();

    // optimize for phones to get cleaner product shots
    if (category === 'phone') {
      searchQuery = `${brand} ${name} official commercial white background`.trim();
    }

    console.log('Searching for image:', searchQuery);

    // Google Custom Search API for images
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    searchUrl.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('searchType', 'image');
    searchUrl.searchParams.set('num', '1');
    searchUrl.searchParams.set('safe', 'active');
    searchUrl.searchParams.set('imgSize', 'large');

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to search for image', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Search results:', JSON.stringify(data).slice(0, 500));

    // Extract the first image URL
    const imageUrl = data.items?.[0]?.link || null;

    if (!imageUrl) {
      console.log('No image found for query:', searchQuery);
      return new Response(
        JSON.stringify({ imageUrl: null, message: 'No image found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found image URL:', imageUrl);
    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-gadget-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
