# Revena Media Solar

Static marketing site for Revena Media's solar and battery lead generation.
Plain HTML, CSS and JavaScript. No build step.

## Deploy

Vercel, as a static site. No framework, no build command, output directory is
the repository root. `vercel.json` turns on `cleanUrls`, so `leads.html` is
served at `/leads`, which is what every internal link and canonical tag uses.

## Structure

    index.html                  home
    leads.html                  pay per lead
    appointments.html           pay per appointment
    solar-marketing.html        keyword hub
    solar-lead-generation.html  keyword hub
    solar-battery-leads.html    keyword hub
    residential-*.html          industries
    commercial-*.html
    web-design.html             services
    ai-systems.html
    guides.html                 guides hub
    guide-*.html                4 articles
    locations.html              locations hub
    solar-leads-{state}.html    8 state pages
    solar-leads-{city}.html     16 city pages
    about.html contact.html
    client-portal.html          noindex
    404.html                    noindex
    assets/                     styles.css, app.js, images

44 pages, 42 in the sitemap.

## Contact form

The quiz on `/contact` POSTs JSON to a GoHighLevel inbound webhook. The URL
lives in `assets/app.js` as `QUIZ_HOOK`. Fields sent: first_name, last_name,
full_name, company, email, phone, notes, business_type, interested_in, source,
page, submitted_at.

## Domain

Built for `revenamedia.com` at the root. Canonical tags, the sitemap and
robots.txt all reference that origin. If the domain changes, update those
three things together.
