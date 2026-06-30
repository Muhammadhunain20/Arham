import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Project Sanity Checks', () => {
  it('should have a valid package.json with required scripts', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve('package.json'), 'utf-8')
    );

    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('test');
    expect(pkg.scripts).toHaveProperty('server');
  });

  it('should have a Dockerfile in the project root', () => {
    const exists = fs.existsSync(path.resolve('Dockerfile'));
    expect(exists).toBe(true);
  });

  it('should have a Vite entry point referenced in index.html', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
    expect(html).toContain('/src/main.tsx');
  });
});
