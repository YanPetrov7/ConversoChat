/* eslint-disable */
'use strict';

const { generateChatTableName, passwordСheck, logMessage, usernameСheck } = require('../src/js/func.js')
// Start of the test suite for 'func.js'
describe('Test suite for func.js', () => {

  // Test suite for the 'generateChatTableName' function
  describe('generateChatTableName', () => {
    // Test case: Should generate table name correctly for sorted names
    it('Should generate table name correctly for sorted names', () => {
      expect(generateChatTableName('alice', 'bob')).toEqual('chat_for_alice_bob_users');
    });

    // Test case: Should generate table name correctly for unsorted names
    it('Should generate table name correctly for unsorted names', () => {
      expect(generateChatTableName('bob', 'alice')).toEqual('chat_for_alice_bob_users');
    });
  });

  // Test suite for the 'passwordСheck' function
  describe('passwordСheck', () => {
    // Test case: Should return false for password shorter than 8 characters
    it('Should return false for password shorter than 8 characters', () => {
      expect(passwordСheck('Short1')).toEqual(false);
    });

    // Test case: Should return false for password longer than 16 characters
    it('Should return false for password longer than 16 characters', () => {
      expect(passwordСheck('Thispasswordistoolong1')).toEqual(false);
    });

    // Test case: Should return false for password with non-alphanumeric characters
    it('Should return false for password with non-alphanumeric characters', () => {
      expect(passwordСheck('Password1!')).toEqual(false);
    });

    // Test case: Should return false for password without uppercase letter
    it('Should return false for password without uppercase letter', () => {
      expect(passwordСheck('password1')).toEqual(false);
    });

    // Test case: Should return false for password without lowercase letter
    it('Should return false for password without lowercase letter', () => {
      expect(passwordСheck('PASSWORD1')).toEqual(false);
    });

    // Test case: Should return true for valid password
    it('Should return true for valid password', () => {
      expect(passwordСheck('ValidPass1')).toEqual(true);
    });
  });

  // Test suite for the 'logMessage' function
  describe('logMessage', () => {
    // Test case: Should call console.log with correct success message
    it('Should call console.log with correct success message', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const logType = 'TestType';
      const message = 'TestMessage';
      logMessage(logType, message, 'success');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    // Test case: Should call console.log with correct error message
    it('Should call console.log with correct error message', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const logType = 'TestType';
      const message = 'TestMessage';
      logMessage(logType, message, 'error');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // Test suite for the 'usernameСheck' function
  describe('usernameСheck', () => {
    // Test case: should return true for valid username
    it('should return true for valid username', () => {
      expect(usernameСheck('testuser')).toBe(true);
    });

    // Test case: should return false for username with less than 8 characters
    it('should return false for username with less than 8 characters', () => {
      expect(usernameСheck('user')).toBe(false);
    });

    // Test case: should return false for username with non-Latin characters
    it('should return false for username with non-Latin characters', () => {
      expect(usernameСheck('пользователь')).toBe(false);
    });

    // Test case: should return false for username with special characters
    it('should return false for username with special characters', () => {
      expect(usernameСheck('test$user')).toBe(false);
    });
  });
});
