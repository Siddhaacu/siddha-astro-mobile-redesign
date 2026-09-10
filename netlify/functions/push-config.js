export default async () => {
  return new Response(JSON.stringify({ publicKey: process.env.VAPID_PUBLIC_KEY || '' }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
};
