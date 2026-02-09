# Leveler Extension - Quick Setup Guide

Hi Mom! This guide will help you install and test the Leveler Chrome extension.

## What is Leveler?

Leveler is a Chrome extension that helps you understand technical legal terms instantly while reading. Just highlight any word or phrase, and a popup will show you a short, context-aware definition - no need to leave the page or search Google.

**Key Features:**
- Highlight any term to see a 10-word definition
- Definitions understand the context of your sentence
- Click words in the definition to explore deeper ("recursive exploration")
- Works on any website (legal databases, PDFs, news articles, etc.)

## Installation (5 minutes)

### Step 1: Get the Extension Folder

Julian will send you a folder called `leveler-extension` via AirDrop, email, or Dropbox. Save it somewhere easy to find (like your Desktop or Documents folder).

### Step 2: Open Chrome Extensions

1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. You'll see a page showing all your Chrome extensions

### Step 3: Enable Developer Mode

1. Look in the **top right corner** of the extensions page
2. Find the toggle switch labeled **"Developer mode"**
3. Turn it **ON** (it should turn blue)

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Find and select the `leveler-extension/dist` folder you saved earlier
3. Click **"Select"** or **"Open"**

### Step 5: Verify It's Working

You should now see a "Leveler" extension card on the extensions page. If it says "Errors", click "Details" and let Julian know what it says.

## How to Use It

### Basic Usage

1. Open any webpage with legal text (try the included `test.html` file, or a Westlaw case, or a contract)
2. Highlight any unfamiliar term (like "estoppel", "subrogation", "prima facie")
3. Wait 1-2 seconds
4. A small popup will appear with a short definition
5. Click the **X** button or click anywhere outside the popup to close it

### Recursive Exploration (The Cool Part!)

1. When you see a definition, try highlighting a word **within the popup itself**
2. A new definition will appear for that word
3. You can keep going deeper to explore related concepts
4. The extension remembers what you've already looked up to avoid circular definitions

### Example Walkthrough

Let's say you're reading a contract and see this sentence:

> "The defendant is barred by **estoppel** from denying the contract."

1. Highlight "estoppel"
2. Popup appears: "Legal bar preventing contradicting prior claim or position"
3. Now highlight "contradicting" within that popup
4. New popup: "Asserting the opposite of a previous statement"
5. Keep exploring as needed!

## Testing Tasks (20-30 minutes)

Please test the extension and take notes on your experience:

### Test 1: Basic Legal Terms

1. Open the `test.html` file (Julian will include this)
2. Highlight these legal terms and note if definitions are helpful:
   - "estoppel"
   - "subrogation"
   - "prima facie"
3. Are the definitions clear and concise?
4. Do they match what you'd expect from a legal dictionary?

### Test 2: Real Legal Documents

1. Open a contract, case summary, or legal document you're working on
2. Highlight 5-10 unfamiliar terms
3. Note:
   - Does the definition make sense in context?
   - Is it better/worse than Googling the term?
   - Does it save you time?

### Test 3: Recursive Exploration

1. Find a complex legal term
2. Highlight it to see the definition
3. Highlight 2-3 words within that definition
4. Keep going 3-4 levels deep
5. Does this help you understand the original term better?

### Test 4: Different Websites

Try using the extension on:
- [ ] Westlaw or LexisNexis case summary
- [ ] PDF contract opened in Chrome
- [ ] Wikipedia legal article
- [ ] News article about a legal case
- [ ] Google Docs (this might NOT work - that's expected)

## Feedback Questions

After testing for a week, please answer these:

### Usability
1. How easy was it to install and start using? (1-10)
2. Did you encounter any bugs or issues?
3. Was the popup positioning annoying or helpful?
4. Did you use the recursive exploration feature? Why or why not?

### Value
5. How much time did it save vs. Googling terms? (estimate minutes/day)
6. Were the definitions accurate and contextually relevant?
7. Which types of documents was it MOST useful for?
8. Which types of documents was it LEAST useful for?

### Would You Pay?
9. Would you use this regularly in your work?
10. Would you pay $5-10/month for this? Why or why not?
11. Would your law firm pay for this as a team tool?
12. What's missing that would make this a "must-have" tool?

## Troubleshooting

### Extension Won't Load

- Make sure you selected the `dist` folder inside `leveler-extension`, not the `leveler-extension` folder itself
- Check for error messages on the extension card
- Try clicking "Reload" on the extension card
- Text Julian with a screenshot if it still doesn't work

### Popup Doesn't Appear

- Make sure you highlighted at least 2 characters
- Check that the extension is enabled (toggle should be blue)
- Try refreshing the page
- Check if the site has unusual security settings
- Text Julian with the website URL and what you highlighted

### Popup Shows "Error"

- This might mean the API is down or rate limited
- Try again in a few minutes
- If it persists, text Julian

### Definitions Are Inaccurate

- This is great feedback! Note which terms gave poor definitions
- The AI is learning, so early feedback is very valuable

## Privacy & Data

- The extension only sends highlighted text and surrounding sentence to the API
- No document content is saved or stored
- Rate limited to 100 lookups per day to control costs
- Your lookup history is not tracked or saved

## Next Steps

After 1-2 weeks of testing:
1. Julian will schedule a 30-minute call to discuss feedback
2. Share with 2-3 colleagues if you found it useful
3. Collect their feedback too
4. Decide if this is worth building out further

## Questions?

Text or call Julian anytime! This is a very early MVP, so bugs are expected. Your honest feedback is incredibly valuable.

Thanks for testing! 🎉
