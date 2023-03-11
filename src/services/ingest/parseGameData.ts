import { IGameStat } from '../../repositories/db/models/GameStat'

export function parseGameData(data: any, throwIfError: boolean=false) {
  let gameStats: IGameStat[] = []
  
  const teams = [data.liveData.boxscore.teams.away, data.liveData.boxscore.teams.home]
  teams.forEach((team: any, i: number) => {
    for (const playerId in team.players){
      const player = team.players[playerId];
      const statKey = player.position.name == 'Goalie' ? 'goalieStats' : 'skaterStats';
      try{
        const newRecord: IGameStat = {
          game_id: data.gamePk,
          player_name: player.person.fullName,
          player_id: player.person.id,
          team_id: team.team.id,
          team_name: team.team.name,
          player_age: data.gameData?.players?.[playerId]?.currentAge,
          player_number: player.jerseyNumber,
          player_postion: player.position.name,
          assists: player.stats?.[statKey]?.assists,
          goals: player.stats?.[statKey]?.goals,
          hits: player.stats?.[statKey]?.hits,
          points: (player.stats?.[statKey]?.goals ?? 0) + (player.stats?.[statKey]?.assists ?? 0),
          penalty_minutes: player.stats?.[statKey]?.penaltyMinutes,
          opponent_team_id: teams[i === 0 ? 1: 0].team.id,
          opponent_team_name: teams[i === 0 ? 1: 0].team.name
        }
        gameStats.push(newRecord)
      } catch (err){
        console.error(err);
        console.info({player});
        if(throwIfError) throw err
      }
    }
  })

  return gameStats
}