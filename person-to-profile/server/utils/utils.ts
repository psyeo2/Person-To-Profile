const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const json = (data: any, status = 200): Response =>
  new Response(JSON.stringify(data), { status, headers: corsHeaders });

export const noContent = (status = 204): Response =>
  new Response(null, { status, headers: corsHeaders });

export const getBody = async (request: Request): Promise<any> => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};
