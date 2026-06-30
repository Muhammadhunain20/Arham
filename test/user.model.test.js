import { describe, it, expect } from 'vitest';
import User from '../server/models/User.js';

// NOTE: These tests use Mongoose's validateSync(), which runs schema
// validation rules in-memory WITHOUT needing a live MongoDB connection.
// This keeps the test suite fast and reliable inside CI/CD pipelines.

describe('User Model - Validation', () => {
  it('should fail validation when required fields are missing', () => {
    const user = new User({});
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.firstName).toBeDefined();
    expect(error.errors.lastName).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.contactNo).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  it('should pass validation with valid patient data', () => {
    const user = new User({
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali.khan@example.com',
      password: 'secret123',
      contactNo: '0301234567',
      role: 'patient'
    });

    const error = user.validateSync();
    expect(error).toBeUndefined();
  });

  it('should require "specialist" field when role is doctor', () => {
    const user = new User({
      firstName: 'Sara',
      lastName: 'Ahmed',
      email: 'sara.ahmed@example.com',
      password: 'secret123',
      contactNo: '0301234567',
      role: 'doctor'
      // specialist intentionally omitted
    });

    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.specialist).toBeDefined();
  });

  it('should pass validation for doctor when specialist is provided', () => {
    const user = new User({
      firstName: 'Sara',
      lastName: 'Ahmed',
      email: 'sara.ahmed@example.com',
      password: 'secret123',
      contactNo: '0301234567',
      role: 'doctor',
      specialist: 'Cardiologist'
    });

    const error = user.validateSync();
    expect(error).toBeUndefined();
  });

  it('should reject an invalid email format', () => {
    const user = new User({
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'not-a-valid-email',
      password: 'secret123',
      contactNo: '0301234567',
      role: 'patient'
    });

    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
  });

  it('should reject a contact number that is not exactly 10 digits', () => {
    const user = new User({
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali.khan@example.com',
      password: 'secret123',
      contactNo: '12345', // too short
      role: 'patient'
    });

    const error = user.validateSync();
    expect(error.errors.contactNo).toBeDefined();
  });

  it('should reject a password shorter than 6 characters', () => {
    const user = new User({
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali.khan@example.com',
      password: '123',
      contactNo: '0301234567',
      role: 'patient'
    });

    const error = user.validateSync();
    expect(error.errors.password).toBeDefined();
  });

  it('should reject an invalid role value', () => {
    const user = new User({
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali.khan@example.com',
      password: 'secret123',
      contactNo: '0301234567',
      role: 'admin' // not in enum ['doctor', 'patient']
    });

    const error = user.validateSync();
    expect(error.errors.role).toBeDefined();
  });

  it('should compute fullName virtual correctly', () => {
    const user = new User({
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali.khan@example.com',
      password: 'secret123',
      contactNo: '0301234567',
      role: 'patient'
    });

    expect(user.fullName).toBe('Ali Khan');
  });
});
