/**
 * Smart Contracts on Cardano — Google Slides Generator
 * CAP 2026
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. Click "New project"
 * 3. Delete the default code and paste this entire file
 * 4. Click the "Run" button (or select createPresentation from the dropdown and run)
 * 5. On first run, it will ask for permissions — click "Review Permissions" and allow
 * 6. Check the Execution Log for the link to your new presentation
 *
 * This script generates a presentation on Cardano smart contracts with Aiken.
 * Focus: learning material, Ethereum vs Cardano differences, eUTXO concepts.
 */

// ─── Theme Colors ───────────────────────────────────────────────────────────

const COLORS = {
  bgDark:      '#ffffff',
  bgCard:      '#f0f4f8',
  accent:      '#0033ad',
  accentLight: '#0052cc',
  text:        '#1a1a2e',
  textDim:     '#6b7280',
  codeBg:      '#1e293b',
  codeText:    '#e2e8f0',
  codeKeyword: '#93c5fd',
  warning:     '#dc2626',
  success:     '#059669',
  gold:        '#b45309',
  ethereum:    '#627eea',
  cardano:     '#0033ad',
};

// ─── Main Entry Point ───────────────────────────────────────────────────────

function createPresentation() {
  const deck = SlidesApp.create('Smart Contracts on Cardano with Aiken — CAP 2026');

  // Remove the default blank slide
  deck.getSlides()[0].remove();

  slide01_title(deck);
  slide02_whatIsSmartContract(deck);
  slide03_whySmartContracts(deck);
  slide04_ethAccountModel(deck);
  slide05_cardanoUtxoModel(deck);
  slide06_ethVsCardanoContracts(deck);
  slide07_ethVsCardanoExecution(deck);
  slide08_eutxoTriangle(deck);
  slide09_validatorNotContract(deck);
  slide10_allValidatorTypes(deck);
  slide11_collateral(deck);
  slide12_aikenIntro(deck);
  slide13_validatorAnatomy(deck);
  slide14_helloWorldCode(deck);
  slide15_lockUnlockFlow(deck);
  slide16_aikenTraceLogs(deck);
  slide17_whatIsCip68(deck);
  slide18_cip68Structure(deck);
  slide19_cip68Lifecycle(deck);
  slide20_securityPatterns(deck);
  slide21_toolingEcosystem(deck);
  slide22_summary(deck);

  Logger.log('Presentation created: ' + deck.getUrl());
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function setBackground(slide) {
  slide.getBackground().setSolidFill(COLORS.bgDark);
}

function addTitle(slide, text, opts) {
  opts = opts || {};
  var top  = opts.top  || 10;
  var left = opts.left || 40;
  var w    = opts.width  || 640;
  var h    = opts.height || 40;
  var size = opts.size || 32;
  var box  = slide.insertTextBox(text, left, top, w, h);
  var style = box.getText().getTextStyle();
  style.setFontFamily('Montserrat');
  style.setFontSize(size);
  style.setBold(true);
  style.setForegroundColor(COLORS.text);
  return box;
}

function addBody(slide, lines, opts) {
  opts = opts || {};
  var top  = opts.top  || 55;
  var left = opts.left || 50;
  var w    = opts.width  || 620;
  var h    = opts.height || 340;
  var size = opts.size || 15;
  var text = lines.join('\n');
  var box  = slide.insertTextBox(text, left, top, w, h);
  var style = box.getText().getTextStyle();
  style.setFontFamily('Open Sans');
  style.setFontSize(size);
  style.setForegroundColor(COLORS.text);
  return box;
}

function addCodeBlock(slide, code, opts) {
  opts = opts || {};
  var top  = opts.top  || 160;
  var left = opts.left || 40;
  var w    = opts.width  || 640;
  var h    = opts.height || 120;
  var shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, w, h);
  shape.getFill().setSolidFill(COLORS.codeBg);
  shape.getBorder().setTransparent();
  shape.setContentAlignment(SlidesApp.ContentAlignment.TOP);
  var tf = shape.getText();
  tf.setText(code);
  var style = tf.getTextStyle();
  style.setFontFamily('Courier New');
  style.setFontSize(opts.fontSize || 12);
  style.setForegroundColor(COLORS.codeText);
  tf.getParagraphStyle().setSpaceAbove(2);
  tf.getParagraphStyle().setSpaceBelow(0);
  return shape;
}

function addNotes(slide, text) {
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(text);
}

function addSlideNumber(slide, num) {
  var box = slide.insertTextBox(String(num), 670, 385, 30, 20);
  var style = box.getText().getTextStyle();
  style.setFontFamily('Open Sans');
  style.setFontSize(10);
  style.setForegroundColor(COLORS.textDim);
}

function hideBorder(shape) {
  shape.getBorder().setTransparent();
}

function boldRanges(textRange, boldPhrases) {
  var raw = textRange.asString();
  boldPhrases.forEach(function(phrase) {
    var idx = raw.indexOf(phrase);
    while (idx !== -1) {
      textRange.getRange(idx, idx + phrase.length).getTextStyle().setBold(true);
      idx = raw.indexOf(phrase, idx + phrase.length);
    }
  });
}

function colorRanges(textRange, phrases, color) {
  var raw = textRange.asString();
  phrases.forEach(function(phrase) {
    var idx = raw.indexOf(phrase);
    while (idx !== -1) {
      textRange.getRange(idx, idx + phrase.length).getTextStyle().setForegroundColor(color);
      idx = raw.indexOf(phrase, idx + phrase.length);
    }
  });
}

function addLabeledBox(slide, label, lines, left, top, w, h, borderColor) {
  var box = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, w, h);
  box.getFill().setSolidFill(COLORS.bgCard);
  box.getBorder().setWeight(2);
  box.getBorder().getLineFill().setSolidFill(borderColor);

  var titleBox = slide.insertTextBox(label, left + 10, top + 5, w - 20, 22);
  var ts = titleBox.getText().getTextStyle();
  ts.setFontFamily('Montserrat'); ts.setFontSize(13); ts.setBold(true); ts.setForegroundColor(borderColor);

  var bodyText = lines.join('\n');
  var bodyBox = slide.insertTextBox(bodyText, left + 10, top + 28, w - 20, h - 35);
  var bs = bodyBox.getText().getTextStyle();
  bs.setFontFamily('Open Sans'); bs.setFontSize(12); bs.setForegroundColor(COLORS.text);
  return bodyBox;
}

