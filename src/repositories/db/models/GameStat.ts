import db from '..'

export interface IGameStat {
  game_id: number
  player_id: string
  player_name: string
  team_id: string
  team_name: string
  player_age?: number
  player_number: number
  player_postion: string
  assists?: number
  goals?: number
  hits?: number
  points?: number
  penalty_minutes?: number
  opponent_team_id?: string
  opponent_team_name?: string
}

export class GameStat {
  static table = 'game_stats';

  static async batchUpsert(gameStats: IGameStat[]){
    await db(GameStat.table).insert(gameStats)
      .onConflict(['game_id', 'player_id'])
      .merge()
  }

  static async getAllByGameId(gameId: number): Promise<IGameStat[]> {
    return await db(GameStat.table).where({game_id: gameId})
  }

  static async getAll(): Promise<IGameStat[]> {
    return await db(GameStat.table)
  }
}
