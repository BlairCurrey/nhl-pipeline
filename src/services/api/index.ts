import { serve } from './serve.js';
import config from '../../lib/config'
import { GameStat } from '../../repositories/db/models/GameStat.js';

serve(config.apiPort, {gameStat: GameStat});