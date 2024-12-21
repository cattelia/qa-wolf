

### Task: 
Edit the `index.js` file in this project to go to Hacker News/newest and validate 
that EXACTLY the first 100 articles are sorted from newest to oldest. 
You can run your script with the node `index.js` command.

# Goals:

1. ☑ Open Browser (Chrome, always Chrome) 
    ```js
    const browser = await chromium.launch({ headless: false, channel: 'chrome' });

    // {channel: 'chrome'} is used to force Chrome as the default browser
    // I had to download the following playwright package to get this to work:
    //        ~$ npx playwright install chrome
    ```
2.  ☑ Create context and open page
    ```js
    const context = await browser.newContext();
    const page = await context.newPage();
    ```
3. ☑ Enter URL: https://news.ycombinator.com/newest
    ```js
    await page.goto("https://news.ycombinator.com/newest");
    ```
4. ☑ Find HTML/CSS elements/attributes
    
    1. ☑ The ranking number, "1." - "100."
    
        __We will target the rank through:__

        ```js   
        const rankClass = await page.locator('.rank');

        // 1. ... 100.
        ```
        You'll notice that it is a string, so we want to convert it to  a number so we can track our counter later.

        _Confirmed through:_
        ```js
        let rank = await sortHackerNewsArticles();
        console.log(rank)           // 1.
        console.log(typeof rank)    // string
        ```

        __Strip the "." and make it into a num type using something like this:__
        ```js
        const str = "1."
        // convert str -> num and slice "." off the end.
        console.log(Number(str.slice(0, -1)))
        ```
    2. ☑ The ranking date, `2024-11-19T17:06:11 1732035971`
    
        ~~We will target the date through:
        `const dateClass = await page.locator('span.age');`~~
        
        We found later that we had to use: 
        ```js
        dateClass = await page.locator('span.age').getAttribute("title");
        ```

5. Aggregate the information comparing that the first item is newer than the last item.

    _Something to this affect:_
    There are only 30 elements per page, so we want to start the index +1 prior to starting the comparison. _This was worked through the `.rank` first just to prove concept._
    
    ```js
    for ( let i = 1; i <= 29; i++ ) {
      var oldNth = await page.locator('.rank').nth(i-1).textContent();
      var newNth = await page.locator('.rank').nth(i).textContent();
      //array.push(rank);
      oldNth = Number(oldNth.slice(0, -1));
      newNth = Number(newNth.slice(0, -1));

      console.log((oldNth < newNth), oldNth, newNth)
    }
    ```
6. ☑ Grab all 100 articles. Each page only has 30 articles on it, we need to go to the next pages by clicking, `.morelink` and comparing them through the logic in `5.`.
    ```js
    await page.locator('.morelink').click()
    ```

7. ☑ Accurately scrape date and compare appropriately.
     Using step `4.2` we got the value of the date but it's not actually a date oject, it is a string.

    1. ☑ Convert the string to a date obj
      ```js
      var date = await dateLocator.nth(i).getAttribute("title");
      // str 2024-11-19T17:06:11 1732035971
      date = date.substring(0, 19);
      // str "2024-11-19T17:06:11"
      date = new Date(date).toISOString();
      // date 2024-11-19T17:06:11Z
      ```
    2. ☑ Just like the articles, we are going to compare `n-1` to `n` and determine if the time for the date is older than the next.




    
### _General notes:_
- We need to use `await` here or else this script will jump to the next page before we are even able to look at all of the data.
- Avoid repeating myself in the code.
- The `Rank` is only used to keep track of where I am, otherwise we are comparing `span[title][n-1]` to `span[title][n]`:
  - Return `false` if `n-1` is not newer than `n`
  - Return `true` if all 100 articles are from newest to oldest.

<br><br>

# Getting Playwright to use `Chrome` as default
### I wanted `Chrome` to open when running this program.
Adding `chrome` to the `playwright.config.js` file.
```js
{
  name: 'chrome',
  use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // or 'chrome-beta'
},
```

As well as changing `chromium` to `chrome` in the `index.js` file as appropriate.

### Ran to see if `chrome.*` update work as I thought it would, but no. I had to update packages and download `Chrome` explicitly.
_Items redacted for privacy._

