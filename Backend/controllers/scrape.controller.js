const puppeteer = require('puppeteer');
const {JSDOM} = require('jsdom');
const {Readability} = require('@mozilla/readability');

const { countWords } = require('../utils/wordCounter');

async function scrapeSingleUrl(url) {
    try {
        // Launch Puppeteer browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
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

            return { totalText };
        });

        const pageContent = await page.content();

        // Create a JSDOM instance with the HTML content
        const dom = new JSDOM(pageContent, { url });
        const document = dom.window.document;

        // Use Readability to parse the document
        const reader = new Readability(document);
        const article = reader.parse();

        await browser.close();

        // Count words using the utility function
        const totalWordCount = countWords(extractedContent.totalText);
        article ? contentWordCount = countWords(article.textContent) + countWords(article.title) : contentWordCount = 0;

        return {
            url,
            totalReadableText: totalWordCount,
            blogContentText: contentWordCount,
        };
    } catch (error) {
        console.error(`Error scraping the URL ${url} with Puppeteer:`, error.message);
        return {
            url,
            error: `Error scraping the URL ${url}`
        };
    }
}

async function scrapeUrls(req, res) {
    const { urlList } = req.body;

    if (!urlList) {
        return res.status(400).json({ error: 'URLs are required' });
    }

    if (!Array.isArray(urlList) || urlList.length === 0) {
        return res.status(400).json({ error: 'Invalid URL format. Provide space-separated URLs or an array of URLs.' });
    }

    try {
        // Process all URLs concurrently
        const results = await Promise.all(
            urlList.map(async (url) => {
                try {
                    return await scrapeSingleUrl(url);
                } catch (error) {
                    return { url, error: error.message };
                }
            })
        );
        res.json({ results });
    } catch (error) {
        if (browser) await browser.close();
        console.error('Error scraping the URLs:', error.message);
        res.status(500).json({ error: 'Failed to scrape the URLs' });
    }
}

module.exports = { scrapeUrls };