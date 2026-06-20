import '@testing-library/jest-dom';

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    constructor(input: string) {
      this.url = input;
    }
  } as any;
}
if (typeof global.Response === 'undefined') {
  global.Response = class Response {} as any;
}