```bash
~$ node index.js 
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝

Node.js v23.2.0

~$ npx playwright install
 
Downloading Chromium 119.0.6045.9 (playwright build v1084) from https://playwright.azureedge.net/builds/chromium/1084/chromium-linux.zip
155.8 Mb [====================] 100% 0.0s
Downloading FFMPEG playwright build v1009 from https://playwright.azureedge.net/builds/ffmpeg/1009/ffmpeg-linux.zip
2.6 Mb [====================] 100% 0.0s
Downloading Firefox 118.0.1 (playwright build v1425) from https://playwright.azureedge.net/builds/firefox/1425/firefox-ubuntu-22.04.zip
80.8 Mb [====================] 100% 0.0s
Downloading Webkit 17.4 (playwright build v1921) from https://playwright.azureedge.net/builds/webkit/1921/webkit-ubuntu-22.04.zip
82.9 Mb [====================] 100% 0.0s


~$ npx playwright install chrome

...+ curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
...+ apt-get install -y ./google-chrome-stable_current_amd64.deb
...+ google-chrome --version

Google Chrome 131.0.6778.85
```

__It worked after this.__

# Scrape and use the Data

As Playwright is new for me, understanding how it scrapes data was a little to get used to and then what methods do what. For example, I could grab data from `.innerText()` but when trying to print the end result, I would get `Promise{ <data> }` or `Promise{ pending }` not just the data. 

I want to avoid using `.then()` as I don't think it is quite as "pretty"/"sleek" (blame the Python in me). I found other methods: `allInnerTexts()`, `*.all()`, `.textContent()` and so on. Some return arrays, some singular items. I have chosen `.textContent()` as to grab only 1 item at a time.

As we know from step `5.`, there are 30 articles per page. To address the problems above as well as systematically check each item against their earlier counterpart, I want to compare `foo[i-1]` and `foo[i]`, where `foo` will be the extracted posted date.

Currently, to test proof of concept, I have just targeted the `.rank` as they are easy linear numbers to compare to.

```js
// force the index to start at 1 rather than 0, going until index 29 (article 30).
  for ( let i = 1; i <= 29; i++ ) {
    // grab index 0 ... index n-1
    var oldNth = await page.locator('.rank').nth(i-1).textContent();
    // grab index 1 ... index n
    var newNth = await page.locator('.rank').nth(i).textContent();
    //array.push(rank);
    // convert string to number to use boolean operation later: "n." => n
    // and slice the "." off of the end
    oldNth = Number(oldNth.slice(0, -1));
    newNth = Number(newNth.slice(0, -1));
    // perform boolean operation to confirm if n-1 < 1
    // return `true` if n-1 < 1 and `false` if not.
    console.log((oldNth < newNth), oldNth, newNth)
  }
```

Again, this is not the data we are actually wanting to scrape but this is the proof of concept as well as data collection and processing. 

# I don't want to repeat my code.
I know that I will be running this `for loop` above 4 times and I would like re-use the code I made. So before I move on to tackling comparing dates, I want to get a function call in here to do the work for me. I am going to call it, `dateComparison`.

It will need to know what `page` we are looking at and what the target `.locator()` is.
_Thinking outloud, I think this will need to eventually be in a `while` loop to run until we hit index `99`._

```js
async function dateComparison(rankLocator) {
  //rankLocator === page.locator('.rank')
  for ( let i = 1; i <= 29; i++ ) {
    var oldNth = await rankLocator.nth(i-1).textContent();
    var newNth = await rankLocator.nth(i).textContent();

    oldNth = Number(oldNth.slice(0, -1));
    newNth = Number(newNth.slice(0, -1));

    console.log((oldNth < newNth), oldNth, newNth)
  }
};
```

#### Output:
```bash
Opening up Hacker News now.
true 1 2
true 2 3
...
true 28 29
true 29 30
# turned the page, as it were. 
true 31 32
true 32 33
...
true 58 59
true 59 60
```

Just like I do not want to compare numbers over and over again, I do not want to individually call `.morelink`. I want to automatically call 
`await page.locator('.morelink').click();` as many times as I need until I reach article 100.

