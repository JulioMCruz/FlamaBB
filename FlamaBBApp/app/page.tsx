import { AppRouter } from "@/components/app-router"
import { FarcasterReadySignal } from "@/components/farcaster-ready"

export default function HomePage() {
  return (
    <>
      <AppRouter />
      <FarcasterReadySignal />
    </>
  )
}
