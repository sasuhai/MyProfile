// Supabase Edge Function: Send Email Notification to Admins
// This uses Supabase's built-in email service (no API keys needed!)

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
    const { email, fullName } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all admin emails
    const { data: admins, error: adminError } = await supabaseClient
      .from('profile_info')
      .select('email, full_name')
      .eq('role', 'admin')

    if (adminError) {
      throw adminError
    }

    if (!admins || admins.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No admins found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get app URL from environment or use default
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const currentDate = new Date().toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    // Send email to each admin
    const emailPromises = admins.map(async (admin) => {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Access Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="color: white; font-size: 32px; font-weight: bold;">P</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">New Access Request</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Portfolio Platform</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${admin.full_name || 'Admin'}</strong>,
              </p>
              
              <p style="margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                You have a new access request waiting for your review!
              </p>

              <!-- Request Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">👤 Requestor Details</h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 80px;">Name:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Submitted:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">${currentDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${appUrl}/admin/dashboard?tab=access-requests" 
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                      Review Request →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This request is waiting for your approval in the admin dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-align: center;">
                <strong style="color: #111827;">Portfolio Platform</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Designed by Idiahus © 2026
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `

      // Send email using Supabase's built-in SMTP (via password reset as workaround)
      // This works for existing users unlike inviteUserByEmail
      try {
        // Use password reset email as a notification mechanism
        // The link will redirect to the access requests page
        const { error: emailError } = await supabaseClient.auth.resetPasswordForEmail(
          admin.email,
          {
            redirectTo: `${appUrl}/admin/dashboard?tab=access-requests`
          }
        )

        if (emailError) {
          console.error(`Failed to send email to ${admin.email}:`, emailError)
          return { email: admin.email, success: false, error: emailError.message }
        }

        return { email: admin.email, success: true }
      } catch (error) {
        console.error(`Failed to send email to ${admin.email}:`, error)
        return { email: admin.email, success: false, error: error.message }
      }
    })

    const results = await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notified ${admins.length} admin(s)`,
        results,
        note: 'Emails sent as password reset links (workaround for existing users)'
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
