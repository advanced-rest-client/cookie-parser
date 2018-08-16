const assert = require('chai').assert;
const {Cookie} = require('../');

describe('Cookie class', function() {
  const name = 'c-name';
  const value = 'c-value';

  it('Cookie is not persistant when created without expiry time', function() {
    const instance = new Cookie(name, value);
    assert.isFalse(instance.persistent);
  });

  it('Cookie has the biggest possible expiry date', function() {
    const instance = new Cookie(name, value);
    const compare = new Date(8640000000000000).getTime();
    assert.equal(instance.expires, compare);
  });

  it('Has created time', () => {
    const instance = new Cookie(name, value);
    assert.typeOf(instance.created, 'number');
  });

  it('Has lastAccess time equal to create time', () => {
    const instance = new Cookie(name, value);
    assert.equal(instance.lastAccess, instance.created);
  });

  it('Sets expires from max-age property', () => {
    const instance = new Cookie(name, value, {
      'max-age': 100
    });
    assert.equal(instance.expires, Date.now() + 100000);
  });

  it('Max-age sets cookie persistent', () => {
    const instance = new Cookie(name, value, {
      'max-age': 100
    });
    assert.isTrue(instance.persistent);
  });

  it('Negative max-age sets lowest possible expiry date', function() {
    const instance = new Cookie(name, value, {
      'max-age': -100
    });
    const compare = new Date(-8640000000000000).getTime();
    assert.equal(instance.expires, compare);
  });

  it('Creates header string', () => {
    const instance = new Cookie(name, value);
    const result = instance.toHeader();
    assert.equal(result.indexOf('c-name=c-value; expires='), 0);
  });
});
