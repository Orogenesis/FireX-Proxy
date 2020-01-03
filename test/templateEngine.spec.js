import { TemplateEngine } from '../addon/templateEngine';
import { assert } from 'chai';

describe('templateEngine', () => {
  it('should return template with expressions', () => {
    const engine = new TemplateEngine({
      a: 9,
      b: 6,
      c: 7,
      d: 45
    });

    const output = engine.build(`I'll have two number {{a}}s, a number {{a}} large, a number {{b}} with extra dip, a number {{c}}, two number {{d}}s, one with cheese, and a large soda.`);
    assert.equal(output, `I'll have two number 9s, a number 9 large, a number 6 with extra dip, a number 7, two number 45s, one with cheese, and a large soda.`);
  });
});
