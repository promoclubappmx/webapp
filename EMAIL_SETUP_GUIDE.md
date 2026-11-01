# IMPORTANT: Email Configuration Required

This implementation creates the database structure and UI for staff email confirmation, but **email sending requires additional configuration**.

## Current Implementation

✅ **What's Working:**
- Database migration with email confirmation tracking
- Staff creation form with "Send invitation" checkbox
- Email confirmation page at `/staff-confirmation`
- Status management (pending → active after confirmation)
- Resend invitation functionality
- Complete UI flow

⚠️ **What Needs Configuration:**
- Actual email sending (currently only generates invitation URLs in console)

## Email Setup Options

### Option 1: Supabase Email Templates (Recommended)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Create a custom email template for staff invitations
3. Use Supabase's built-in email service
4. Configure SMTP settings if using custom domain

### Option 2: Edge Function with Email Service

Create a Supabase Edge Function to send emails:

```typescript
// supabase/functions/send-staff-invitation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { email, fullName, invitationUrl } = await req.json()
  
  // Use your email service (SendGrid, Resend, etc.)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@yourcompany.com',
      to: email,
      subject: 'Invitación al equipo - PromoClub',
      html: `
        <h1>¡Bienvenido ${fullName}!</h1>
        <p>Has sido invitado a unirte al equipo.</p>
        <a href="${invitationUrl}">Confirmar mi correo</a>
      `
    })
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Then update `src/pages/staff-management/index.jsx`:

```javascript
// After creating staff member
if (staffData?.sendInvitation && insertedStaff) {
  const invitationUrl = `${window.location.origin}/staff-confirmation?token=${insertedStaff?.invitation_token}`;
  
  // Call edge function to send email
  await supabase.functions.invoke('send-staff-invitation', {
    body: {
      email: staffData?.email,
      fullName: staffData?.fullName,
      invitationUrl
    }
  });
}
```

### Option 3: Backend API Integration

If you have a separate backend:

1. Create an API endpoint to send emails
2. Call it from the React app after staff creation
3. Pass invitation URL and staff details

## Testing Without Email

For testing, invitation URLs are logged to the browser console:

1. Create a new staff member with "Send invitation" checked
2. Open browser console (F12)
3. Copy the invitation URL from console logs
4. Paste it in browser to test confirmation flow

## Production Checklist

- [ ] Configure email service (Supabase, SendGrid, Resend, etc.)
- [ ] Set up email templates with branding
- [ ] Test email delivery
- [ ] Configure SPF/DKIM records for custom domain
- [ ] Set up email rate limiting
- [ ] Monitor email delivery logs

## Current Behavior

Without email configuration:
- Staff members are created with "pending" status
- Invitation URLs are generated and logged to console
- Admins can manually share invitation links
- Confirmation page works correctly when URL is accessed
- Status changes to "active" after confirmation