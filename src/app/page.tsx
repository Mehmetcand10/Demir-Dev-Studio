import HomeLandingExperience from "@/components/home/HomeLandingExperience";

export default function Home() {
  const city = process.env.NEXT_PUBLIC_TRUST_CITY || "Ankara";
  const approvedBoutiques = process.env.NEXT_PUBLIC_TRUST_APPROVED_BOUTIQUES || null;
  const approvedWholesalers = process.env.NEXT_PUBLIC_TRUST_APPROVED_WHOLESALERS || null;

  return (
    <HomeLandingExperience
      city={city}
      approvedBoutiques={approvedBoutiques}
      approvedWholesalers={approvedWholesalers}
    />
  );
}