function addStepBox(slide, text, left, top, w, h, fillColor, borderColor) {
  var bx = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, w, h);
  bx.getFill().setSolidFill(fillColor);
  bx.getBorder().setWeight(1);
  bx.getBorder().getLineFill().setSolidFill(borderColor);
  var tx = slide.insertTextBox(text, left, top + 3, w, h - 6);
  tx.getText().getTextStyle().setFontFamily('Open Sans');
  tx.getText().getTextStyle().setFontSize(10);
  tx.getText().getTextStyle().setForegroundColor(COLORS.text);
  tx.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  return tx;
}

function addArrow(slide, left, top) {
  var arrow = slide.insertTextBox('\u2192', left, top, 18, 25);
  arrow.getText().getTextStyle().setFontSize(16);
  arrow.getText().getTextStyle().setForegroundColor(COLORS.textDim);
}

// ─── Slide Builders ─────────────────────────────────────────────────────────

function slide01_title(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);

  var title = s.insertTextBox('Smart Contracts on\nCardano with Aiken', 40, 90, 640, 110);
  var ts = title.getText().getTextStyle();
  ts.setFontFamily('Montserrat'); ts.setFontSize(44); ts.setBold(true); ts.setForegroundColor(COLORS.text);

  var line = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 40, 210, 200, 4);
  line.getFill().setSolidFill(COLORS.accent);
  hideBorder(line);

  var sub = s.insertTextBox('From Ethereum Concepts to Cardano Validators', 40, 225, 640, 40);
  var ss = sub.getText().getTextStyle();
  ss.setFontFamily('Open Sans'); ss.setFontSize(20); ss.setForegroundColor(COLORS.accentLight);

  var foot = s.insertTextBox('Cardano Ambassador Program 2026', 40, 365, 640, 25);
  var fs = foot.getText().getTextStyle();
  fs.setFontFamily('Open Sans'); fs.setFontSize(12); fs.setForegroundColor(COLORS.textDim);

  addNotes(s, 'Welcome the audience. This session bridges Ethereum knowledge to Cardano smart contracts. By the end, participants will understand WHY Cardano chose a fundamentally different design, and will have built validators in Aiken and interacted with them from Java.');
}

function slide02_whatIsSmartContract(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'What is a Smart Contract?');

  var body = addBody(s, [
    'Code that lives on a blockchain and enforces rules automatically',
    '',
    'Executes deterministically \u2014 same input always gives same result',
    '',
    'No intermediary \u2014 the blockchain IS the trusted third party',
    '',
    'Once deployed, the rules cannot be changed',
    '',
    'Real-world analogy:',
    'A vending machine \u2014 put in money, press button, get item.',
    'No cashier needed. Rules are fixed in the machine itself.',
  ]);
  boldRanges(body.getText(), ['enforces rules automatically', 'deterministically', 'cannot be changed']);
  addSlideNumber(s, 2);
  addNotes(s, 'Emphasize the vending machine analogy \u2014 it captures the key properties: deterministic behavior, no human in the loop, fixed rules. Ask: "What happens if you put in the wrong amount?" Nothing \u2014 the machine rejects it. Same with smart contracts.');
}

function slide03_whySmartContracts(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'What Can Smart Contracts Do?');

  addLabeledBox(s, 'DeFi', [
    'Lending, borrowing, trading',
    'without banks or brokers',
  ], 30, 55, 210, 75, COLORS.accent);

  addLabeledBox(s, 'NFTs & Tokens', [
    'Create, transfer, enforce',
    'ownership rules on-chain',
  ], 255, 55, 210, 75, COLORS.success);

  addLabeledBox(s, 'DAOs', [
    'Governance voting and',
    'treasury management',
  ], 480, 55, 210, 75, COLORS.gold);

  addLabeledBox(s, 'Supply Chain', [
    'Track goods, verify origin,',
    'automate payments',
  ], 30, 145, 210, 75, COLORS.ethereum);

  addLabeledBox(s, 'Identity', [
    'Self-sovereign credentials',
    'and attestations on-chain',
  ], 255, 145, 210, 75, COLORS.warning);

  addLabeledBox(s, 'Gaming', [
    'In-game assets as NFTs,',
    'provably fair mechanics',
  ], 480, 145, 210, 75, COLORS.accentLight);

  var body = addBody(s, [
    'Key insight: smart contracts remove the need to trust a company or\nperson. You only need to trust the code \u2014 and the code is public.',
  ], {top: 240, size: 14});
  boldRanges(body.getText(), ['trust the code']);

  addSlideNumber(s, 3);
  addNotes(s, 'Show the breadth of use cases. The key takeaway is that smart contracts replace trusted intermediaries with transparent, auditable code. Every use case here has one thing in common: removing a middleman.');
}

function slide04_ethAccountModel(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Ethereum: The Account Model');

  var acctBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 40, 55, 300, 110);
  acctBox.getFill().setSolidFill('#eef2ff');
  acctBox.getBorder().setWeight(2);
  acctBox.getBorder().getLineFill().setSolidFill(COLORS.ethereum);

  var acctTitle = s.insertTextBox('Smart Contract Account', 50, 58, 280, 22);
  acctTitle.getText().getTextStyle().setFontFamily('Montserrat');
  acctTitle.getText().getTextStyle().setFontSize(12);
  acctTitle.getText().getTextStyle().setBold(true);
  acctTitle.getText().getTextStyle().setForegroundColor(COLORS.ethereum);

  var acctBody = s.insertTextBox('Balance: 50 ETH\nStorage: { mapping(addr => uint) }\nCode: Solidity bytecode\nNonce: 42', 50, 82, 280, 75);
  acctBody.getText().getTextStyle().setFontFamily('Courier New');
  acctBody.getText().getTextStyle().setFontSize(11);
  acctBody.getText().getTextStyle().setForegroundColor(COLORS.text);

  var body = addBody(s, [
    'How it works:',
    '  1. Contract has a persistent address with mutable state',
    '  2. Users call functions on the contract (like calling an API)',
    '  3. Contract reads/writes its own storage during execution',
    '  4. State changes happen inside the contract',
    '',
    'Think of it as: calling a method on an object that lives on-chain',
  ], {top: 180, size: 14});
  boldRanges(body.getText(), ['persistent address with mutable state', 'calling a method on an object']);

  addSlideNumber(s, 4);
  addNotes(s, 'Ethereum contracts are like objects in OOP \u2014 they have state (storage), behavior (code), and identity (address). When you interact with a contract, you CALL it, and it modifies its own internal state. This is intuitive for developers coming from web2.');
}

