import { AppDataSource } from "../data-source";
import { MatchRound } from "../entity/Match";
import { getMatchesByRound } from "../service/match_service";
import { run, getAllUsers, runTippingSimulation, runMatchPlaySimulation } from './simulate_general'

console.log(`
 |-----------------------------------------|\n
 |           simulating round 4            |\n
 |-----------------------------------------|\n
`);


AppDataSource.initialize().then(async () => {
  const users = await getAllUsers()
  const matches = await getMatchesByRound(MatchRound.ROUND_4);

  if (run.tip) {
    await runTippingSimulation(matches, users, MatchRound.ROUND_4);
  }

  if (run.match) {
    await runMatchPlaySimulation(matches, MatchRound.ROUND_4)
  }

  AppDataSource.destroy();
}).catch((e) => {
  console.log('\nerror simulating', e.message);
  console.log(e)
})
