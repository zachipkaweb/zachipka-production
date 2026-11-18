import Hero from "@/components/home/Hero";
import Climbing from "@/components/home/About_climbing";
import About from "@/components/home/About";
import Community from "@/components/home/Community";
import FirstClass from "@/components/home/First_class";
import Gallary from "@/components/home/Gallary";
import Team from "@/components/home/Team";
import FAQ from "@/components/home/FAQ";
import { getCachedTeam } from "@/lib/cachedData";

export default async function Main() {
  const team = await getCachedTeam();
  return (
    <>
      <Hero/>
      <Climbing/>
      <About/>
      <Community/>
      <FirstClass/>
      <Gallary/>
      <div className="bg-gray">
        <Team teamMembers={team} />
        <FAQ/>
      </div>
    </>
  );
}