import { dateNowEST } from './'

describe('dateNowEST', () => {
  it('should be correct format', () => {
    const now = dateNowEST();
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    expect(now.match(regEx)).not.toBe(null);
  });
});