function slide05_cardanoUtxoModel(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Cardano: The UTXO Model');

  var utxo1 = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 40, 55, 190, 65);
  utxo1.getFill().setSolidFill('#f0fdf4');
  utxo1.getBorder().setWeight(2);
  utxo1.getBorder().getLineFill().setSolidFill(COLORS.success);
  var u1t = s.insertTextBox('UTXO #1\n50 ADA | addr_abc...', 48, 59, 175, 55);
  u1t.getText().getTextStyle().setFontFamily('Courier New');
  u1t.getText().getTextStyle().setFontSize(10);
  u1t.getText().getTextStyle().setForegroundColor(COLORS.text);

  var utxo2 = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 250, 55, 190, 65);
  utxo2.getFill().setSolidFill('#f0fdf4');
  utxo2.getBorder().setWeight(2);
  utxo2.getBorder().getLineFill().setSolidFill(COLORS.success);
  var u2t = s.insertTextBox('UTXO #2\n30 ADA | addr_abc...', 258, 59, 175, 55);
  u2t.getText().getTextStyle().setFontFamily('Courier New');
  u2t.getText().getTextStyle().setFontSize(10);
  u2t.getText().getTextStyle().setForegroundColor(COLORS.text);

  var utxo3 = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 460, 55, 230, 65);
  utxo3.getFill().setSolidFill('#fef3c7');
  utxo3.getBorder().setWeight(2);
  utxo3.getBorder().getLineFill().setSolidFill(COLORS.gold);
  var u3t = s.insertTextBox('UTXO #3 (at script addr)\n10 ADA + datum + validator', 468, 59, 215, 55);
  u3t.getText().getTextStyle().setFontFamily('Courier New');
  u3t.getText().getTextStyle().setFontSize(10);
  u3t.getText().getTextStyle().setForegroundColor(COLORS.text);

  var body = addBody(s, [
    'How it works:',
    '  1. No "accounts" \u2014 just unspent outputs (UTXOs) sitting on the ledger',
    '  2. Each UTXO = an address + a value + optional datum',
    '  3. Spending a UTXO destroys it and creates new UTXOs',
    '  4. A validator is a lock: it decides IF a UTXO can be consumed',
    '  5. The redeemer is the key: data the spender provides as proof',
    '',
    'Technically: a UTXO at a script address can only be spent when the',
    'validator script returns True given the (datum, redeemer, tx context).',
    '',
    'Your wallet "balance" is just the sum of all UTXOs at your address.',
  ], {top: 135, size: 14});
  boldRanges(body.getText(), ['No "accounts"', 'validator is a lock', 'redeemer is the key', 'returns True']);

  addSlideNumber(s, 5);
  addNotes(s, 'This is the fundamental mental shift. In Cardano, there are no accounts with balances. A smart contract doesn\'t store state \u2014 it validates whether a UTXO can be consumed. The validator is a lock, the redeemer is a key, and the datum is state inside the locked box. Your wallet balance is derived from UTXOs, not stored anywhere.');
}

function slide06_ethVsCardanoContracts(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Contracts vs Validators \u2014 The Key Difference');

  // Ethereum side
  var ethBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 30, 50, 320, 280);
  ethBox.getFill().setSolidFill('#eef2ff');
  ethBox.getBorder().setWeight(2);
  ethBox.getBorder().getLineFill().setSolidFill(COLORS.ethereum);

  var ethTitle = s.insertTextBox('Ethereum: Smart Contracts', 40, 55, 300, 22);
  ethTitle.getText().getTextStyle().setFontFamily('Montserrat');
  ethTitle.getText().getTextStyle().setFontSize(14);
  ethTitle.getText().getTextStyle().setBold(true);
  ethTitle.getText().getTextStyle().setForegroundColor(COLORS.ethereum);

  var ethBody = s.insertTextBox(
    'Contract DOES things:\n' +
    '  Reads and writes storage\n' +
    '  Calls other contracts\n' +
    '  Transfers tokens\n' +
    '  Creates new state\n\n' +
    'Execution:\n' +
    '  User sends message to contract\n' +
    '  Contract executes step-by-step\n' +
    '  State modified during execution\n' +
    '  Can fail mid-execution (out of gas)',
    40, 80, 300, 240);
  ethBody.getText().getTextStyle().setFontFamily('Open Sans');
  ethBody.getText().getTextStyle().setFontSize(13);
  ethBody.getText().getTextStyle().setForegroundColor(COLORS.text);

  // Cardano side
  var cadBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 370, 50, 320, 280);
  cadBox.getFill().setSolidFill('#f0fdf4');
  cadBox.getBorder().setWeight(2);
  cadBox.getBorder().getLineFill().setSolidFill(COLORS.success);

  var cadTitle = s.insertTextBox('Cardano: Validators', 380, 55, 300, 22);
  cadTitle.getText().getTextStyle().setFontFamily('Montserrat');
  cadTitle.getText().getTextStyle().setFontSize(14);
  cadTitle.getText().getTextStyle().setBold(true);
  cadTitle.getText().getTextStyle().setForegroundColor(COLORS.success);

  var cadBody = s.insertTextBox(
    'Validator CHECKS things:\n' +
    '  Answers: "Is this TX valid?"\n' +
    '  Returns True or False\n' +
    '  Cannot modify any state\n' +
    '  Cannot call other validators\n\n' +
    'Execution:\n' +
    '  User builds ENTIRE TX off-chain\n' +
    '  Validator only says yes/no\n' +
    '  All-or-nothing (atomic)\n' +
    '  Costs known BEFORE submission',
    380, 80, 300, 240);
  cadBody.getText().getTextStyle().setFontFamily('Open Sans');
  cadBody.getText().getTextStyle().setFontSize(13);
  cadBody.getText().getTextStyle().setForegroundColor(COLORS.text);

  var note = addBody(s, [
    'Ethereum = "Send me a message, I\'ll figure out what to do"',
    'Cardano  = "Show me the finished transaction, I\'ll say if it\'s valid"',
  ], {top: 340, size: 13});
  boldRanges(note.getText(), ['I\'ll figure out what to do', 'I\'ll say if it\'s valid']);

  addSlideNumber(s, 6);
  addNotes(s, 'THIS is the most important slide. Ethereum contracts DO things \u2014 they execute logic and change state. Cardano validators CHECK things \u2014 they only approve or reject. The user builds the entire transaction off-chain, and the validator is just a gatekeeper.');
}

