import { NextResponse } from 'next/server';

const COMMUNITY_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/HAJw2OeRrey4Ydy8Bt4RtT?s=cl&p=a&mlu=4';

export const GET = () => NextResponse.redirect(COMMUNITY_WHATSAPP_GROUP_URL, 302);
