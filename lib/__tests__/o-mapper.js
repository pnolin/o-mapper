/* eslint-env mocha */
const { expect } = require('chai');
const omapper = require('../o-mapper.js');

describe('o-mapper', () => {
    it('should return the same provided falsy value', () => {
        const schema = {};

        const input = undefined;

        const expectedResult = undefined;

        const result = omapper(input, schema);

        expect(result).to.equal(expectedResult);
    });

    it('should map simple properties', () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: 'doin',
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should set default values if value doesn\'t exist in source object', () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
                default: 'doin',
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: 'doin',
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should set undefined if value doesn\'t exist in source object', () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: undefined,
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should not throw an error if a not mandatory value doesn\'t exist', () => {
        const schema = {
            prop1: {
                key: 'a.b.c.d',
            },
        };

        const input = { a: null };

        const expectedResult = { prop1: null };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should throw an error if required value doesn\'t exist', () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
                required: true,
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
        };

        expect(() => {
            omapper(input, schema);
        }).to.throw('field property3 is required and missing');
    });

    it('should not throw an error if required value exists but is falsy', () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
                required: true,
            },
            prop4: {
                key: 'property4',
                required: true,
            },
            prop5: {
                key: 'property5',
                required: true,
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: false,
            property4: 0,
            property5: '',
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: false,
            prop4: 0,
            prop5: '',
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should call handler function for single input key', () => {
        const schema = {
            prop1: {
                key: 'property1',
                handler: value => `${value}, and you can't teach that`,
            },
        };
        const input = {
            property1: '6ft tall',
        };
        const expectedResult = {
            prop1: '6ft tall, and you can\'t teach that',
        };
        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should call handler for multiple input keys', () => {
        const schema = {
            prop1: {
                key: ['property1', 'property2', 'property3', 'property4', 'property5'],
                handler: (p1, p2, p3, p4, p5) => p1 + p2 + p3 + p4 + p5,
            },
        };
        const input = {
            property1: 'S',
            property2: 'A',
            property3: 'W',
            property4: 'F',
            property5: 'T',
        };
        const expectedResult = {
            prop1: 'SAWFT',
        };
        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should throw an error if a handler isn\'t set for multiple input keys', () => {
        const schema = {
            prop1: {
                key: ['property1', 'property2', 'property3', 'property4', 'property5'],
            },
        };
        const input = {
            property1: 'S',
            property2: 'A',
            property3: 'W',
            property4: 'F',
            property5: 'T',
        };

        expect(() => {
            omapper(input, schema);
        }).to.throw('handler is required for multiple keys');
    });

    it('should use same key name as schema if not specified', () => {
        const schema = {
            property1: {},
            property2: {},
            property3: {},
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
        };

        const expectedResult = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should get a deeper value specified by dot notation', () => {
        const schema = {
            prop1: {
                key: 's.a.w.f.t',
                required: true,
            },
        };
        const input = {
            s: {
                a: {
                    w: {
                        f: {
                            t: 'SAWFT',
                        },
                    },
                },
            },
        };
        const expectedResult = {
            prop1: 'SAWFT',
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should get multiple deeper values specified by dot notation and call handler', () => {
        const schema = {
            prop1: {
                key: ['ba.da.boom', 'ba.da.bing'],
                handler: (badaboom, badabing) => `${badaboom} ${badabing}`,
            },
        };
        const input = {
            ba: {
                da: {
                    boom: 'badaboom',
                    bing: 'badabing',
                },
            },
        };
        const expectedResult = {
            prop1: 'badaboom badabing',
        };

        const result = omapper(input, schema);

        expect(result).to.deep.equal(expectedResult);
    });

    it('should throw an error if a required deep value is missing', () => {
        const schema = {
            prop1: {
                key: 's.a.w.f.t',
                required: true,
            },
        };
        const input = {
            s: {
                a: {},
            },
        };

        expect(() => {
            omapper(input, schema);
        }).to.throw('field s.a.w.f.t is required and missing');
    });

    it("should not include properties that are not in the schema if options are not provided", () => {
      const schema = {
          prop1: {
              key: 'property1',
          },
          prop2: {
              key: 'property2',
          },
          prop3: {
              key: 'property3',
          },
      };

      const input = {
          property1: 'how',
          property2: 'you',
          property3: 'doin',
          property4: 'dude',
      };

      const expectedResult = {
          prop1: 'how',
          prop2: 'you',
          prop3: 'doin',
      };

      const result = omapper(input, schema);

      expect(result).to.deep.equal(expectedResult);
    });

    it("should not include properties that are not in the schema if options is undefined", () => {
      const schema = {
          prop1: {
              key: 'property1',
          },
          prop2: {
              key: 'property2',
          },
          prop3: {
              key: 'property3',
          },
      };

      const input = {
          property1: 'how',
          property2: 'you',
          property3: 'doin',
          property4: 'dude',
      };

      const expectedResult = {
          prop1: 'how',
          prop2: 'you',
          prop3: 'doin',
      };

      const result = omapper(input, schema, {});

      expect(result).to.deep.equal(expectedResult);
    });

    it("should not include properties that are not in the schema if options inherit is null", () => {
      const schema = {
          prop1: {
              key: 'property1',
          },
          prop2: {
              key: 'property2',
          },
          prop3: {
              key: 'property3',
          },
      };

      const input = {
          property1: 'how',
          property2: 'you',
          property3: 'doin',
          property4: 'dude',
      };

      const expectedResult = {
          prop1: 'how',
          prop2: 'you',
          prop3: 'doin',
      };

      const result = omapper(input, schema, { inherit: null });

      expect(result).to.deep.equal(expectedResult);
    });

    it("should not include properties that are not in the schema if options inherit is false", () => {
      const schema = {
          prop1: {
              key: 'property1',
          },
          prop2: {
              key: 'property2',
          },
          prop3: {
              key: 'property3',
          },
      };

      const input = {
          property1: 'how',
          property2: 'you',
          property3: 'doin',
          property4: 'dude',
      };

      const expectedResult = {
          prop1: 'how',
          prop2: 'you',
          prop3: 'doin',
      };

      const result = omapper(input, schema, { inherit: false });

      expect(result).to.deep.equal(expectedResult);
    });

    describe('options.inherit', () => {
      it("should make the result inherit basic properties", () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
            property4: 'dude',
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: 'doin',
            property4: 'dude',
        };

        const result = omapper(input, schema, { inherit: true });

        expect(result).to.deep.equal(expectedResult);
      });

      it("should make the result inherit complex properties", () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
            },
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
            property4: {
              property41: 'dude'
            },
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: 'doin',
            property4: {
              property41: 'dude'
            },
        };

        const result = omapper(input, schema, { inherit: true });

        expect(result).to.deep.equal(expectedResult);
      });

      it("should not make the result inherit mapped properties", () => {
        const schema = {
            property1: {},
            prop2: {
                key: ['property2', 'property3'],
                handler: (two, third) => `${two} ${third}`
            },
            prop3: {
               key: 'property4.property41',
               default: ''
            }
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
            property4: {
              property41: 'dude',
              property42: '?'
            },
        };

        const expectedResult = {
            property1: 'how',
            prop2: 'you doin',
            prop3: 'dude'
        };

        const result = omapper(input, schema, { inherit: true });

        expect(result).to.deep.equal(expectedResult);
      });

      it("should not make the result inherit complex properties if it was used in the mapping", () => {
        const schema = {
            prop1: {
                key: 'property1',
            },
            prop2: {
                key: 'property2',
            },
            prop3: {
                key: 'property3',
            },
            prop4: {
               key: 'property4.property41',
               default: ''
            }
        };

        const input = {
            property1: 'how',
            property2: 'you',
            property3: 'doin',
            property4: {
              property41: 'dude',
              property42: '?'
            },
        };

        const expectedResult = {
            prop1: 'how',
            prop2: 'you',
            prop3: 'doin',
            prop4: 'dude'
        };

        const result = omapper(input, schema, { inherit: true });

        expect(result).to.deep.equal(expectedResult);
      });
    });
});