### Before
```js
  await dateComparison(rankClass); // 30

  await page.locator('.morelink').click();

  await dateComparison(rankClass); // 60

  await page.locator('.morelink').click();

  await dateComparison(rankClass); // 90

  await page.locator('.morelink').click();

  await dateComparison(rankClass); // 100 is in here
```

### After
```js  
var number = null;

while (number < 100) {
  var number = await dateComparison(rankClass); // returns num
  await page.locator('.morelink').click();
}
```

# Great, but we still are just looking at `Rank` and not `Date`
Okay, so we have the basis of what we want this to look like. Now time to tackle the `date`

I have currently tried:

```js
var date1 = dateLocator.innerText(); // Promise { '1 minute ago' }
var date2 = dateLocator.textContent(); // Promise { '1 minute ago' }

var oldDate = await dateLocator.nth(i-1).innerText(); // 1 minute ago
var newDate = await dateLocator.nth(i).innerText(); // 1 minute ago
```

On `Hacker News` the `span.age[title]` has is ISO8601 date, `2024-11-21T20:37:56 1732221476` while the text it is grabbing is:
  "1 hour ago" text.

Ah, I see. Playwright has <a href="https://playwright.dev/docs/api/class-elementhandle#element-handle-get-attribute">`.getAttribute()`</a> - let's see if that works. 
```js
var oldDate = await dateLocator.nth(i-1).getAttribute("title");
var newDate = await dateLocator.nth(i).innerText();

console.log("Old Date " + oldDate + " New Date " + newDate);
// Old Date 2024-11-22T02:22:06 1732242126 New Date 3 hours ago
```

I found a method that will let me compare ISO dates to each other, which is amazing. `.toISOString()` https://stackoverflow.com/questions/25159330/how-to-convert-an-iso-date-to-the-date-format-yyyy-mm-dd
```js
// Get the date from the title attribute
var newDate = await dateLocator.nth(i-1).getAttribute("title"); //2024-11-22T02:22:06 1732242126
// convert the date into something that can be used by .toISOString() method
newDate = oldDate.substring(0, 19);
// make a new Date object that these dates can be compared against each other.
newDate = new Date(oldDate).toISOString();
```

# Don't forget how to read a clock.
So, I got a tiny bit hung up because I named my var's wrong from the very beginning on `newNth` and `oldNth`, which was making my logic fail when it was supposed to be passing.
Then I realised that I forgot how to read a clock for a second.
Fixed that.

