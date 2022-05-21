const puppeteer = require('puppeteer');
const phoneNumber = "5615018160";

async function getTicketStatus(ticketNumber) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://811.kentucky811.org/findTicketByNumberAndPhone');

  await page.waitForSelector('#mat-input-0');
  await page.focus("#mat-input-0");
  await page.keyboard.type(ticketNumber, { delay: 50 });

  await page.waitForSelector('#iq-phone-0 > input');
  await page.focus('#iq-phone-0 > input');
  await page.keyboard.type(phoneNumber)

  let buttonSelector = 'body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(1) > div > button > span.mat-button-wrapper';
  await page.waitForSelector(buttonSelector);
  await page.$eval(buttonSelector, el => el.click());

  let tableSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ng-component > div.page-content > div:nth-child(3) > ticket-anon-simple-view > div > ticket-details-printing-text-and-service-areas > iq-view-list > div.iq-list-items";
  await page.waitForSelector(tableSelector);
  let ticketInfo = await page.evaluate((tableSelector) => {
    let status = [];
    let table = document.querySelector(tableSelector);
    let rows = table.querySelectorAll('iq-list-item');
    for (const row of rows) {
      let cells = row.querySelectorAll('div.column-fixed');
      let utility = {
        name: cells[0].textContent.trim(),
        type: cells[1].textContent.trim(),
        response: cells[2].textContent.trim(),
      }
      status.push(utility);
    }

    return status;
  }, tableSelector);

  browser.close();
  return ticketInfo;
}

module.exports = getTicketStatus;