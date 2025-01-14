import { MoreThanOrEqual, IsNull } from 'typeorm'
import { AppDataSource } from "../data-source"
import { Match, MatchStatus, MatchRound } from "../entity/Match";
import { queueProcessMatch } from '../jobs'
import { year as configYear } from '../games/parser/parse_config'
import { createTip } from './tip_service';
import { User } from '../entity/User';
import { Tip } from '../entity/Tip';

export const getMatchRepo = () => {
  return AppDataSource.getRepository(Match)
}

export const getTodayMatches = async (year = configYear) => {
  const date = new Date();
  return await getMatchRepo().find({
    where: {
      date,
      year
    },
    order: {
      date: 'ASC',
      time: 'ASC'
    }
  })
}

export const getAllMatches = async (status: MatchStatus | null, year = configYear) => {
  if (status) {
    return await getMatchRepo().find({
      where: {
        status,
        year
      },
      order: {
        number: 'ASC'
      }
    })
  } else {
    return await getMatchRepo().find({
      order: {
        number: 'ASC'
      }
    })
  }
}

export const getTodayOpenMatches = async (userOrId: number | User, year = configYear) => {
  const date = new Date();

  const result = await getMatchRepo().createQueryBuilder('match')
    .where('match.date >= :date', { date })
    .where('match.status = :status', { status: MatchStatus.OPEN })
    .leftJoinAndSelect('match.tips', 'tips', 'tips.userId = :userId', { userId: (typeof userOrId === 'object') ? userOrId.id : userOrId })
    .leftJoinAndSelect('match.countryA', 'countryA', 'countryA.id = match.countryAId')
    .leftJoinAndSelect('match.countryB', 'countryB', 'countryB.id = match.countryBId')
    .leftJoinAndSelect('match.winner', 'winner', 'winner.id = match.winnerId')
    .orderBy('match.number', 'ASC')
    .getMany()

  for (const index in result) {
    if (result[index].tips.length <= 0) {
      (result[index] as Match & { tip: Tip }).tip = await createTip(year)
    } else {
      (result[index] as Match & { tip: Tip }).tip = result[index].tips.pop();
    }
  }

  return result;
}

export const getMatchesByStatus = async (status: MatchStatus, userOrId: User | null, year = configYear) => {
  if (userOrId) {
    const result = await getMatchRepo().createQueryBuilder('match')
      .where('match.status = :status', { status })
      .leftJoinAndSelect('match.tips', 'tips', 'tips.userId = :userId', { userId: (typeof userOrId === 'object') ? userOrId.id : userOrId })
      .leftJoinAndSelect('match.countryA', 'countryA', 'countryA.id = match.countryAId')
      .leftJoinAndSelect('match.countryB', 'countryB', 'countryB.id = match.countryBId')
      .leftJoinAndSelect('match.winner', 'winner', 'winner.id = match.winnerId')
      .orderBy('match.number', 'ASC')
      .getMany();

    for (const index in result) {
      if (result[index].tips.length <= 0) {
        (result[index] as Match & { tip: Tip }).tip = await createTip(year)
      } else {
        (result[index] as Match & { tip: Tip }).tip = result[index].tips.pop();
      }
    }
    return result;
  }

  return await getMatchRepo().find({
    where: {
      status,
      year,
    },
    order: {
      number: 'DESC'
    }
  })
}

export const getMatchById = async (matchId: number) => {
  return await getMatchRepo().findOne({ where: { id: matchId } })
}

export const matchHasNotExpire = (match: Match) => {
  const now = new Date()
  const matchDateTime = new Date(`${match.date}T${match.time}Z`);

  // now.setUTCHours(matchDateTime.getUTCHours())
  // now.setUTCMinutes(matchDateTime.getUTCMinutes())
  // now.setUTCSeconds(matchDateTime.getUTCSeconds())
  // now.setMilliseconds(0)

  // console.log(`(${matchDateTime.getUTCDate()} >= ${now.getUTCDate()}), (${matchDateTime.getUTCMonth()} >= ${now.getUTCMonth()}), (${matchDateTime.getUTCFullYear()} === ${now.getUTCFullYear()}), (${matchDateTime.getTime()} > ${now.getTime()})`);

  if ((matchDateTime.getTime() > now.getTime())) {
    return true;
  }

  return false;
}

export const updateMatch = async (matchId: number, data: { [key: string]: unknown }) => {
  const match = await getMatchById(matchId);

  if (match) {
    for (const key in data) {
      let value = data[key];
      switch (key) {
        case 'winner':
          if ((value as { id: number }).id === 0) {
            data[key] = null
          }
          break;
        case 'countryAGoals':
        case 'countryBGoals':
        case 'countryAPenaltyGoals':
        case 'countryBPenaltyGoals':
          data[key] = value || 0;
          break;
      }
    }

    await getMatchRepo().update({
      id: match.id
    }, data);

    queueProcessMatch(match.id);

    return {
      success: true,
      match: await getMatchById(match.id)
    }
  }

  return {
    success: false,
    code: 'match_not_found',
    message: `match with ID ${matchId} not found`,
    match: null
  }
}

export const getGroupedMatches = async (year = configYear): Promise<Record<string, Match[]>> => {
  const grouped = {};
  const result = await getMatchRepo().find({
    where: {
      round: MatchRound.GROUP,
      year
    },
    order: {
      number: 'ASC'
    }
  })

  result.forEach((match) => {
    const letter = match.countryA.internalId[0]
    if (grouped[letter] === undefined) {
      grouped[letter] = []
    }
    grouped[letter].push(match)
  })

  return grouped
}

export const getMatchesByRound = async (round: MatchRound, year = configYear) => {
  return await getMatchRepo().find({
    where: {
      round,
      year
    },
    order: {
      number: 'ASC'
    }
  })
}


export const getRoundMatchWithEmptyCountries = async (round: MatchRound, year = configYear) => {
  return await getMatchRepo().find({
    where: [
      { countryA: IsNull(), round, year },
      { countryB: IsNull(), round, year }
    ],
    order: {
      number: 'ASC'
    }
  })

}