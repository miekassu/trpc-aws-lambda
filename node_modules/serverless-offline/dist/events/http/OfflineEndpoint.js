"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class OfflineEndpoint {
  constructor() {
    this.apiKeyRequired = false;
    this.authorizationType = 'none';
    this.authorizerFunction = false;
    this.path = '';
    this.requestParameters = {};
    this.requestTemplates = {
      'application/json': ''
    };
    this.responses = {
      default: {
        400: {
          statusCode: '400'
        },
        responseModels: {
          'application/json;charset=UTF-8': 'Empty'
        },
        responseParameters: {},
        responseTemplates: {
          'application/json;charset=UTF-8': ''
        },
        statusCode: 200
      }
    };
    this.type = 'AWS';
  }

}

exports.default = OfflineEndpoint;