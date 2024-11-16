// utils/wordCounter.js

function countWords(text) {
    if (!text) return 0;
    
    // Remove extra spaces, new lines, and punctuation that do not form part of words
    const cleanedText = text.replace(/[\s\n\r]+/g, ' ').trim();
    
    // Split the cleaned text by space to count words
    const wordsArray = cleanedText.split(' ');
    return wordsArray.filter(word => word.length > 0).length;
  }
  
  module.exports = { countWords };
  