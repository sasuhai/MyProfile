// Supabase Edge Function: Send approval email to user with credentials
// This sends an email to the approved user with their login credentials

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, fullName, username, tempPassword } = await req.json()

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

        // Send email using password reset as notification
        // The user will click the link and be prompted to change their password
        const { error: emailError } = await supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${appUrl}/admin/login`
            }
        )

        if (emailError) {
            console.error(`Failed to send email to ${email}:`, emailError)
            return new Response(
                JSON.stringify({ success: false, error: emailError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Approval email sent to ${email}`,
                note: 'User will receive a password reset email to set their password'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
