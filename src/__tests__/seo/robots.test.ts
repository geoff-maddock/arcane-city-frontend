import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('robots.txt', () => {
  const robotsPath = join(__dirname, '../../../public/robots.txt');

  it('should exist in the public directory', () => {
    expect(existsSync(robotsPath)).toBe(true);
  });

  it('should contain proper sitemap URL', () => {
    const content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('Sitemap: https://api.arcane.city/sitemap.xml');
  });

  it('should allow all user agents', () => {
    const content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Allow: /');
  });

  it('should disallow authentication and admin pages', () => {
    const content = readFileSync(robotsPath, 'utf-8');
    
    // Check authentication pages are disallowed
    expect(content).toContain('Disallow: /login');
    expect(content).toContain('Disallow: /register');
    expect(content).toContain('Disallow: /password-recovery');
    expect(content).toContain('Disallow: /password-reset');
    
    // Check edit pages are disallowed
    expect(content).toContain('Disallow: /account/edit');
  });

  it('should disallow create and edit pages', () => {
    const content = readFileSync(robotsPath, 'utf-8');
    
    // Check create pages are disallowed
    expect(content).toContain('Disallow: /events/create');
    expect(content).toContain('Disallow: /entities/create');
    expect(content).toContain('Disallow: /series/create');
    expect(content).toContain('Disallow: /tags/create');
    
    // Check edit pages are disallowed
    expect(content).toContain('Disallow: /events/*/edit');
    expect(content).toContain('Disallow: /entities/*/edit');
    expect(content).toContain('Disallow: /series/*/edit');
    expect(content).toContain('Disallow: /tags/*/edit');
  });
});
