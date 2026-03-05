
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    const transporter = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOST') || 'mail.petgoh.com.br',
      port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: Deno.env.get('SMTP_USER') || 'petgohsupabase@petgoh.com.br',
        pass: Deno.env.get('SMTP_PASS'),
      },
    });

    const info = await transporter.sendMail({
      from: `"${Deno.env.get('SENDER_NAME') || 'PetGoH'}" <${Deno.env.get('SMTP_USER') || 'petgohsupabase@petgoh.com.br'}>`,
      to,
      subject,
      html,
    });

    return new Response(JSON.stringify(info), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
