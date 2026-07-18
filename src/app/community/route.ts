import { NextResponse } from 'next/server';

const COMMUNITY_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/ILfI7DA0EtD9COLq2RbIx4?s=cl&p=a&mlu=4';

export const GET = () => NextResponse.redirect(COMMUNITY_WHATSAPP_GROUP_URL, 302);
