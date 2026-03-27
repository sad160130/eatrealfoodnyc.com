import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold">Restaurant not found</h1>
      <p className="mt-3 text-gray-500">
        The restaurant you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 transition-colors"
      >
        Back to homepage
      </Link>
    </main>
  )
}
