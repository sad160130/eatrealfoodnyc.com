const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eatrealfoodnyc.com"
const TEAM_URL = `${SITE_URL}/about/team`
const ORG_ID = `${SITE_URL}/#organization`

/** Rohan's LinkedIn is already linked on /about/team. Snket has no public profile on the site. */
const ROHAN_LINKEDIN = "https://www.linkedin.com/in/rohan-kadam-176922204"

export interface FounderPerson {
  "@type": "Person"
  name: "Snket Desai" | "Rohan Kadam"
  jobTitle: "Co-founder"
  url: string
  worksFor: { "@id": string }
  sameAs?: string
}

function person(name: "Snket Desai" | "Rohan Kadam", sameAs?: string): FounderPerson {
  return {
    "@type": "Person",
    name,
    jobTitle: "Co-founder",
    url: TEAM_URL,
    worksFor: { "@id": ORG_ID },
    ...(sameAs ? { sameAs } : {}),
  }
}

/** Organization founder records. Rohan's sameAs is the profile already on the team page. */
export function founderPersons(): FounderPerson[] {
  return [person("Snket Desai"), person("Rohan Kadam", ROHAN_LINKEDIN)]
}

/** Article authors. url points at the team page. No sameAs. */
export function guideAuthors(): Array<Omit<FounderPerson, "sameAs">> {
  return [person("Snket Desai"), person("Rohan Kadam")].map(({ sameAs: _sameAs, ...author }) => author)
}
