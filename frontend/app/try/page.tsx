import { Canvas } from '@/components/canvas/Canvas'
import { UserMenu } from '@/components/auth/UserMenu'

// Anonymous, local-first canvas (what `/` used to be). Open to everyone.
export default function TryPage() {
  return (
    <main className="relative flex flex-col flex-1 h-full overflow-hidden">
      <div className="absolute right-4 top-4 z-30">
        <UserMenu />
      </div>
      <Canvas />
    </main>
  )
}
