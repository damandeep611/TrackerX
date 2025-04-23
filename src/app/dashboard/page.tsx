import { getSkillCard } from "@/actions/skillCardAction";
import SkillDashboard from "@/components/dashboard/skillcomponents/all-skill-cards";

export default async function DashboardPage() {
  const skillData = await getSkillCard();
  return (
    <div>
      <SkillDashboard skillcards={skillData} />
    </div>
  );
}
