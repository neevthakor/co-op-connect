import { requireRolePage, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import GovernanceClient from "./GovernanceClient";

export const dynamic = "force-dynamic";

export default async function FederationGovernancePage() {
  const sessionUser = await requireRolePage("FEDERATION_ADMIN", "ADMIN");
  const scope = await getScope(sessionUser);

  const proposals = await prisma.cooperativeProposal.findMany({
    where: scope.role === "ADMIN" ? {} : { cooperativeId: { in: scope.cooperativeIds } },
    include: {
      createdBy: { select: { name: true } },
      cooperative: { select: { name: true } },
      votes: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const cooperatives = await prisma.cooperative.findMany({
    where: scope.role === "ADMIN" ? {} : { id: { in: scope.cooperativeIds } },
    select: { id: true, name: true }
  });

  const formattedProposals = proposals.map(p => {
    let yes = 0, no = 0, abstain = 0;
    let userVote = null;
    
    for (const v of p.votes) {
      if (v.vote === "YES") yes++;
      else if (v.vote === "NO") no++;
      else if (v.vote === "ABSTAIN") abstain++;

      if (v.userId === sessionUser.id) {
        userVote = v.vote;
      }
    }

    return {
      ...p,
      tally: { yes, no, abstain },
      userVote
    };
  });

  return <GovernanceClient proposals={formattedProposals} cooperatives={cooperatives} />;
}
