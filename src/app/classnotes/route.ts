import { NextResponse } from 'next/server';

const LIVE_CLASS_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/EyOvPrtkPg5J76YVu4GJNC';

export const GET = () => NextResponse.redirect(LIVE_CLASS_WHATSAPP_GROUP_URL, 302);
