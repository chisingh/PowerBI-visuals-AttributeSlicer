/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { default as convert } from './dataConversion';
import { expect } from 'chai';
import state from './state';
import categoriesAndValues from './test_data/categoriesAndValues';
import categoriesOnly from './test_data/categoriesOnly';
import categoriesAndValuesWithSeries from './test_data/categoriesAndValuesWithSeries';

describe('dataConversion', () => {
  describe('convert', () => {
    describe('data with only categories', () => {
      it('should convert the categories correctly', () => {
        const { options, categories } = categoriesOnly();
        const converted = convert(options.dataViews[0]);
        const catNames = converted.items.map(n => n.match);
        expect(catNames).to.be.deep.equal(categories);
      });
      it('should convert the segment infos values correctly', () => {
        const { options } = categoriesOnly();
        const converted = convert(options.dataViews[0]);

        // There are no segments because only "Categories" has been given to the converter
        expect(converted.segmentInfo).to.be.empty;
      });
      it('should convert the items correctly', () => {
        const { options } = categoriesOnly();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n) => {
          expect(n.color).to.be.equal('#ccc'); // The default color
          expect(n.matchPrefix).to.be.empty;
          expect(n.matchSuffix).to.be.empty;
          expect(n.id).to.not.be.undefined;
          expect(n.equals).to.not.be.undefined;

          // None of the items should have any of the below since there is no value data
          expect(n.value).to.be.empty;
          expect(n.renderedValue).to.be.empty;
          expect(n.valueSegments).to.be.empty;
        });
      });
      it('should define an equals function correctly', () => {
        const { options } = categoriesOnly();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n) => {
          expect(
            n.equals(<any>{
              id: n.id,
            }),
          ).to.be.true;

          expect(
            n.equals(<any>{
              id: 'SOMETHING RANDOM',
            }),
          ).to.be.false;
        });
      });
    });
    describe('data with categories and values (no series)', () => {
      it('should convert the categories correctly', () => {
        const { options, categories } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);
        const catNames = converted.items.map(n => n.match);
        expect(catNames).to.be.deep.equal(categories);
      });
      it('should convert the items values correctly', () => {
        const { options, values } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n, i) => {
          // The "value" property is the total of its child values
          // Something that is pretty darn close to the number
          expect(n.value).to.be.closeTo(values[i].total, 0.2);
        });
      });
      it('should convert the items renderedValue correctly', () => {
        const { options, values } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);
        converted.items.forEach((n, i) => {
          // The "value" property is the total of its child values
           // Something that is pretty darn close to the number
          expect(n.renderedValue).to.be.closeTo(values[i].renderedValue, 0.2);
        });
      });
      it('should convert the items segment widths correctly', () => {
        const { options, values } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);
        converted.items.map(n => n.valueSegments).forEach((n, i) => {
          // The segmentWidths should be close
          const segmentWidths = n.map(m => m.width);
          segmentWidths.forEach((m, j) => {
            expect(m).to.be.closeTo(values[i].segments[j].width, 0.2);
          });
        });
      });
      it('should convert the items segment colors correctly', () => {
        const { options, values } = categoriesAndValues();
        const settings = state.createFromPBI<state>(options.dataViews[0])
          .colors; // HACK
        const converted = convert(
          options.dataViews[0],
          undefined,
          undefined,
          settings,
        );
        converted.items.map(n => n.valueSegments).forEach((n, i) => {
          // The segmentColors should be close
          const segmentColors = n.map(m => m.color);
          segmentColors.forEach((m, j) => {
            expect(m).to.be.equal(values[i].segments[j].color);
          });
        });
      });
      it('should convert the segment infos values correctly', () => {
        const { options, segmentInfos } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);

        // There are no segments because only "Categories" has been given to the converter
        expect(converted.segmentInfo).to.be.deep.equal(segmentInfos);
      });
      it('should convert the items correctly', () => {
        const { options } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n) => {
          expect(n.color).to.be.equal('#ccc'); // The default color
          expect(n.matchPrefix).to.be.empty;
          expect(n.matchSuffix).to.be.empty;
          expect(n.id).to.not.be.undefined;
          expect(n.equals).to.not.be.undefined;

          // None of the items should have any of the below since there is no value data
          expect(n.value).to.not.be.empty;
          expect(n.renderedValue).to.not.be.empty;
          expect(n.valueSegments).to.not.be.empty;
        });
      });
      it('should define an equals function correctly', () => {
        const { options } = categoriesAndValues();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n) => {
          expect(
            n.equals(<any>{
              id: n.id,
            }),
          ).to.be.true;

          expect(
            n.equals(<any>{
              id: 'SOMETHING RANDOM',
            }),
          ).to.be.false;
        });
      });
    });
    describe('data with categories and values with series', () => {
      it('should convert the categories correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);
        expect(converted.items.map(n => n.match)).to.be.deep.equal(
          expected.items.map(n => n.match),
        );
      });
      it('should convert the items values correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);
        converted.items.forEach((n, i) => {
          // The "value" property is the total of its child values
          // Something that is pretty darn close to the number
          expect(n.value).to.be.closeTo(expected.items[i].value, 0.2);
        });
      });
      it('should convert the items renderedValue correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);
        converted.items.forEach((n, i) => {
          // The "value" property is the total of its child values
          // Something that is pretty darn close to the number
          expect(n.renderedValue).to.be.closeTo(
            expected.items[i].renderedValue,
            0.2,
          );
        });
      });
      it('should convert the items segment widths correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);
        converted.items.map(n => n.valueSegments).forEach((n, i) => {
          // The segmentWidths should be close
          const segmentWidths = n.map(m => m.width);
          segmentWidths.forEach((m, j) => {
            expect(m).to.be.closeTo(
              expected.items[i].valueSegments[j].width,
              0.2,
            );
          });
        });
      });
      it('should convert the items segment colors correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const settings = state.createFromPBI<state>(options.dataViews[0])
          .colors; // HACK
        const converted = convert(
          options.dataViews[0],
          undefined,
          undefined,
          settings,
        );
        converted.items.map(n => n.valueSegments).forEach((n, i) => {
          // The segmentColors should be close
          const segmentColors = n.map(m => m.color);
          expect(segmentColors.length).to.be.equal(expected.segmentInfo.length);
          segmentColors.forEach((m, j) => {
            expect(m).to.be.equal(expected.items[i].valueSegments[j].color);
          });
        });
      });
      it('should convert the segment infos names correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);

        // There are no segments because only "Categories" has been given to the converter
        expect(converted.segmentInfo.map(n => n.name)).to.be.deep.equal(
          expected.segmentInfo.map(n => n.name),
        );
      });
      it('should convert the segment infos colors correctly', () => {
        const { options, expected } = categoriesAndValuesWithSeries();
        const settings = state.createFromPBI<state>(options.dataViews[0])
          .colors; // HACK
        const converted = convert(
          options.dataViews[0],
          undefined,
          undefined,
          settings,
        );

        // There are no segments because only "Categories" has been given to the converter
        expect(converted.segmentInfo.map(n => n.color)).to.be.deep.equal(
          expected.segmentInfo.map(n => n.color),
        );
      });
      it('should convert the items correctly', () => {
        const { options } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n) => {
          expect(n.color).to.be.equal('#ccc'); // The default color
          expect(n.matchPrefix).to.be.empty;
          expect(n.matchSuffix).to.be.empty;
          expect(n.id).to.not.be.undefined;
          expect(n.equals).to.not.be.undefined;

          // None of the items should have any of the below since there is no value data
          expect(n.value).to.not.be.empty;
          expect(n.renderedValue).to.not.be.empty;
          expect(n.valueSegments).to.not.be.empty;
        });
      });
      it('should define an equals function correctly', () => {
        const { options } = categoriesAndValuesWithSeries();
        const converted = convert(options.dataViews[0]);

        converted.items.forEach((n) => {
          expect(
            n.equals(<any>{
              id: n.id,
            }),
          ).to.be.true;

          expect(
            n.equals(<any>{
              id: 'SOMETHING RANDOM',
            }),
          ).to.be.false;
        });
      });
    });

    it('should not crash if passed a dataView with no categorical information', () => {
      convert(<any>{});
    });
  });
});
