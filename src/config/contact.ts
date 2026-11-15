/** Published general inbox, already used on /contact. */
export const GENERAL_CONTACT_EMAIL = "hello@eatrealfoodnyc.com"

/** Published press inbox, already used on /press. */
export const PRESS_CONTACT_EMAIL = "press@eatrealfoodnyc.com"

/**
 * Partnership inquiries use the existing contact route and the published
 * general inbox. The site has no dedicated partnerships address.
 *
 * TODO: if a partnerships inbox is created and published (the media-kit
 * draft suggested partners@eatrealfoodnyc.com, which is not live), point
 * PARTNER_INQUIRY_EMAIL at that address. Do not invent one before then.
 */
export const PARTNER_INQUIRY_EMAIL = GENERAL_CONTACT_EMAIL

export const PARTNER_INQUIRY_PATH = "/contact"