function slide07_ethVsCardanoExecution(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Execution Flow Compared');

  // Ethereum flow
  var ethLabel = s.insertTextBox('Ethereum', 50, 55, 150, 22);
  ethLabel.getText().getTextStyle().setFontFamily('Montserrat');
  ethLabel.getText().getTextStyle().setFontSize(13);
  ethLabel.getText().getTextStyle().setBold(true);
  ethLabel.getText().getTextStyle().setForegroundColor(COLORS.ethereum);

  var ethSteps = ['User', 'Send TX', 'EVM runs\ncode', 'State\nchanges', 'Result'];
  var ethFills = ['#dbeafe', '#dbeafe', '#fef3c7', '#fee2e2', '#dbeafe'];
  for (var i = 0; i < ethSteps.length; i++) {
    addStepBox(s, ethSteps[i], 50 + i * 125, 78, 105, 45, ethFills[i], COLORS.ethereum);
    if (i < ethSteps.length - 1) addArrow(s, 155 + i * 125, 85);
  }

  // Cardano flow
  var cadLabel = s.insertTextBox('Cardano', 50, 140, 150, 22);
  cadLabel.getText().getTextStyle().setFontFamily('Montserrat');
  cadLabel.getText().getTextStyle().setFontSize(13);
  cadLabel.getText().getTextStyle().setBold(true);
  cadLabel.getText().getTextStyle().setForegroundColor(COLORS.success);

  var cadSteps = ['User builds\nfull TX', 'Submit', 'Validator:\nyes/no', 'Apply or\nreject', 'Result'];
  var cadFills = ['#f0fdf4', '#f0fdf4', '#fef3c7', '#f0fdf4', '#f0fdf4'];
  for (var j = 0; j < cadSteps.length; j++) {
    addStepBox(s, cadSteps[j], 50 + j * 125, 163, 105, 45, cadFills[j], COLORS.success);
    if (j < cadSteps.length - 1) addArrow(s, 155 + j * 125, 170);
  }

  var body = addBody(s, [
    'Key differences for developers:',
    '',
    '  Ethereum: you don\'t know the cost until execution finishes',
    '  Cardano: you know exact fees and outcome before submitting',
    '',
    '  Ethereum: contract can call other contracts during execution',
    '  Cardano: validators run independently, no cross-script calls',
    '',
    '  Ethereum: TX can partially succeed then fail (out of gas)',
    '  Cardano: TX either fully applies or is fully rejected (atomic)',
  ], {top: 220, size: 13});
  boldRanges(body.getText(), ['know exact fees', 'independently', 'fully applies or is fully rejected']);

  addSlideNumber(s, 7);
  addNotes(s, 'Walk through both flows. In Ethereum, the EVM executes code that modifies state \u2014 you don\'t know the outcome until execution completes. In Cardano, you build everything off-chain, know the exact cost, then submit. Validators are independent \u2014 no re-entrancy possible.');
}

function slide08_eutxoTriangle(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'The eUTXO Triangle: Datum, Redeemer, Context');

  addLabeledBox(s, 'Datum \u2014 The State', [
    'Data attached to a locked UTXO',
    'Set when ADA is sent to script',
    'Example: owner\'s pubkey hash',
    'Analogy: note inside a locked box',
  ], 30, 55, 200, 110, COLORS.accent);

  addLabeledBox(s, 'Redeemer \u2014 The Proof', [
    'Data provided when spending',
    'Proves you\'re allowed to spend',
    'Example: a password, an action',
    'Analogy: the key to the lock',
  ], 250, 55, 200, 110, COLORS.success);

  addLabeledBox(s, 'Script Context \u2014 Full TX', [
    'Entire transaction visible to script',
    'Inputs, outputs, fees, signers, mint',
    'Enables complex validation logic',
    'Analogy: security camera footage',
  ], 470, 55, 220, 110, COLORS.gold);

  var body = addBody(s, [
    'The validator receives all three and decides:',
    '"Given this datum, this redeemer, and this transaction... is this allowed?"',
    '',
    'Technically, the validator is a function:',
  ], {top: 180, size: 14});
  boldRanges(body.getText(), ['is this allowed?']);

  addCodeBlock(s, '  spend(datum: Option<Datum>, redeemer: Redeemer, own_ref: OutputReference, self: Transaction) -> Bool', {top: 252, left: 40, width: 640, height: 28, fontSize: 11});

  var body2 = addBody(s, [
    'For spending validators, the node calls this function for every script',
    'input in the transaction. If ANY validator returns False, the entire TX fails.',
  ], {top: 290, size: 13});
  boldRanges(body2.getText(), ['ANY validator returns False']);

  addSlideNumber(s, 8);
  addNotes(s, 'These three pieces are the foundation of all Cardano smart contracts. The datum is state left by the sender. The redeemer is proof by the spender. The script context lets the validator see the entire transaction. For spending, each script input gets its own validator call.');
}

function slide09_validatorNotContract(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Why "Validator" and Not "Contract"?');

  var body = addBody(s, [
    'Ethereum contracts are active \u2014 they execute logic and change state',
    '',
    'Cardano validators are passive \u2014 they only approve or reject',
    '',
    'A validator is a pure function:',
  ]);
  boldRanges(body.getText(), ['active', 'passive', 'pure function']);

  addCodeBlock(s, '  (datum, redeemer, script_context) \u2192 True | False', {top: 155, left: 40, width: 640, height: 28, fontSize: 13});

  var body2 = addBody(s, [
    'No side effects. No state mutation. No external calls.',
    '',
    'Consequences:',
    '  \u2713  Deterministic \u2014 outcome known before submission',
    '  \u2713  No "out of gas" surprises \u2014 fees calculated upfront',
    '  \u2713  Parallelizable \u2014 independent UTXOs validate in parallel',
    '  \u2713  Auditable \u2014 pure functions are easy to reason about',
    '  \u2717  More work off-chain \u2014 YOU build the transaction, not the script',
  ], {top: 195, size: 14});
  boldRanges(body2.getText(), ['Deterministic', 'No "out of gas"', 'Parallelizable', 'Auditable', 'More work off-chain']);
  colorRanges(body2.getText(), ['\u2713'], COLORS.success);
  colorRanges(body2.getText(), ['\u2717'], COLORS.warning);

  addSlideNumber(s, 9);
  addNotes(s, 'This slide drives home the paradigm shift. The validation logic is on-chain, but the transaction building logic is off-chain (in Java/Python/JS). The on-chain part is intentionally minimal and pure. This design eliminates entire classes of bugs.');
}

