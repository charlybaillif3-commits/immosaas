import { auth, currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Bonjour, {user?.firstName ?? 'Agent'} 👋
      </h1>
      <p className="mt-2 text-gray-500">Bienvenue sur ImmoSaaS</p>
    </div>
  )
}
