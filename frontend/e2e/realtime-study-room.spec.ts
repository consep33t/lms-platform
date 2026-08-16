import { test, expect } from '@playwright/test';

test.describe('Realtime Study Room', () => {
  test('should create study room and test multi-user messaging', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    await page1.goto('/login');
    await page1.fill('input[name="email"]', 'user1@example.com');
    await page1.fill('input[name="password"]', 'password123');
    await page1.click('button[type="submit"]');
    
    await page1.click('text=Study Rooms');
    await page1.click('button:has-text("Create Room")');
    await page1.fill('input[name="roomName"]', 'Test Study Group');
    await page1.click('button:has-text("Create")');
    
    await expect(page1).toHaveURL(/.*\/study-rooms\/.+/);
    const roomUrl = page1.url();

    await page2.goto('/login');
    await page2.fill('input[name="email"]', 'user2@example.com');
    await page2.fill('input[name="password"]', 'password123');
    await page2.click('button[type="submit"]');
    
    await page2.goto(roomUrl);
    await expect(page2.locator('text=Test Study Group')).toBeVisible();

    await page1.fill('input[placeholder="Type a message..."]', 'Hello from User 1!');
    await page1.click('button:has-text("Send")');

    await expect(page2.locator('text=Hello from User 1!')).toBeVisible();

    await page2.fill('input[placeholder="Type a message..."]', 'Hi User 1, this is User 2!');
    await page2.click('button:has-text("Send")');

    await expect(page1.locator('text=Hi User 1, this is User 2!')).toBeVisible();

    await context1.close();
    await context2.close();
  });
});