function slide10_allValidatorTypes(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Plutus V3 Validator Types (6 Handlers)');

  addLabeledBox(s, 'spend', [
    'Guards UTXOs at script addresses',
    'Runs when consuming a script output',
    'Args: datum, redeemer, output_ref, tx',
  ], 30, 50, 325, 82, COLORS.accent);

  addLabeledBox(s, 'mint', [
    'Controls token creation & destruction',
    'Runs when minting or burning tokens',
    'Args: redeemer, policy_id, tx',
  ], 370, 50, 325, 82, COLORS.success);

  addLabeledBox(s, 'withdraw', [
    'Validates staking reward withdrawals',
    'Runs when withdrawing from reward acct',
    'Args: redeemer, credential, tx',
  ], 30, 145, 325, 82, COLORS.gold);

  addLabeledBox(s, 'publish', [
    'Validates stake certificate operations',
    'Delegation, registration, deregistration',
    'Args: redeemer, index, certificate, tx',
  ], 370, 145, 325, 82, COLORS.ethereum);

  addLabeledBox(s, 'vote', [
    'Governance: DRep/SPO/Committee voting',
    'Validates yes/no/abstain votes on proposals',
    'Args: redeemer, voter, tx',
  ], 30, 240, 325, 82, COLORS.warning);

  addLabeledBox(s, 'propose', [
    'Governance: proposal submission',
    'Validates governance action proposals',
    'Args: redeemer, index, proposal, tx',
  ], 370, 240, 325, 82, COLORS.accentLight);

  var body = addBody(s, [
    'spend and mint are the most common. vote and propose are new in Plutus V3 (Conway era governance).',
    'A single Aiken validator file can define multiple handlers + an else catch-all.',
  ], {top: 335, size: 12});
  boldRanges(body.getText(), ['spend', 'mint', 'vote', 'propose', 'else']);

  addSlideNumber(s, 10);
  addNotes(s, 'Plutus V3 added vote and propose for CIP-1694 on-chain governance. In practice, most dApps use spend and mint. withdraw is used for staking pools. publish is for delegation certificates. All six follow the same pattern: pure function returning True/False.');
}

function slide11_collateral(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Collateral: Protecting the Network');

  var txBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 40, 55, 260, 85);
  txBox.getFill().setSolidFill(COLORS.bgCard);
  txBox.getBorder().setWeight(2);
  txBox.getBorder().getLineFill().setSolidFill(COLORS.accent);
  var txLabel = s.insertTextBox('Your Transaction\nFee: 0.3 ADA\nCollateral: 5 ADA (reserved)', 50, 58, 240, 75);
  txLabel.getText().getTextStyle().setFontFamily('Courier New');
  txLabel.getText().getTextStyle().setFontSize(11);
  txLabel.getText().getTextStyle().setForegroundColor(COLORS.text);

  var successBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 340, 55, 350, 35);
  successBox.getFill().setSolidFill('#f0fdf4');
  successBox.getBorder().setWeight(1);
  successBox.getBorder().getLineFill().setSolidFill(COLORS.success);
  var successTx = s.insertTextBox('\u2713  Script passes \u2192 fee taken, collateral returned', 348, 58, 335, 28);
  successTx.getText().getTextStyle().setFontFamily('Open Sans');
  successTx.getText().getTextStyle().setFontSize(11);
  successTx.getText().getTextStyle().setForegroundColor(COLORS.success);

  var failBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 340, 100, 350, 35);
  failBox.getFill().setSolidFill('#fef2f2');
  failBox.getBorder().setWeight(1);
  failBox.getBorder().getLineFill().setSolidFill(COLORS.warning);
  var failTx = s.insertTextBox('\u2717  Script fails \u2192 collateral taken, TX rejected', 348, 103, 335, 28);
  failTx.getText().getTextStyle().setFontFamily('Open Sans');
  failTx.getText().getTextStyle().setFontSize(11);
  failTx.getText().getTextStyle().setForegroundColor(COLORS.warning);

  var body = addBody(s, [
    'Why collateral exists:',
    '  Nodes spend CPU and memory evaluating validator scripts',
    '  If a script fails, the node did work for nothing',
    '  Collateral compensates the network for wasted computation',
    '',
    'Collateral is NOT the transaction fee \u2014 it is separate ADA set aside',
    '',
    'In practice: tools like Blockfrost evaluate scripts off-chain first.',
    'Failures are caught before submission. Collateral is rarely taken.',
    '',
    'Each validator has an execution budget (CPU steps + memory units).',
    'Exceeding the budget = script failure = collateral taken.',
  ], {top: 150, size: 14});
  boldRanges(body.getText(), ['NOT the transaction fee', 'rarely taken', 'execution budget']);

  addSlideNumber(s, 11);
  addNotes(s, 'Collateral is an anti-spam mechanism. Reassure the audience: in practice, you simulate the transaction first, and only submit if it passes. Collateral is almost never taken. The execution budget is determined during off-chain evaluation.');
}

function slide12_aikenIntro(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Aiken: A Language Built for Cardano');

  var body = addBody(s, [
    'Purpose-built for writing Cardano validators',
    '',
    'Compiles to Plutus V3 Core (UPLC \u2014 Untyped Plutus Lambda Calculus)',
    '',
    'Rust/Python-inspired syntax \u2014 clean and readable',
    '',
    'Strong static typing catches bugs at compile time',
    '',
    'Built-in tooling:',
  ]);
  boldRanges(body.getText(), ['Purpose-built', 'Plutus V3 Core', 'Strong static typing']);

  addCodeBlock(s, [
    '  $ aiken build     # Compile validators \u2192 plutus.json blueprint',
    '  $ aiken check     # Run unit tests (with trace output)',
    '  $ aiken fmt       # Auto-format code',
    '  $ aiken docs      # Generate documentation',
  ].join('\n'), {top: 235, left: 40, width: 640, height: 75, fontSize: 12});

  var body2 = addBody(s, [
    'The plutus.json blueprint is the portable output \u2014 load it from any',
    'off-chain language (Java, JavaScript, Python, Rust) to interact with validators.',
  ], {top: 325, size: 13});
  boldRanges(body2.getText(), ['plutus.json blueprint']);

  addSlideNumber(s, 12);
  addNotes(s, 'Aiken replaced Haskell-Plutus as the go-to way to write Cardano smart contracts. The key output is plutus.json \u2014 this is what your Java code loads. Think of it like a compiled binary + ABI (similar to Ethereum contract ABI).');
}

