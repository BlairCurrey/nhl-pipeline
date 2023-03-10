import { dateNowEST, formatDate } from './'

describe('utils', () => {
  describe('dateNowEST', () => {
    it('should be correct format', () => {
      const now = dateNowEST();
      const regEx = /^\d{4}-\d{2}-\d{2}$/;
      expect(now.match(regEx)).not.toBe(null);
    });
  });
  describe('formatDate', () => {
    it('formats date to YYYY-MM-DD without changing tz', () => {
      const cases = [
        {in: '3/9/2023', out: '2023-03-09'},
        {in: '12/10/2023', out: '2023-12-10'},
        {in: '3/20/2023', out: '2023-03-20'},
        {in: '12/9/2023', out: '2023-12-09'}
      ]
      cases.forEach((c)=>{
        expect(formatDate(c.in)).toEqual(c.out)
      })
    });
  });
});
