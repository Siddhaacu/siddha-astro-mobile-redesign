import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

export default async () => {
  const publicKey=process.env.VAPID_PUBLIC_KEY;
  const privateKey=process.env.VAPID_PRIVATE_KEY;
  const subject=process.env.VAPID_SUBJECT||'mailto:admin@siddhaastro.in';
  if(!publicKey||!privateKey)return new Response(JSON.stringify({ok:false,error:'VAPID keys are not configured'}),{status:200,headers:{'content-type':'application/json'}});
  webpush.setVapidDetails(subject,publicKey,privateKey);
  const store=getStore('siddha-push-subscriptions');
  const {blobs}=await store.list({prefix:'subscription/'});
  let sent=0,removed=0,failed=0;
  const date=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  const payload=JSON.stringify({title:'Siddha Astro Panchangam',body:`Today’s Panchangam is ready • ${date}`,url:'/panchangam.html'});
  for(const blob of blobs){
    const subscription=await store.get(blob.key,{type:'json'});
    if(!subscription)continue;
    try{await webpush.sendNotification(subscription,payload,{TTL:86400,urgency:'normal'});sent++;}
    catch(error){failed++;if(error?.statusCode===404||error?.statusCode===410){await store.delete(blob.key);removed++;}}
  }
  return new Response(JSON.stringify({ok:true,sent,removed,failed}),{headers:{'content-type':'application/json'}});
};