function slide13_validatorAnatomy(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Anatomy of an Aiken Validator');

  addCodeBlock(s, [
    'validator hello_world {',
    '  spend(datum, redeemer, _own_ref, self: Transaction) {',
    '    // datum:    Option<Datum> - state at the locked UTXO',
    '    // redeemer: Redeemer - proof from the spender',
    '    // own_ref:  OutputReference - which UTXO is spent',
    '    // self:     Transaction - the full transaction',
    '    expect Some(d) = datum',
    '    redeemer.msg == d.msg && signed_by(self, d.owner)',
    '  }',
    '',
    '  mint(redeemer, policy_id, self: Transaction) {',
    '    // Controls token creation/destruction',
    '  }',
    '',
    '  else(_ctx: ScriptContext) { False }  // catch-all',
    '}',
  ].join('\n'), {top: 48, left: 40, width: 640, height: 235, fontSize: 12});

  var body = addBody(s, [
    'spend   Guards UTXOs \u2014 runs when consuming a script output',
    'mint    Guards tokens \u2014 runs when minting or burning',
    'else    Catch-all \u2014 rejects any other purpose (withdraw, vote, etc.)',
    '',
    'A multi-handler validator shares one script hash across all handlers.',
    'Same policy ID for mint and same script address for spend.',
  ], {top: 295, size: 13});
  boldRanges(body.getText(), ['spend', 'mint', 'else', 'multi-handler validator']);
  colorRanges(body.getText(), ['spend'], COLORS.accent);
  colorRanges(body.getText(), ['mint'], COLORS.success);
  colorRanges(body.getText(), ['else'], COLORS.warning);

  addSlideNumber(s, 13);
  addNotes(s, 'Walk through each handler. In Plutus V3, arguments are passed directly \u2014 no wrapping in ScriptContext. A multi-handler validator is powerful: the CIP-68 example uses one validator with both mint and spend handlers sharing the same script hash.');
}

function slide14_helloWorldCode(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Demo: Hello World Validator');

  addCodeBlock(s, [
    'type Datum { owner: VerificationKeyHash, msg: ByteArray }',
    'type Redeemer { msg: ByteArray }',
    '',
    'validator hello_world {',
    '  spend(datum, redeemer, _own_ref, self) {',
    '    expect Some(Datum { owner, msg }) = datum',
    '',
    '    // Check 1: redeemer message must match datum message',
    '    let must_say_message = redeemer.msg == msg',
    '',
    '    // Check 2: transaction must be signed by the owner',
    '    let must_be_signed =',
    '      list.has(self.extra_signatories, owner)',
    '',
    '    must_say_message && must_be_signed',
    '  }',
    '}',
  ].join('\n'), {top: 48, left: 40, width: 640, height: 240, fontSize: 12});

  var body = addBody(s, [
    'Two checks \u2014 both must pass:',
    '  1. Redeemer message must match the datum message',
    '  2. Transaction must be signed by the datum\'s owner',
    '',
    'If either check fails \u2192 validator rejects \u2192 UTXO stays locked \u2192 ADA is safe',
  ], {top: 300, size: 13});
  boldRanges(body.getText(), ['both must pass']);

  addSlideNumber(s, 14);
  addNotes(s, 'Live code walkthrough. This is the simplest possible validator demonstrating all three eUTXO concepts: datum (owner + message), redeemer (message proof), and script context (checking extra_signatories for authorization).');
}

function slide15_lockUnlockFlow(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Lock & Unlock: The Full Flow');

  // Lock flow
  var lockLabel = s.insertTextBox('LOCK (send ADA to script)', 40, 50, 300, 20);
  lockLabel.getText().getTextStyle().setFontFamily('Montserrat');
  lockLabel.getText().getTextStyle().setFontSize(12);
  lockLabel.getText().getTextStyle().setBold(true);
  lockLabel.getText().getTextStyle().setForegroundColor(COLORS.accent);

  var lockSteps = ['Your\nWallet', 'Build TX\n+ datum', 'Script\nAddress', 'UTXO\nlocked'];
  for (var i = 0; i < lockSteps.length; i++) {
    addStepBox(s, lockSteps[i], 40 + i * 160, 72, 130, 42, i < 2 ? '#dbeafe' : '#f0fdf4', COLORS.accent);
    if (i < lockSteps.length - 1) addArrow(s, 170 + i * 160, 78);
  }

  // Unlock flow
  var unlockLabel = s.insertTextBox('UNLOCK (spend from script)', 40, 128, 300, 20);
  unlockLabel.getText().getTextStyle().setFontFamily('Montserrat');
  unlockLabel.getText().getTextStyle().setFontSize(12);
  unlockLabel.getText().getTextStyle().setBold(true);
  unlockLabel.getText().getTextStyle().setForegroundColor(COLORS.success);

  var unlockSteps = ['Find\nUTXO', 'Provide\nredeemer', 'Validator\nchecks', 'ADA\nreturned'];
  for (var j = 0; j < unlockSteps.length; j++) {
    addStepBox(s, unlockSteps[j], 40 + j * 160, 150, 130, 42, j === 2 ? '#fef3c7' : '#f0fdf4', COLORS.success);
    if (j < unlockSteps.length - 1) addArrow(s, 170 + j * 160, 156);
  }

  var body = addBody(s, [
    'Key insight: the validator does NOT run during locking!',
    'Anyone can send ADA to a script address \u2014 it\'s just a payment.',
    'The validator only executes when someone tries to SPEND the UTXO.',
    '',
    'Locking = Tx.payToContract(scriptAddress, amount, datum)',
    'Unlocking = ScriptTx.collectFrom(utxo, redeemer)',
    '             + attachSpendingValidator(script)',
    '             + withRequiredSigners(ownerPkh)',
  ], {top: 205, size: 13});
  boldRanges(body.getText(), ['NOT run during locking', 'only executes when someone tries to SPEND']);

  addSlideNumber(s, 15);
  addNotes(s, 'Emphasize: locking is a normal payment, no script execution. The validator is a lock on the output, not a filter on the input. Show the Java API calls: payToContract for locking, collectFrom + attachSpendingValidator for unlocking.');
}

