import type { Metadata } from "next"
import PartnersPageClient from "./PartnersPageClient"

export const metadata: Metadata = {
  title: "Affiliate Partners Program | SealClub Beauty",
  description:
    "Join the SealClub Beauty affiliate program and earn commissions by promoting our skincare and wellness essentials. No eligibility criteria - anyone can apply!",
}

export default function PartnersPage() {
  return <PartnersPageClient />
}
