// Builds the reminder email (subject, HTML, plain text). Kept free of server imports so it can be unit tested.

export const APP_URL = 'https://reminza.vercel.app'

export interface ReminderEmailInput {
    heading: string
    remindTime: Date
    timezone?: string | null
    recurrence?: string | null
    /** Absolute link the button opens. Defaults to the dashboard. */
    url?: string
}

export function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function validZone(tz?: string | null): string {
    if (!tz) return 'UTC'
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz })
        return tz
    } catch {
        return 'UTC'
    }
}

export function formatReminderTime(date: Date, timezone?: string | null) {
    const timeZone = validZone(timezone)
    const d = new Date(date)
    const time = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
    const day = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d)
    return { time, day, timeZone }
}

function repeatLabel(recurrence?: string | null): string {
    const r = String(recurrence ?? '').toLowerCase()
    return ['daily', 'weekly', 'monthly', 'yearly'].includes(r) ? `Repeats ${r}` : ''
}

export function buildReminderEmail(input: ReminderEmailInput) {
    const heading = String(input.heading ?? '').replace(/\s+/g, ' ').trim() || 'Your reminder'
    const { time, day, timeZone } = formatReminderTime(input.remindTime, input.timezone)
    const repeat = repeatLabel(input.recurrence)
    const url = input.url || `${APP_URL}/dashboard`
    const settingsUrl = `${APP_URL}/profile`

    const subject = `⏰ ${heading}`
    const preheader = `${time} · ${day}${repeat ? ` · ${repeat}` : ''}`

    const h = escapeHtml
    const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

    const repeatRow = repeat
        ? `<tr><td style="padding:0;">
             <span style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:#eef2ff;color:#4f46e5;font-family:${font};font-size:13px;font-weight:600;">&#128257; ${h(repeat)}</span>
           </td></tr>`
        : ''

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${h(subject)}</title>
<style>
  @media only screen and (max-width:600px) {
    .container { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .title { font-size:22px !important; }
    .time { font-size:30px !important; }
    .btn a { display:block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f1f1f6;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f1f1f6;font-size:1px;line-height:1px;">${h(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f1f6" style="background-color:#f1f1f6;">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;">

    <tr><td align="left" style="padding:0 4px 16px 4px;font-family:${font};font-size:18px;font-weight:700;color:#13131e;">
      <span style="display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px;background-color:#6366f1;background-image:linear-gradient(135deg,#6366f1,#9333ea);font-size:16px;vertical-align:middle;">&#9200;</span>
      <span style="vertical-align:middle;padding-left:8px;">Reminza</span>
    </td></tr>

    <tr><td bgcolor="#ffffff" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(19,19,30,0.06);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td height="6" bgcolor="#6366f1" style="height:6px;line-height:6px;font-size:6px;background-color:#6366f1;background-image:linear-gradient(90deg,#6366f1,#9333ea);">&nbsp;</td></tr>
        <tr><td class="px" style="padding:32px 36px 8px 36px;font-family:${font};">
          <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#7c3aed;">Reminder</p>
          <h1 class="title" style="margin:0;font-size:26px;line-height:1.3;font-weight:700;color:#13131e;word-break:break-word;">${h(heading)}</h1>
        </td></tr>

        <tr><td class="px" style="padding:20px 36px 4px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f7fb" style="background-color:#f7f7fb;border:1px solid #ececf3;border-radius:12px;">
            <tr><td style="padding:18px 20px;font-family:${font};">
              <p style="margin:0 0 4px 0;font-size:13px;color:#6b6b80;">It's time</p>
              <p class="time" style="margin:0;font-size:34px;line-height:1.15;font-weight:800;color:#13131e;">${h(time)}</p>
              <p style="margin:6px 0 0 0;font-size:15px;color:#3f3f52;">${h(day)}</p>
              <p style="margin:2px 0 0 0;font-size:12px;color:#9a9aac;">${h(timeZone.replace(/_/g, ' '))}</p>
            </td></tr>
            ${repeatRow ? `<tr><td style="padding:0 20px 18px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0">${repeatRow}</table></td></tr>` : ''}
          </table>
        </td></tr>

        <tr><td class="px btn" align="left" style="padding:24px 36px 34px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#6366f1" style="border-radius:10px;background-color:#6366f1;background-image:linear-gradient(135deg,#6366f1,#9333ea);">
              <a href="${h(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${font};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Open in Reminza &rarr;</a>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>

    <tr><td align="center" style="padding:22px 16px 0 16px;font-family:${font};font-size:12px;line-height:1.6;color:#8a8a9c;">
      You're getting this because email reminders are on in Reminza.<br>
      <a href="${h(settingsUrl)}" target="_blank" style="color:#6366f1;text-decoration:underline;">Turn off email reminders</a>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`

    const text = [
        'REMINZA REMINDER',
        '',
        heading,
        '',
        `Time: ${time}, ${day} (${timeZone})`,
        ...(repeat ? [repeat] : []),
        '',
        `Open in Reminza: ${url}`,
        '',
        '--',
        `You're getting this because email reminders are on. Turn them off in your profile: ${settingsUrl}`,
    ].join('\n')

    return { subject, html, text }
}
