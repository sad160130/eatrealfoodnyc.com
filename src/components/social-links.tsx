interface SocialLinksProps {
  variant?: "footer" | "light"
  showLabels?: boolean
  className?: string
}

export default function SocialLinks({
  variant = "footer",
  showLabels = false,
  className = "",
}: SocialLinksProps) {
  const isDark = variant === "footer"

  const iconBase = isDark
    ? "text-white/50 hover:text-white"
    : "text-gray-500 hover:text-forest"

  const labelColor = isDark ? "text-white/50" : "text-gray-500"

  const profiles = [
    {
      name: "Instagram",
      handle: "@nyc_healthyeats",
      href: "https://www.instagram.com/nyc_healthyeats/",
      hoverColor: "hover:text-[#E1306C]",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      handle: "@EatRealFoodNYC",
      href: "https://www.youtube.com/@EatRealFoodNYC",
      hoverColor: "hover:text-[#FF0000]",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {profiles.map((profile) => (
        <a
          key={profile.name}
          href={profile.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow Eat Real Food NYC on ${profile.name}`}
          title={`${profile.name} — ${profile.handle}`}
          className={`group flex items-center gap-2 transition-colors duration-200 ${iconBase} ${profile.hoverColor}`}
        >
          <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
            {profile.icon}
          </span>
          {showLabels && (
            <span className={`text-xs font-medium ${labelColor} group-hover:text-current`}>
              {profile.handle}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}
