import jsdom from 'jsdom';
import Enzyme from 'enzyme';
import ReactSixteenAdapter from 'enzyme-adapter-react-16';

/**
 * unit test
 * setup
 */

Enzyme.configure({ adapter: new ReactSixteenAdapter() });

interface Global {
  document: Document;
  window: Window;
}

declare let global: Global;

const { JSDOM } = jsdom;
const dom = new JSDOM(
  `<!doctype html><html><body><div id="container">kop test page</div></body></html>`,
  { url: 'http://www.alipay.com' }
);

global.document = dom.window.document;
global.document.querySelector = (selector: any) =>
  dom.window.document.querySelector(selector);
