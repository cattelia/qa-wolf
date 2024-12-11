// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
/* updated to `chrome` originally `chromium` */
// See: https://playwright.dev/docs/browsers

async function sortHackerNewsArticles() {
  // launch browser, forcing it to use Google Chrome
  // going  `headless`
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // grab HTML elements/attributes for rank and date for the 30 articles
  const rankClass = await page.locator('.rank')
  const dateClass = await page.locator('span.age');

  // keep scraping until we get to Article 100 or function aborts
  var number = null;
  while (number < 100) {
    var number = await dateComparison(rankClass, dateClass); 
    await page.locator('.morelink').click();
  };
  
};

async function dateComparison(rankLocator, dateLocator) {
  // rankLocator === rankClass === page.locator('.rank')
  // dateLocator === dateClass === page.locator('span.age');

  // process to 30 articles on this page using *.nth() method to grab the exact index and .textContent() to get the content.
  for ( let i = 1; i <= 29; i++ ) {
    // get ranks
    var newNth = await rankLocator.nth(i-1).textContent();
    var oldNth = await rankLocator.nth(i).textContent();
    // get dates
    var newDate = await dateLocator.nth(i-1).getAttribute("title");
    var oldDate = await dateLocator.nth(i).getAttribute("title");

    // convert Rank str => num, slicing "." off at the end
    newNth = Number(newNth.slice(0, -1));
    oldNth = Number(oldNth.slice(0, -1));
    // convert Date str => date obj, using .toISOString()
    newDate = newDate.substring(0, 19);
    newDate = new Date(newDate).toISOString();
    oldDate = oldDate.substring(0, 19);
    oldDate = new Date(oldDate).toISOString();

    
    // FOR SANITY CHECKING
    //console.log((oldNth < newNth), oldNth, newNth);
    //console.log("Article " + newNth + " on " + newDate + " is " + (newDate > oldDate) + " to Article " + oldNth + " on " + oldDate);


    // If ever the newDate is less than the oldDate (meaning that it is the older article) then exit script.
    // Otherwise, print output of current comparison.
    if (newDate < oldDate) {
      console.log("Article " + newNth + " is older than Article " + oldNth);
      console.log("Aborting script\n")
      process.exit(1)
    } else {
      console.log("Article " + newNth + " is newer than Article " + oldNth);
    }

    // print output on where we are with the articles ranking
    if (oldNth === 30 || oldNth === 60 || oldNth === 90) {
      console.log("\nEnd of the page, Index: " + oldNth);
      console.log("Going to next page\n");
      return oldNth

    } else if (oldNth === 100) {
      console.log("\nThe " + oldNth + "th article.")
      console.log("Ending script\n")
      return oldNth
    }
  } 

};


(async () => {
  console.log("Opening up Hacker News now.")
  console.log("---------------------------\n")
  await sortHackerNewsArticles();
  console.log("All 100 articles are in order from newest to oldest.")
})();


