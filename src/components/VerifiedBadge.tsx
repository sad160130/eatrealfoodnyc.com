import { CheckCircle2 } from "lucide-react"

export default function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-jade/10 px-2 py-0.5 text-xs font-medium text-jade">
      <CheckCircle2 className="h-3 w-3" />
      Verified
    </span>
  )
}
