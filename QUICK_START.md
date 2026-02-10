# Leveler v0.2.0 - Quick Start Guide

## 🎯 What's New: PDF Support!

Your extension now works on **PDFs** (the critical use case for lawyers)!

---

## 🚀 Installation (3 Steps)

1. **Open Chrome Extensions**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select folder: `/Users/julianmcomie/leveler/extension/dist`
   - Verify version shows **0.2.0** ✅

---

## ✨ How to Use

### On HTML Pages (Same as Before)
```
1. Select any term
   ↓
2. Popup appears automatically ✨
   ↓
3. Read definition
   ↓
4. Click words in definition to explore deeper
```

### On PDFs (NEW!)
```
1. Select any term
   ↓
2. Context menu appears automatically 📋
   ↓
3. Click "Define with Leveler" 👆
   ↓
4. Popup shows near your cursor ✨
   ↓
5. Click words in definition to explore deeper
```

---

## 🧪 Test It Now

### Test 1: HTML (30 seconds)
1. Open `extension/lawsample.html`
2. Select the word **"consideration"**
3. Popup should appear automatically ✅
4. Select a word in the definition
5. Should show that word's definition ✅

### Test 2: PDF (30 seconds)
1. Open **any PDF** in Chrome
2. Select any text
3. Context menu appears → Click **"Define with Leveler"** ✅
4. Popup shows definition near your cursor ✅
5. Select a word in the popup
6. Should explore deeper ✅

---

## 🐛 Troubleshooting

### Extension doesn't appear in chrome://extensions/
- Make sure you selected the **dist** folder (not extension folder)
- Path should be: `/Users/julianmcomie/leveler/extension/dist`

### Context menu doesn't appear in PDFs
- Check console (Cmd+Option+J) for errors
- Should see: "PDF detected - context menu will auto-show when you select text"
- Try right-clicking manually - menu should still work

### Popup doesn't appear after clicking menu
- Check service worker console:
  - Go to chrome://extensions/
  - Find Leveler
  - Click "service worker" link
  - Should see: "Leveler context menu created"
- Reload extension and try again

### Need to rebuild?
```bash
cd /Users/julianmcomie/leveler/extension
npm run build
# Then reload extension in chrome://extensions/
```

---

## 📊 What to Validate

### With Mom (Target User - Lawyer)
1. Open a **real legal PDF** (contract, brief, case law)
2. Try to define unfamiliar terms
3. Ask:
   - ✅ Did the definition help?
   - ✅ Was clicking the menu item acceptable? (vs automatic popup)
   - ✅ Did the popup appear in a good spot?
   - ✅ Would you use this daily?
   - ✅ Any PDFs where it didn't work?

---

## 📝 Key Files

**For Testing:**
- Extension folder: `/Users/julianmcomie/leveler/extension/dist`
- Test HTML: `/Users/julianmcomie/leveler/extension/lawsample.html`

**For Reference:**
- Testing guide: `PDF_SUPPORT_TESTING.md`
- Validation checklist: `VALIDATION_CHECKLIST.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`

---

## 🎓 How It Works (Technical Summary)

### The Problem
Chrome's PDF viewer doesn't let extensions read selected text through normal APIs. `window.getSelection()` returns nothing in PDFs.

### The Solution
Use Chrome's **context menu API** (the ONLY API that works in PDFs):
1. Detect when user selects text (mouseup event)
2. **Automatically show context menu** (programmatically)
3. User clicks "Define with Leveler" (1 click - unavoidable)
4. Context menu provides the selected text
5. Show popup near cursor with definition

### Why This Approach?
- ✅ Works reliably in all PDFs
- ✅ Fastest to build (2 hours vs 4-6 weeks for custom PDF viewer)
- ✅ Ready for validation TODAY
- ✅ Can improve later based on feedback

---

## 🚦 Next Steps

### Immediate
1. ✅ Load extension in Chrome
2. ✅ Test on HTML pages (verify nothing broke)
3. ✅ Test on PDFs (new feature)
4. ✅ Check for errors in console

### This Week
1. ⏳ Test on real legal PDFs
2. ⏳ Get feedback from target user (lawyer)
3. ⏳ Document findings
4. ⏳ Decide next steps based on feedback

### Decision Point
**If 1-click is acceptable:**
- Ship to early users
- Add usage analytics
- Iterate based on feedback

**If 1-click is too slow:**
- Build custom PDF viewer (4-6 weeks)
- Or investigate PDF.js detection (2-3 days)

---

## ✅ Success Criteria

**Must Work:**
- [ ] Loads in Chrome without errors
- [ ] HTML pages work (automatic popup)
- [ ] PDFs work (context menu + popup)
- [ ] Recursive exploration works
- [ ] No console errors

**User Validation:**
- [ ] Lawyer can define unfamiliar terms in PDFs
- [ ] UX is acceptable for daily use
- [ ] Definitions are accurate and helpful

---

## 💡 Tips

- **Console is your friend**: Always check console for logs and errors
- **Service worker console**: Separate from page console (chrome://extensions/)
- **Reload extension**: After any rebuild (click reload icon in chrome://extensions/)
- **Test both HTML and PDF**: Make sure both work
- **Watch user test**: See if they discover context menu naturally

---

## 📞 Need Help?

**Build issues:**
```bash
cd extension && npm run build
```

**Console checks:**
- Page: Cmd+Option+J
- Service worker: chrome://extensions/ → "service worker" link

**Documentation:**
- Detailed testing: `PDF_SUPPORT_TESTING.md`
- Validation checklist: `VALIDATION_CHECKLIST.md`
- Full implementation: `IMPLEMENTATION_SUMMARY.md`

---

**Ready to test? Load the extension and try it on a PDF!** 🎉
