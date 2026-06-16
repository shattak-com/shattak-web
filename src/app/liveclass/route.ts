import { NextResponse } from 'next/server';

const CLASS_NOTES_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Iq2tNt35Xm9CSi8xFxKoSc?s=sh&p=a&mlu=4';

export const GET = () => NextResponse.redirect(CLASS_NOTES_WHATSAPP_GROUP_URL, 302);
