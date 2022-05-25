const puppeteer = require('puppeteer');
const fs = require('fs');

const USERNAME = "ecocraftgus@gmail.com";
const PASSWORD = "UKRecW6YFX4ZYyg";
const LOGINURL = "https://811.kentucky811.org/login";
const TYPINGDELAY = 100;
// const GLOBALDELAY = 300;
const GLOBALDELAY = 100;
const DELAYRATIO = 0.25;

function getRandomDelay(ratio) {
  let max = TYPINGDELAY * (ratio + 1);
  let min = TYPINGDELAY - (ratio * TYPINGDELAY);

  let diff = max - min;
  let randomDelay = Math.random();
  randomDelay = Math.floor(randomDelay * diff);
  randomDelay = randomDelay + min;

  return randomDelay;
}

function splitArray(n, arr) {
  let arrays = [];
  for (let i = 0; i < n; i++) {
    arrays.push([]);
  }
  let counter = 0;
  while (arr.length > 0) {
    arrays[counter++].push(arr.shift());
    if (counter > n - 1) {
      counter = 0;
    }
  }
  return arrays.filter(val => val.length !== 0);
}

async function login(page) {
  await page.goto(LOGINURL);

  const usernameInputSelector = "#mat-input-0";
  const passwordInputSelector = "#mat-input-1";
  const signInButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > load-user-info > div > mat-card:nth-child(1) > mat-card-content > div:nth-child(2) > iq-aws-cognito > iq-aws-cognito-sign-in > div > button";

  await typeAndWaitSelector(page, usernameInputSelector, 0, USERNAME, getRandomDelay(DELAYRATIO));
  await typeAndWaitSelector(page, passwordInputSelector, 0, PASSWORD, getRandomDelay(DELAYRATIO));
  await clickAndWaitSelector(page, signInButtonSelector, 0);

  await page.waitForNavigation();
}

async function refreshTicket(ticketNumber, page, first) {
  await page.goto('https://811.kentucky811.org/tickets/dashboard');
  await page.waitForNavigation();

  const ticketNumberInputSelector = "#mat-input-0";
  const ticketMenuButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-dashboard > div.page-header-background-color.page-content > web-user-ticket-dashboard > iq-detail-layout > div.iq-details-layout-center.ng-trigger.ng-trigger-enterTrigger > ticket-search > iq-view-list > div.iq-list-items > iq-list-item:nth-child(2) > div > div > div.iq-display-2 > button > span.mat-button-wrapper > mat-icon";
  const copyTicketButtonSelector = "#mat-menu-panel-3 > div > div > div > button:nth-child(6) > span.mat-button-wrapper > span";

  await typeAndWaitSelector(page, ticketNumberInputSelector, 0, ticketNumber, getRandomDelay(DELAYRATIO));
  await clickAndWaitSelector(page, ticketMenuButtonSelector, 0);
  await clickAndWaitSelector(page, copyTicketButtonSelector, 1000);

  // await page.waitForNavigation();

  if (first) {
    const agreeButtonSelector = "body > app-root > div > desktop-root > div > mat-sidenav-container > mat-sidenav-content > div > ticket-details > div > div > div > div:nth-child(2) > iq-icon-button:nth-child(1) > button > div";
    await clickAndWaitSelector(page, agreeButtonSelector, 0);
  }

  const confirmMapSelectSelector = "#mat-select-value-21 > span";
  const yesButtonSelector = "#mat-option-3 > span";
  const saveContinueSelector = "#mat-tab-content-0-0 > div > div > div.iq-ticket-entry-left-side > ng-component > form > div > div:nth-child(3) > iq-icon-button.ng-star-inserted > button > div";
  const confirmTicketSelector = "#mat-dialog-0 > ng-component > div > mat-dialog-actions > iq-icon-button:nth-child(2) > button > div";
  const sendTicketSelector = "#mat-dialog-1 > ng-component > div > mat-dialog-actions > iq-icon-button:nth-child(2) > button > div";

  await clickAndWaitSelector(page, confirmMapSelectSelector, 0);
  await clickAndWaitSelector(page, yesButtonSelector, 1000);
  await clickAndWaitSelector(page, saveContinueSelector, 1000);
  await clickAndWaitSelector(page, confirmTicketSelector, 0);
  await clickAndWaitSelector(page, sendTicketSelector, 0);

  const ticketHeaderSelector = "#mat-dialog-2 > ng-component > div > mat-dialog-content > ng-component > div > div > div:nth-child(2) > div.header";
  await page.waitForSelector(ticketHeaderSelector);
  let ticketHeader = await page.$(ticketHeaderSelector);
  let headerText = await page.evaluate(el => el.textContent, ticketHeader);
  let newTicketNumber = headerText.slice(-10);
  return newTicketNumber;
}

async function clickAndWaitSelector(page, selector, wait) {
  await page.waitForTimeout(wait);
  await page.waitForSelector(selector);
  await page.click(selector);
}

async function typeAndWaitSelector(page, selector, wait, text, delay) {
  await page.waitForTimeout(wait);
  await page.waitForSelector(selector);
  await page.focus(selector);
  await page.keyboard.type(text, { delay: delay });
}

async function refreshTickets(tickets) {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: GLOBALDELAY,
  });
  const page = await browser.newPage();
  await login(page);

  let ticketTrans = {};

  let first = true;
  for (const ticket of tickets) {
    let newTicket = await refreshTicket(ticket, page, first);
    console.log(`old: ${ticket} new: ${newTicket}`);
    ticketTrans[ticket] = newTicket;
    // first = false;
  }

  console.log(ticketTrans);

  setTimeout((browser) => {
    browser.close();
  }, 1000, browser);

  return ticketTrans;
}

function parseTickets(filename) {
  let text = fs.readFileSync(filename, 'utf8');
  let tickets = text.split("\n").filter(val => val !== "");
  return tickets;
}

let tickets = parseTickets('tickets/test.csv');
let splitTickets = splitArray(3, tickets);
for (const ticketSet of splitTickets) {
  refreshTickets(ticketSet);
}