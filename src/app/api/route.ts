export async function GET(request: Request) {
    return new Response(JSON.stringify({ message: 'Api is Running' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}