function slide16_aikenTraceLogs(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Debugging Aiken: Trace Logs');

  var body = addBody(s, [
    'Aiken provides trace for printing debug output during testing:',
  ]);

  addCodeBlock(s, [
    'validator hello_world {',
    '  spend(datum, redeemer, _own_ref, self) {',
    '    expect Some(Datum { owner, msg }) = datum',
    '',
    '    let must_say_message = redeemer.msg == msg',
    '    trace @"must_say_message: " ++ cbor.diagnostic(must_say_message)',
    '',
    '    let must_be_signed = list.has(self.extra_signatories, owner)',
    '    trace @"must_be_signed: " ++ cbor.diagnostic(must_be_signed)',
    '',
    '    must_say_message && must_be_signed',
    '  }',
    '}',
  ].join('\n'), {top: 80, left: 40, width: 640, height: 185, fontSize: 12});

  var body2 = addBody(s, [
    'trace @"message"         Print a string during test execution',
    'cbor.diagnostic(value)   Convert any value to readable string',
    'expect Some(x) = ...     Crashes with trace if pattern fails',
    'fail @"reason"           Reject with a custom error message',
    '',
    'Run tests with:  aiken check',
    'Traces appear in test output \u2014 only during testing, never on-chain.',
    'On-chain, traces are stripped for efficiency.',
  ], {top: 275, size: 13});
  boldRanges(body2.getText(), ['trace', 'cbor.diagnostic', 'expect', 'fail', 'aiken check', 'stripped for efficiency']);
  colorRanges(body2.getText(), ['trace @"message"', 'cbor.diagnostic(value)', 'expect Some(x) = ...', 'fail @"reason"'], COLORS.accent);

  addSlideNumber(s, 16);
  addNotes(s, 'Traces are essential for debugging Aiken validators. They only run during aiken check (unit tests), never on-chain. cbor.diagnostic is your best friend \u2014 it converts any Aiken value to a human-readable string. When a script fails on-chain with no details, reproduce it in a test with traces to find the exact failing condition.');
}

function slide17_whatIsCip68(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'CIP-68: On-Chain Token Metadata');

  var body = addBody(s, [
    'The problem with CIP-25 (old standard):',
    '  Metadata stored in transaction metadata \u2014 immutable after mint',
    '  Cannot update token name, image, or properties',
    '  Metadata not accessible to on-chain validators',
    '',
    'CIP-68 solution:',
    '  Store metadata as a datum on a UTXO at a script address',
    '  Metadata is readable by other validators (composability)',
    '  Metadata is updatable by spending and re-creating the UTXO',
    '',
    'Two tokens minted together:',
    '  Reference NFT (label 100) \u2014 carries metadata, locked at script',
    '  User NFT (label 222) \u2014 the token users hold in wallets',
    '',
    'Wallets read the reference NFT to display metadata for the user NFT.',
    'This is the standard used by all major Cardano NFT platforms.',
  ], {size: 14});
  boldRanges(body.getText(), ['immutable after mint', 'updatable', 'Reference NFT (label 100)', 'User NFT (label 222)']);
  colorRanges(body.getText(), ['Reference NFT (label 100)'], COLORS.accent);
  colorRanges(body.getText(), ['User NFT (label 222)'], COLORS.success);

  addSlideNumber(s, 17);
  addNotes(s, 'CIP-68 is a major step forward. The dual-token architecture is clever \u2014 the reference NFT holds the data and is locked at the script, the user NFT circulates freely. Metadata updates only touch the reference NFT, never the user NFT.');
}

function slide18_cip68Structure(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'CIP-68 Token Architecture');

  // Reference NFT box
  var refBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 30, 50, 320, 155);
  refBox.getFill().setSolidFill('#eef2ff');
  refBox.getBorder().setWeight(2);
  refBox.getBorder().getLineFill().setSolidFill(COLORS.accent);

  var refTitle = s.insertTextBox('Reference NFT (Label 100)', 40, 53, 300, 22);
  refTitle.getText().getTextStyle().setFontFamily('Montserrat');
  refTitle.getText().getTextStyle().setFontSize(12);
  refTitle.getText().getTextStyle().setBold(true);
  refTitle.getText().getTextStyle().setForegroundColor(COLORS.accent);

  var refBody = s.insertTextBox(
    'CIP-67 prefix: 000643b0\n' +
    'Lives at: script address (locked)\n' +
    'Carries: inline datum\n\n' +
    'Datum = Constr(0, [\n' +
    '  { "name":"MyNFT","image":"..." },\n' +
    '  1,            // version\n' +
    '  Constr(0, []) // extra data\n' +
    '])',
    38, 77, 305, 120);
  refBody.getText().getTextStyle().setFontFamily('Courier New');
  refBody.getText().getTextStyle().setFontSize(10);
  refBody.getText().getTextStyle().setForegroundColor(COLORS.text);

  // User NFT box
  var usrBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 370, 50, 320, 155);
  usrBox.getFill().setSolidFill('#f0fdf4');
  usrBox.getBorder().setWeight(2);
  usrBox.getBorder().getLineFill().setSolidFill(COLORS.success);

  var usrTitle = s.insertTextBox('User NFT (Label 222)', 380, 53, 300, 22);
  usrTitle.getText().getTextStyle().setFontFamily('Montserrat');
  usrTitle.getText().getTextStyle().setFontSize(12);
  usrTitle.getText().getTextStyle().setBold(true);
  usrTitle.getText().getTextStyle().setForegroundColor(COLORS.success);

  var usrBody = s.insertTextBox(
    'CIP-67 prefix: 000de140\n' +
    'Lives at: user\'s wallet\n' +
    'Carries: nothing (just the token)\n\n' +
    'Same policy ID, same base name\n' +
    'Wallet looks up the reference\n' +
    'NFT to display name, image, etc.\n\n' +
    'Freely tradeable!',
    378, 77, 305, 120);
  usrBody.getText().getTextStyle().setFontFamily('Courier New');
  usrBody.getText().getTextStyle().setFontSize(10);
  usrBody.getText().getTextStyle().setForegroundColor(COLORS.text);

  var body = addBody(s, [
    'Both tokens share the same policy ID and base name.',
    'Only the 4-byte CIP-67 label prefix differs (000643b0 vs 000de140).',
    '',
    'The minting validator enforces they are always created as a pair.',
    'This is a multi-handler validator: mint handler controls creation,',
    'spend handler guards the reference NFT for metadata updates.',
  ], {top: 220, size: 13});
  boldRanges(body.getText(), ['always created as a pair', 'multi-handler validator']);

  addSlideNumber(s, 18);
  addNotes(s, 'Draw the connection: the reference NFT is locked at the script address (like locking ADA in the hello world example). The user NFT goes to the minter\'s wallet. The CIP-68 validator uses both a mint handler (for creating/burning tokens) and a spend handler (for updating metadata).');
}

