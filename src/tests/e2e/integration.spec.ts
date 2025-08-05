// End-to-end integration test for Creative Energy Flow PWA
import { test, expect } from '@playwright/test';

test.describe('Creative Energy Flow PWA Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display main application', async ({ page }) => {
    // Wait for the application to load and show main content
    await expect(page.locator('.app-content')).toBeVisible();
    
    // Check that the header is displayed
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Creative Energy Flow');
    
    // Check navigation buttons
    await expect(page.locator('[data-view="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-view="energy"]')).toBeVisible();
    await expect(page.locator('[data-view="social"]')).toBeVisible();
    await expect(page.locator('[data-view="charts"]')).toBeVisible();
    await expect(page.locator('[data-view="insights"]')).toBeVisible();
  });

  test('should navigate between different views', async ({ page }) => {
    // Test navigation to energy tracking
    await page.click('[data-view="energy"]');
    await expect(page.locator('.energy-view')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Energy Tracking');
    
    // Test navigation to social battery
    await page.click('[data-view="social"]');
    await expect(page.locator('.social-view')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Social Battery');
    
    // Test navigation to charts
    await page.click('[data-view="charts"]');
    await expect(page.locator('.charts-view')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Analytics & Charts');
    
    // Test navigation to AI insights
    await page.click('[data-view="insights"]');
    await expect(page.locator('.insights-view')).toBeVisible();
    await expect(page.locator('h2')).toContainText('AI Insights');
    
    // Return to dashboard
    await page.click('[data-view="dashboard"]');
    await expect(page.locator('.dashboard-view')).toBeVisible();
  });

  test('should log energy levels', async ({ page }) => {
    // Navigate to energy tracking
    await page.click('[data-view="energy"]');
    
    // Fill out energy form
    await page.selectOption('[name="type"]', 'creative');
    await page.fill('[name="level"]', '8');
    await page.fill('[name="activities"]', 'coding, designing');
    await page.fill('[name="note"]', 'Feeling very productive today');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Form should be cleared after submission
    await expect(page.locator('[name="note"]')).toHaveValue('');
  });

  test('should log social battery levels', async ({ page }) => {
    // Navigate to social battery
    await page.click('[data-view="social"]');
    
    // Fill out social battery form
    await page.selectOption('[name="interactionType"]', 'small-group');
    await page.fill('[name="level"]', '6');
    await page.fill('[name="drainFactors"]', 'long meeting');
    await page.fill('[name="rechargeFactors"]', 'good conversation');
    await page.fill('[name="note"]', 'Team meeting went well');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Form should be cleared after submission
    await expect(page.locator('[name="note"]')).toHaveValue('');
  });

  test('should display dashboard overview cards', async ({ page }) => {
    // Should be on dashboard by default
    await expect(page.locator('.dashboard-cards')).toBeVisible();
    
    // Check that overview cards are present
    await expect(page.locator('.card')).toHaveCount.toBeGreaterThan(0);
    
    // Check quick action buttons
    await expect(page.locator('[data-action="quick-energy-log"]')).toBeVisible();
    await expect(page.locator('[data-action="quick-social-log"]')).toBeVisible();
  });

  test('should handle form submissions with keyboard shortcuts', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Control+2'); // Should navigate to energy tracking
    await expect(page.locator('.energy-view')).toBeVisible();
    
    await page.keyboard.press('Control+3'); // Should navigate to social battery
    await expect(page.locator('.social-view')).toBeVisible();
    
    await page.keyboard.press('Control+4'); // Should navigate to charts
    await expect(page.locator('.charts-view')).toBeVisible();
    
    await page.keyboard.press('Control+5'); // Should navigate to AI insights
    await expect(page.locator('.insights-view')).toBeVisible();
    
    await page.keyboard.press('Control+1'); // Should navigate to dashboard
    await expect(page.locator('.dashboard-view')).toBeVisible();
  });

  test('should show PWA status indicator', async ({ page }) => {
    // Check that PWA status indicator is present
    await expect(page.locator('.pwa-status')).toBeVisible();
    await expect(page.locator('.status-indicator')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that the application is still usable on mobile
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.app-nav')).toBeVisible();
    
    // Navigation should still work
    await page.click('[data-view="energy"]');
    await expect(page.locator('.energy-view')).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check that buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should handle range input interactions', async ({ page }) => {
    // Navigate to energy tracking
    await page.click('[data-view="energy"]');
    
    // Test range input
    const rangeInput = page.locator('[name="level"]');
    await rangeInput.fill('7');
    
    // Check that display updates (if it exists)
    const levelDisplay = page.locator('#level-display');
    if (await levelDisplay.isVisible()) {
      await expect(levelDisplay).toContainText('7');
    }
  });

  test('should maintain navigation state', async ({ page }) => {
    // Navigate to energy view
    await page.click('[data-view="energy"]');
    
    // Check that the energy button is marked as active
    await expect(page.locator('[data-view="energy"]')).toHaveClass(/btn-primary/);
    
    // Navigate to another view
    await page.click('[data-view="charts"]');
    
    // Check that charts button is now active and energy is not
    await expect(page.locator('[data-view="charts"]')).toHaveClass(/btn-primary/);
    await expect(page.locator('[data-view="energy"]')).toHaveClass(/btn-outline/);
  });
});