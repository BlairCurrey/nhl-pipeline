import { parseGameData } from './parseGameData'
import data1 from '../../test/responses/live_20230309_013002.json';
import data2 from '../../test/responses/live_20230309_022155.json';
import data3 from '../../test/responses/live_20230309_025759.json';
import data4 from '../../test/responses/live_20230310_163915.json';

describe('parseGameData', () => {
  it('parseGameData does not throw', async () => {
    [data1, data2, data3, data4].forEach(data => parseGameData(data, true))
    expect(true);
  });
  it('accesses skater/goalie stats appropriately', async () => {
    const data = parseGameData(data1, true)
    const notGoalie = data.find(d => d.player_postion !== 'Goalie')
    const goalie = data.find(d => d.player_postion === 'Goalie')

    expect(notGoalie?.assists).not.toBeUndefined();
    expect(goalie?.goals).not.toBeUndefined();
  });
});