const express = require('express');
const router = express.Router();
const { scrapeUrls } = require('../controllers/scrape.controller.js');

// POST route to handle URL scraping
router.post('/', scrapeUrls);

module.exports = router;
