import express from 'express';
import { GameStat } from '../../repositories/db/models/GameStat';


interface ServeDeps {
  gameStat: typeof GameStat
}

export function serve(port: number, deps: ServeDeps) {
  const  { gameStat } = deps;
  const app = express();

  app.get('/game-stats', async (req, res) => {
    const gameStats = await gameStat.getAll();
    res.json(gameStats);
  });

  app.get('/game-stats/:id', async (req, res) => {
    const gameId = parseInt(req.params.id);

    if (isNaN(gameId)) {
      res.status(400).send('Invalid game ID');
      return;
    }

    try {
      const gameStats = await gameStat.getAllByGameId(gameId);
  
      if (!gameStats) {
        res.status(404).send('Game stats not found');
        return;
      }
  
      res.json(gameStats);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving game stats');
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}