/* eslint-disable */
'use strict';

const { logMessage, generateChatTableName, passwordСheck } = require('../src/js/func.js');

describe('Test suite for func.js', () => {

  describe('generateChatTableName', () => {
    it('Should generate table name correctly for sorted names', () => {
      expect(generateChatTableName('alice', 'bob')).toEqual('chat_for_alice_bob_users');
    });

    it('Should generate table name correctly for unsorted names', () => {
      expect(generateChatTableName('bob', 'alice')).toEqual('chat_for_alice_bob_users');
    });
  });

  describe('passwordСheck', () => {
    it('Should return false for password shorter than 8 characters', () => {
      expect(passwordСheck('Short1')).toEqual(false);
    });

    it('Should return false for password longer than 16 characters', () => {
      expect(passwordСheck('Thispasswordistoolong1')).toEqual(false);
    });

    it('Should return false for password with non-alphanumeric characters', () => {
      expect(passwordСheck('Password1!')).toEqual(false);
    });

    it('Should return false for password without uppercase letter', () => {
      expect(passwordСheck('password1')).toEqual(false);
    });

    it('Should return false for password without lowercase letter', () => {
      expect(passwordСheck('PASSWORD1')).toEqual(false);
    });

    it('Should return true for valid password', () => {
      expect(passwordСheck('ValidPass1')).toEqual(true);
    });
  });

  describe('logMessage', () => {
    it('Should call console.log with correct success message', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const logType = 'TestType';
      const message = 'TestMessage';
      logMessage(logType, message, 'success');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('Should call console.log with correct error message', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const logType = 'TestType';
      const message = 'TestMessage';
      logMessage(logType, message, 'error');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

});
