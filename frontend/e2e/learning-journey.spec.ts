import { test, expect } from '@playwright/test';

test.describe('Learning Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should navigate module, watch video, use notes and AI tutor', async ({ page }) => {
    await page.click('text=Introduction to Programming');
    await expect(page).toHaveURL(/.*\/modules\/\d+/);

    const video = page.locator('video');
    await expect(video).toBeVisible();
    await page.click('button:has-text("Play")');

    await page.click('button:has-text("Notes")');
    const notesDrawer = page.locator('.notes-drawer');
    await expect(notesDrawer).toBeVisible();
    await page.fill('textarea[placeholder="Take notes..."]', 'These are my test notes.');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Notes saved')).toBeVisible();

    await page.click('button:has-text("Ask AI Tutor")');
    await page.fill('input[placeholder="Ask a question..."]', 'What is a variable?');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.ai-response')).toBeVisible();
  });

  test('should submit adaptive quiz and show badge celebration', async ({ page }) => {
    await page.goto('/modules/1/quiz');
    
    await page.click('input[type="radio"] >> nth=0');
    await page.click('button:has-text("Next")');
    await page.click('input[type="radio"] >> nth=1');
    await page.click('button:has-text("Submit")');

    await expect(page.locator('text=Quiz Completed')).toBeVisible();

    const celebrationModal = page.locator('.badge-celebration');
    await expect(celebrationModal).toBeVisible();
    await expect(page.locator('text=New Badge Earned!')).toBeVisible();
    await page.click('button:has-text("Awesome")');
    await expect(celebrationModal).toBeHidden();
  });
});
