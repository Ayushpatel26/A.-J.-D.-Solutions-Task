const puppeteer = require('puppeteer');
const { countWords } = require('../utils/wordCounter');

async function scrapeUrls(req, res) {
    const { urls } = req.body;

    if (!urls) {
        return res.status(400).json({ error: 'URLs are required' });
    }

    const urlList = typeof urls === 'string' ? urls.split(' ').map(url => url.trim()) : urls;
    console.log(urlList);

    if (!Array.isArray(urlList) || urlList.length === 0) {
        return res.status(400).json({ error: 'Invalid URL format. Provide space-separated URLs or an array of URLs.' });
    }

    let browser;
    try {
        // Launch Puppeteer browser
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        async function scrapeSingleUrl(url) {
            try {
                // Go to the URL and wait for the page to load
                await page.goto(url, { waitUntil: 'networkidle2' });

                // Extract the content from the page
                const extractedContent = await page.evaluate(() => {
                    // Function to recursively get visible text content from elements
                    function getVisibleText(element) {
                        if (element.nodeType === Node.ELEMENT_NODE) {
                            const style = window.getComputedStyle(element);
                            // Ignore hidden or non-visible elements
                            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                                return '';
                            }
                        }

                        // If it's a text node, return the text content
                        if (element.nodeType === Node.TEXT_NODE) {
                            return element.textContent.trim();
                        }

                        // If it's an element node, recursively get the text of children
                        if (element.nodeType === Node.ELEMENT_NODE) {
                            let text = '';
                            for (const child of element.childNodes) {
                                text += ' ' + getVisibleText(child);
                            }
                            return text.trim();
                        }

                        return '';
                    }

                    // Extract Total Readable Text from the entire body
                    const totalText = getVisibleText(document.body);

                    // Calculate non-content text
                    let nonContentText = '';

                    // Target specific sections for non-content
                    const nonContentSelectors = ['header', 'footer', 'nav', '[class*="sidebar"]', '[id*="sidebar"]', '[class*="footer"]', '[id*="footer"]', '[class*="navbar"]', '[id*="navbar"]'];
                    nonContentSelectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            nonContentText += ' ' + getVisibleText(element);
                        });
                    });

                    return { totalText, nonContentText };
                });

                // Count words using the utility function
                const totalWordCount = countWords(extractedContent.totalText);
                const nonContentWordCount = countWords(extractedContent.nonContentText);

                return {
                    url,
                    totalReadableText: totalWordCount,
                    blogContentText: totalWordCount - nonContentWordCount,
                };
            } catch (error) {
                console.error(`Error scraping the URL ${url} with Puppeteer:`, error.message);
                return {
                    url,
                    error: `Error scraping the URL ${url}`
                };
            }
        }
        // Process all URLs concurrently
        const results = await Promise.all(urlList.map(scrapeSingleUrl));

        await browser.close();

        res.json({ results });
    } catch (error) {
        if (browser) await browser.close();
        console.error('Error scraping the URLs:', error.message);
        res.status(500).json({ error: 'Failed to scrape the URLs' });
    }
}

module.exports = { scrapeUrls };