# Final Output
Of course, you will see me execute this but here we go:
```bash
$ ls
Q2.mp4  README.md  index.js  package-lock.json  package.json  playwright.config.js  sara_notes.md

$ npm i

added 5 packages, and audited 6 packages in 6s

found 0 vulnerabilities
npm notice
npm notice New major version of npm available! 10.9.2 -> 11.0.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.0.0
npm notice To update run: npm install -g npm@11.0.0
npm notice

$ ls
Q2.mp4  README.md  index.js  node_modules  package-lock.json  package.json  playwright.config.js  sara_notes.md

$ node index.js
Opening up Hacker News now.
---------------------------

Article 1 is newer than Article 2
Article 2 is newer than Article 3
Article 3 is newer than Article 4
Article 4 is newer than Article 5
Article 5 is newer than Article 6
Article 6 is newer than Article 7
Article 7 is newer than Article 8
Article 8 is newer than Article 9
Article 9 is newer than Article 10
Article 10 is newer than Article 11
Article 11 is newer than Article 12
Article 12 is newer than Article 13
Article 13 is newer than Article 14
Article 14 is newer than Article 15
Article 15 is newer than Article 16
Article 16 is newer than Article 17
Article 17 is newer than Article 18
Article 18 is newer than Article 19
Article 19 is newer than Article 20
Article 20 is newer than Article 21
Article 21 is newer than Article 22
Article 22 is newer than Article 23
Article 23 is newer than Article 24
Article 24 is newer than Article 25
Article 25 is newer than Article 26
Article 26 is newer than Article 27
Article 27 is newer than Article 28
Article 28 is newer than Article 29
Article 29 is newer than Article 30

End of the page, Index: 30
Going to next page

Article 31 is newer than Article 32
Article 32 is newer than Article 33
Article 33 is newer than Article 34
Article 34 is newer than Article 35
Article 35 is newer than Article 36
Article 36 is newer than Article 37
Article 37 is newer than Article 38
Article 38 is newer than Article 39
Article 39 is newer than Article 40
Article 40 is newer than Article 41
Article 41 is newer than Article 42
Article 42 is newer than Article 43
Article 43 is newer than Article 44
Article 44 is newer than Article 45
Article 45 is newer than Article 46
Article 46 is newer than Article 47
Article 47 is newer than Article 48
Article 48 is newer than Article 49
Article 49 is newer than Article 50
Article 50 is newer than Article 51
Article 51 is newer than Article 52
Article 52 is newer than Article 53
Article 53 is newer than Article 54
Article 54 is newer than Article 55
Article 55 is newer than Article 56
Article 56 is newer than Article 57
Article 57 is newer than Article 58
Article 58 is newer than Article 59
Article 59 is newer than Article 60

End of the page, Index: 60
Going to next page

Article 61 is newer than Article 62
Article 62 is newer than Article 63
Article 63 is newer than Article 64
Article 64 is newer than Article 65
Article 65 is newer than Article 66
Article 66 is newer than Article 67
Article 67 is newer than Article 68
Article 68 is newer than Article 69
Article 69 is newer than Article 70
Article 70 is newer than Article 71
Article 71 is newer than Article 72
Article 72 is newer than Article 73
Article 73 is newer than Article 74
Article 74 is newer than Article 75
Article 75 is newer than Article 76
Article 76 is newer than Article 77
Article 77 is newer than Article 78
Article 78 is newer than Article 79
Article 79 is newer than Article 80
Article 80 is newer than Article 81
Article 81 is newer than Article 82
Article 82 is newer than Article 83
Article 83 is newer than Article 84
Article 84 is newer than Article 85
Article 85 is newer than Article 86
Article 86 is newer than Article 87
Article 87 is newer than Article 88
Article 88 is newer than Article 89
Article 89 is newer than Article 90

End of the page, Index: 90
Going to next page

Article 91 is newer than Article 92
Article 92 is newer than Article 93
Article 93 is newer than Article 94
Article 94 is newer than Article 95
Article 95 is newer than Article 96
Article 96 is newer than Article 97
Article 97 is newer than Article 98
Article 98 is newer than Article 99
Article 99 is newer than Article 100

The 100th article.
Ending script

All 100 articles are in order from newest to oldest.
```


<br><br>
### __*Resources and Notes:*__

// Attribute selecting.
https://stackoverflow.com/questions/58686264/html-how-to-refer-to-span-title-inside-a-class

// Attribute selectors work on all Web Browsers.
https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors

// Find and create array all in one, Playwright
https://stackoverflow.com/questions/61453673/how-to-get-a-collection-of-elements-with-playwright

// Getting started @ t=7m23s
https://playwright.dev/docs/getting-started-vscode

// F&L @ t=3m46s
https://www.youtube.com/watch?v=B-1uNYVgUMA

// Writing tests
https://playwright.dev/docs/writing-tests

// Using `locator.allInnerTexts()`: This method returns an array of the innerText values for all elements matching the locator. 
https://playwright.dev/docs/api/class-locator

```js
const texts = await page.locator('.my-element').allInnerTexts();
console.log(texts); // Output: ['Text1', 'Text2', ...]
```

// From `halfer` on stackoverflow: https://stackoverflow.com/questions/38884522/why-is-my-asynchronous-function-returning-promise-pending-instead-of-a-val

  _I ran into the same issue and the answer for the problem is since ES2017, that you can simply await the functions return value (as of now, only works in async functions), like:_
  ```js
  let AuthUser = function(data) {
    return google.login(data.username, data.password)
  }

  let userToken = await AuthUser(data)
  console.log(userToken) // your data
  ```

// From `Tousif Ahmed` on stackoverflow: https://stackoverflow.com/questions/25159330/how-to-convert-an-iso-date-to-the-date-format-yyyy-mm-dd

  _Just crop the string:_
  ```js
  var date = new Date("2013-03-10T02:00:00Z");
  date.toISOString().substring(0, 10);
  ```
  _Or if you need only date out of string._
  ```js
  var strDate = "2013-03-10T02:00:00Z";
  strDate.substring(0, 10);
  ```
