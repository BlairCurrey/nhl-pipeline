import db from '..'

interface IGame {
  id: string
  status: string
}

export class Game {
  id: string;
  status: IGame['status'];
  static validStatuses = ['Preview', 'Live', 'Final'];
  static table = 'games';

  constructor({ id, status }: IGame) {
    if(!Game.validStatuses.includes(status)){
      throw new Error(`Status is invalid. Must be one of: ${Game.validStatuses}`);
    }
    this.id = id;
    this.status = status;
  }

  async save(){
    return await db(Game.table).insert({id: this.id, status: this.status});
  }

  static async getById(id: IGame['id']){
    const res = await db(Game.table).where({id}).first();
    if(!res) return res
    return new Game({id: res.id, status: res.status});
  }

}