function slide19_cip68Lifecycle(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'CIP-68 Lifecycle: Mint, Update, Burn');

  addLabeledBox(s, 'MINT (mint handler)', [
    'Both label-100 and label-222 created',
    'Ref NFT \u2192 script addr with datum',
    'User NFT \u2192 minter\'s wallet',
    'Owner must sign',
  ], 30, 50, 210, 110, COLORS.success);

  addLabeledBox(s, 'UPDATE (spend handler)', [
    'Old ref NFT consumed from script',
    'New ref NFT paid back w/ new datum',
    'User NFT NOT touched at all',
    'Owner must sign',
  ], 255, 50, 210, 110, COLORS.accent);

  addLabeledBox(s, 'BURN (both handlers)', [
    'Spend: unlock ref NFT (RemoveMeta)',
    'Mint: burn both tokens (neg. qty)',
    'ADA in ref UTXO returned to owner',
    'Owner must sign',
  ], 480, 50, 210, 110, COLORS.warning);

  var body = addBody(s, [
    'Key design insight:',
    '  Minting uses only the mint handler',
    '  Updating uses only the spend handler (no new tokens created)',
    '  Burning uses BOTH handlers (spend to unlock + mint to destroy)',
    '',
    'The user NFT in your wallet is never affected by metadata updates.',
    'This is the core benefit of the dual-token architecture.',
    '',
    'Why the spend handler matters:',
    '  It ensures only the owner can change metadata',
    '  It enforces that updated datum still matches CIP-68 format',
    '  It prevents removing the ref NFT without burning it',
  ], {top: 175, size: 13});
  boldRanges(body.getText(), ['only the mint handler', 'only the spend handler', 'BOTH handlers', 'never affected']);

  addSlideNumber(s, 19);
  addNotes(s, 'Minting: straightforward. Updating: the key CIP-68 feature \u2014 only touches the reference NFT. Burning: most complex, needs both handlers \u2014 spend handler unlocks the ref NFT from the script address, mint handler authorizes the negative mint.');
}

function slide20_securityPatterns(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Smart Contract Security Patterns');

  addLabeledBox(s, 'Authorization', [
    'Check extra_signatories for owner',
    'Parameterize scripts with owner pkh',
    'Never trust the redeemer alone',
  ], 30, 50, 320, 85, COLORS.accent);

  addLabeledBox(s, 'Datum Validation', [
    'Always expect Some(datum)',
    'Validate datum shape matches type',
    'Missing datum = script crash',
  ], 370, 50, 320, 85, COLORS.success);

  addLabeledBox(s, 'Token Pair Integrity', [
    'Enforce label-100 + label-222 together',
    'Verify exact quantities (+1 each)',
    'Check output goes to correct address',
  ], 30, 150, 320, 85, COLORS.gold);

  addLabeledBox(s, 'Attacks Eliminated by Design', [
    'No re-entrancy (no cross-script calls)',
    'No front-running (deterministic results)',
    'No partial failure (atomic transactions)',
  ], 370, 150, 320, 85, COLORS.warning);

  var body = addBody(s, [
    'Cardano\'s eUTXO model eliminates entire classes of vulnerabilities',
    'that plague Ethereum contracts. The DAO hack (re-entrancy), MEV',
    'front-running, and partial execution failures are structurally impossible.',
    '',
    'Best practice: use aiken check with comprehensive test cases before',
    'deploying. Add trace logs to understand exactly why a validator fails.',
  ], {top: 250, size: 13});
  boldRanges(body.getText(), ['structurally impossible', 'aiken check']);

  addSlideNumber(s, 20);
  addNotes(s, 'Highlight that Cardano\'s design eliminates entire classes of vulnerabilities. Re-entrancy (the DAO hack) is impossible because validators can\'t call other validators. Front-running is much harder because outcomes are deterministic. Partial failures don\'t exist because execution is all-or-nothing.');
}

function slide21_toolingEcosystem(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Developer Tooling');

  addLabeledBox(s, 'On-Chain (Aiken)', [
    'aiken build \u2014 compile to UPLC',
    'aiken check \u2014 run tests + traces',
    'Produces plutus.json blueprint',
  ], 30, 50, 310, 85, COLORS.accent);

  addLabeledBox(s, 'Off-Chain (Java)', [
    'cardano-client-lib 0.7.x',
    'ScriptTx + QuickTxBuilder',
    'aiken-java-binding for params',
  ], 370, 50, 320, 85, COLORS.success);

  addLabeledBox(s, 'Infrastructure', [
    'Blockfrost \u2014 hosted blockchain API',
    'Yaci DevKit \u2014 local testnet',
    'Preprod testnet \u2014 public testing',
  ], 30, 150, 310, 85, COLORS.gold);

  addLabeledBox(s, 'Debugging & Exploring', [
    'cardanoscan.io \u2014 block explorer',
    'Aiken trace logs in unit tests',
    'Blockfrost script evaluation API',
  ], 370, 150, 320, 85, COLORS.ethereum);

  var body = addBody(s, [
    'Development workflow:',
  ], {top: 250, size: 14});
  boldRanges(body.getText(), ['Development workflow:']);

  addCodeBlock(s, '  Write Aiken \u2192 aiken build \u2192 Load plutus.json in Java \u2192 Build TX \u2192 Submit via Blockfrost', {top: 275, left: 40, width: 640, height: 25, fontSize: 11});

  var body2 = addBody(s, [
    'No need to run your own Cardano node. Blockfrost handles chain access.',
    'Yaci DevKit gives you a local testnet for fast iteration.',
  ], {top: 310, size: 13});

  addSlideNumber(s, 21);
  addNotes(s, 'Show the practical workflow: 1) Write validator in Aiken, 2) Compile with aiken build, 3) Load plutus.json in Java, 4) Build TX with cardano-client-lib, 5) Submit via Blockfrost.');
}

function slide22_summary(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Key Takeaways');

  var body = addBody(s, [
    'Ethereum contracts DO things \u2014 Cardano validators CHECK things',
    '',
    'Validators are pure functions: (datum, redeemer, context) \u2192 True/False',
    '',
    'Plutus V3 has 6 handler types: spend, mint, withdraw, publish, vote, propose',
    '',
    'eUTXO = Bitcoin\'s UTXO + datum + redeemer + script context',
    '',
    'Transaction building happens off-chain (in Java, JS, Python)',
    'Validation happens on-chain (in Aiken, compiled to Plutus V3 UPLC)',
    '',
    'CIP-68: dual-token architecture for updatable on-chain metadata',
    '  Reference NFT (label 100) holds metadata at script address',
    '  User NFT (label 222) circulates freely in wallets',
    '',
    'Debug with trace logs in aiken check \u2014 traces are stripped on-chain',
    '',
    'Cardano eliminates re-entrancy, front-running, and partial failures by design',
  ], {size: 14});
  boldRanges(body.getText(), [
    'DO things', 'CHECK things', 'pure functions',
    '6 handler types', 'off-chain', 'on-chain',
    'trace logs', 'by design',
  ]);

  addSlideNumber(s, 22);
  addNotes(s, 'Recap the core mental model: Ethereum = active contracts. Cardano = passive validators. This distinction drives everything else \u2014 determinism, parallelism, security. Encourage participants to build on preprod testnet with the hello world and CIP-68 examples.');
}
