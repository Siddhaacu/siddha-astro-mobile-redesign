import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

export default async (req) => {
  if(req.method!=='POST')return new Response('Method Not Allowed',{status:405});
  try{
    const subscription=await req.json();
    if(!subscription?.endpoint||!subscription?.keys?.p256dh||!subscription?.keys?.auth)throw new Error('Invalid push subscription');
    const id=crypto.createHash('sha256').update(subscription.endpoint).digest('hex');
    const store=getStore('siddha-push-subscriptions');
    await store.setJSON(`subscription/${id}`,subscription,{metadata:{updatedAt:new Date().toISOString()}});
    return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json'}});
  }catch(error){return new Response(JSON.stringify({ok:false,error:'invalid-subscription'}),{status:400,headers:{'content-type':'application/json'}});}
};
