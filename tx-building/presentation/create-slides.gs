/**
 * Cardano Transaction Building - Google Slides Generator
 * CAP 2026
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. Click "New project"
 * 3. Delete the default code and paste this entire file
 * 4. Click the "Run" button (or select createPresentation from the dropdown and run)
 * 5. On first run, it will ask for permissions — click "Review Permissions" and allow
 * 6. Check the Execution Log for the link to your new presentation
 */

// ─── Theme Colors ───────────────────────────────────────────────────────────

const COLORS = {
  bgDark:      '#ffffff',
  bgCard:      '#f0f4f8',
  accent:      '#0033ad',
  accentLight: '#0052cc',
  text:        '#1a1a2e',
  textDim:     '#6b7280',
  codeBg:      '#f0f4f8',
  warning:     '#dc2626',
  success:     '#059669',
  gold:        '#b45309',
};

// ─── Main Entry Point ───────────────────────────────────────────────────────

function createPresentation() {
  const deck = SlidesApp.create('Building Cardano Transactions — CAP 2026');

  // Remove the default blank slide
  deck.getSlides()[0].remove();

  slide01_title(deck);
  slide02_whatIsATx(deck);
  slide03_utxoVsAccount(deck);
  slide04_eutxo(deck);
  slide05_anatomy(deck);
  slide06_balancingEquation(deck);
  slide07_lifecycle(deck);
  slide08_coinSelection(deck);
  slide09_fees(deck);
  slide10_addressesKeys(deck);
  slide11_nativeTokens(deck);
  slide12_valueType(deck);
  slide13_minUtxo(deck);
  slide14_mintingPolicies(deck);
  slide15_policyIdAssetName(deck);
  slide16_pitfalls(deck);
  slide17_tooling(deck);

  Logger.log('Presentation created: ' + deck.getUrl());
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function setBackground(slide) {
  slide.getBackground().setSolidFill(COLORS.bgDark);
}

function addTitle(slide, text, opts) {
  opts = opts || {};
  const top  = opts.top  || 20;
  const left = opts.left || 40;
  const w    = opts.width  || 640;
  const h    = opts.height || 50;
  const size = opts.size || 36;
  const box  = slide.insertTextBox(text, left, top, w, h);
  const style = box.getText().getTextStyle();
  style.setFontFamily('Montserrat');
  style.setFontSize(size);
  style.setBold(true);
  style.setForegroundColor(COLORS.text);
  return box;
}

function addBody(slide, lines, opts) {
  opts = opts || {};
  const top  = opts.top  || 90;
  const left = opts.left || 50;
  const w    = opts.width  || 620;
  const h    = opts.height || 300;
  const size = opts.size || 16;
  const text = lines.join('\n');
  const box  = slide.insertTextBox(text, left, top, w, h);
  const style = box.getText().getTextStyle();
  style.setFontFamily('Open Sans');
  style.setFontSize(size);
  style.setForegroundColor(COLORS.text);
  return box;
}

function addCodeBlock(slide, code, opts) {
  opts = opts || {};
  const top  = opts.top  || 160;
  const left = opts.left || 60;
  const w    = opts.width  || 600;
  const h    = opts.height || 120;
  const shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, w, h);
  shape.getFill().setSolidFill(COLORS.codeBg);
  hideBorder(shape);
  const tf = shape.getText();
  tf.setText(code);
  const style = tf.getTextStyle();
  style.setFontFamily('Source Code Pro');
  style.setFontSize(14);
  style.setForegroundColor(COLORS.accent);
  tf.getParagraphStyle().setSpaceAbove(6);
  return shape;
}

function addNotes(slide, text) {
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(text);
}

function addSlideNumber(slide, num) {
  const box = slide.insertTextBox(String(num), 670, 380, 30, 20);
  const style = box.getText().getTextStyle();
  style.setFontFamily('Open Sans');
  style.setFontSize(10);
  style.setForegroundColor(COLORS.textDim);
}

function hideBorder(shape) {
  shape.getBorder().getLineFill().setSolidFill(COLORS.bgDark);
  shape.getBorder().setWeight(1);
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

// ─── Slide Builders ─────────────────────────────────────────────────────────

function slide01_title(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);

  // Main title
  var title = s.insertTextBox('Building Cardano\nTransactions', 40, 100, 640, 120);
  var ts = title.getText().getTextStyle();
  ts.setFontFamily('Montserrat');
  ts.setFontSize(44);
  ts.setBold(true);
  ts.setForegroundColor(COLORS.text);

  // Subtitle
  var sub = s.insertTextBox('From EUTXO Theory to Working Java Code', 40, 235, 640, 40);
  var ss = sub.getText().getTextStyle();
  ss.setFontFamily('Open Sans');
  ss.setFontSize(20);
  ss.setForegroundColor(COLORS.accentLight);

  // Footer
  var foot = s.insertTextBox('Cardano Ambassador Program 2026', 40, 360, 640, 25);
  var fs = foot.getText().getTextStyle();
  fs.setFontFamily('Open Sans');
  fs.setFontSize(12);
  fs.setForegroundColor(COLORS.textDim);

  // Accent line
  var line = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 40, 220, 200, 4);
  line.getFill().setSolidFill(COLORS.accent);
  hideBorder(line);

  addNotes(s, 'Welcome the audience. This session covers both the conceptual foundations AND practical implementation of Cardano transactions. By the end, participants will understand what happens under the hood when they send ADA, and will have built and submitted their own transactions on preprod testnet using Java.');
}

function slide02_whatIsATx(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'What is a Transaction?');
  var body = addBody(s, [
    '   A request to change the ledger state',
    '',
    '   Consumed by a validator (the Cardano node)',
    '',
    '   Either fully applied or fully rejected — no partial execution',
    '',
    '   Contains: inputs to consume, outputs to create, a fee to pay',
    '',
    '   Analogy: a signed check that says',
    '   "take these coins, create those coins, keep this fee"',
  ]);
  boldRanges(body.getText(), ['request to change the ledger state', 'no partial execution']);
  addSlideNumber(s, 2);
  addNotes(s, 'Emphasize that Cardano transactions are atomic — they either succeed completely or fail completely. There is no "out of gas" scenario where you pay a fee but the operation partially fails (unlike Ethereum). This is a fundamental design property of Cardano.');
}

function slide03_utxoVsAccount(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Two Ways to Track Money');

  // Left column header
  var lh = s.insertTextBox('Account Model (Ethereum)', 30, 85, 330, 30);
  var lhs = lh.getText().getTextStyle();
  lhs.setFontFamily('Montserrat'); lhs.setFontSize(16); lhs.setBold(true); lhs.setForegroundColor(COLORS.accentLight);

  var left = addBody(s, [
    'Like a bank account with a balance',
    'Send 10 ETH: subtract from sender,\n  add to receiver',
    'Global mutable state',
    'Simple to understand',
    'Concurrency challenges (nonce ordering)',
  ], {top: 120, left: 30, width: 320, height: 250, size: 14});

  // Right column header
  var rh = s.insertTextBox('UTXO Model (Cardano, Bitcoin)', 380, 85, 330, 30);
  var rhs = rh.getText().getTextStyle();
  rhs.setFontFamily('Montserrat'); rhs.setFontSize(16); rhs.setBold(true); rhs.setForegroundColor(COLORS.success);

  var right = addBody(s, [
    'Like physical coins/bills in a wallet',
    'Each "coin" (UTXO) is indivisible',
    'Spend a coin → destroy it → create new coins',
    'No global state — everything is local',
    'Naturally parallel (independent UTXOs)',
  ], {top: 120, left: 380, width: 320, height: 250, size: 14});

  // Divider
  var div = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 358, 90, 2, 280);
  div.getFill().setSolidFill(COLORS.accent);
  hideBorder(div);

  addSlideNumber(s, 3);
  addNotes(s, 'The account model is like your bank: you have one balance that goes up and down. The UTXO model is like your physical wallet: you have specific bills and coins. When you pay for a 7 EUR coffee with a 10 EUR bill, you don\'t tear the bill — you give it to the cashier and get 3 EUR back. That\'s exactly how UTXOs work.');
}

function slide04_eutxo(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Extended UTXO — What Cardano Adds');
  var body = addBody(s, [
    'Bitcoin\'s UTXO: value + locking script',
    '',
    'Cardano\'s EUTXO adds three things:',
    '',
    '  1. Datum — arbitrary data attached to a UTXO (the "state")',
    '  2. Redeemer — argument provided when spending (the "action")',
    '  3. Script Context — full transaction info available to validators',
    '',
    'Turns UTXOs from simple "coins" into programmable state carriers',
    '',
    'For simple transfers: datums and redeemers are not needed',
    'Essential for smart contract interactions (future session)',
  ]);
  boldRanges(body.getText(), ['Datum', 'Redeemer', 'Script Context']);
  colorRanges(body.getText(), ['1. Datum', '2. Redeemer', '3. Script Context'], COLORS.accentLight);
  addSlideNumber(s, 4);
  addNotes(s, 'EUTXO is what makes Cardano a smart contract platform, not just a payment network. But for this tutorial, we focus on the basic UTXO properties (value + address). The extended features come into play with Plutus scripts, which we\'ll cover in a future session.');
}

function slide05_anatomy(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Inside a Cardano Transaction');

  // Required box
  var reqBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 30, 85, 325, 280);
  reqBox.getFill().setSolidFill(COLORS.bgCard);
  reqBox.getBorder().setWeight(1);
  reqBox.getBorder().getLineFill().setSolidFill(COLORS.accent);

  var reqTitle = s.insertTextBox('Required', 40, 90, 300, 25);
  reqTitle.getText().getTextStyle().setFontFamily('Montserrat');
  reqTitle.getText().getTextStyle().setFontSize(16);
  reqTitle.getText().getTextStyle().setBold(true);
  reqTitle.getText().getTextStyle().setForegroundColor(COLORS.success);

  addBody(s, [
    'Inputs',
    '  References to UTXOs being spent',
    '  (TxHash#Index)',
    '',
    'Outputs',
    '  New UTXOs being created',
    '  (address + value)',
    '',
    'Fee',
    '  Paid to block producers (lovelace)',
    '',
    'Validity Interval',
    '  Time window for tx validity',
  ], {top: 118, left: 45, width: 300, height: 240, size: 13});

  // Optional box
  var optBox = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 375, 85, 325, 280);
  optBox.getFill().setSolidFill(COLORS.bgCard);
  optBox.getBorder().setWeight(1);
  optBox.getBorder().setDashStyle(SlidesApp.DashStyle.DASH);
  optBox.getBorder().getLineFill().setSolidFill(COLORS.textDim);

  var optTitle = s.insertTextBox('Optional', 385, 90, 300, 25);
  optTitle.getText().getTextStyle().setFontFamily('Montserrat');
  optTitle.getText().getTextStyle().setFontSize(16);
  optTitle.getText().getTextStyle().setBold(true);
  optTitle.getText().getTextStyle().setForegroundColor(COLORS.textDim);

  addBody(s, [
    'Metadata — arbitrary data',
    '',
    'Mint / Burn — native tokens',
    '',
    'Certificates — staking, delegation,',
    '  governance',
    '',
    'Collateral — for Plutus execution',
    '',
    'Witnesses — signatures & scripts',
  ], {top: 118, left: 390, width: 300, height: 240, size: 13});

  addSlideNumber(s, 5);
  addNotes(s, 'Walk through each component. Inputs are pointers to existing UTXOs (transaction hash + output index). Outputs are brand new UTXOs that will exist after this transaction. The fee is explicit — you declare exactly how much you\'re paying. The validity interval prevents a transaction from being applied too late. Many optional components are for advanced use cases.');
}

function slide06_balancingEquation(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'The Golden Rule');

  // The equation
  addCodeBlock(s, '  sum(inputs)  =  sum(outputs) + fee', {top: 85, left: 80, width: 560, height: 40});

  var body = addBody(s, [
    'Example:',
    '  You have:  1 UTXO worth 100 ADA',
    '  Send:      30 ADA to a friend',
    '  Fee:       ~0.17 ADA',
    '',
    '  Input:       100    ADA',
    '  Output 1:     30    ADA  →  friend',
    '  Output 2:     69.83 ADA  →  you (change)',
    '  Fee:           0.17 ADA',
    '  Check:  100 = 30 + 69.83 + 0.17  ✓',
    '',
    'If this equation doesn\'t balance → transaction REJECTED',
  ], {top: 140});
  boldRanges(body.getText(), ['100 = 30 + 69.83 + 0.17  ✓', 'REJECTED']);
  colorRanges(body.getText(), ['REJECTED'], COLORS.warning);
  colorRanges(body.getText(), ['✓'], COLORS.success);
  addSlideNumber(s, 6);
  addNotes(s, 'This is THE most important concept in Cardano transaction building. Everything else — coin selection, fee calculation, change creation — exists to make this equation balance. Note that "change" is not automatic — you must explicitly create a change output.');
}

function slide07_lifecycle(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'From Code to Chain');

  // Off-chain label
  var offLabel = s.insertTextBox('OFF-CHAIN', 30, 85, 200, 20);
  offLabel.getText().getTextStyle().setFontFamily('Montserrat');
  offLabel.getText().getTextStyle().setFontSize(11);
  offLabel.getText().getTextStyle().setBold(true);
  offLabel.getText().getTextStyle().setForegroundColor(COLORS.accentLight);

  // Steps as boxes
  var steps = [
    {label: '1. Build',    desc: 'Construct tx body', color: COLORS.accent},
    {label: '2. Sign',     desc: 'Apply signature(s)', color: COLORS.accent},
    {label: '3. Submit',   desc: 'Send to node', color: COLORS.accent},
  ];

  var x = 30;
  steps.forEach(function(step) {
    var box = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, 108, 145, 60);
    box.getFill().setSolidFill(step.color);
    hideBorder(box);
    var tf = box.getText();
    tf.setText(step.label + '\n' + step.desc);
    tf.getTextStyle().setFontFamily('Open Sans');
    tf.getTextStyle().setFontSize(12);
    tf.getTextStyle().setForegroundColor(COLORS.text);
    tf.getParagraphs()[0].getRange().getTextStyle().setBold(true);
    x += 160;
  });

  // Divider line
  var divLine = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 30, 185, 660, 2);
  divLine.getFill().setSolidFill(COLORS.gold);
  hideBorder(divLine);

  // On-chain label
  var onLabel = s.insertTextBox('ON-CHAIN', 30, 195, 200, 20);
  onLabel.getText().getTextStyle().setFontFamily('Montserrat');
  onLabel.getText().getTextStyle().setFontSize(11);
  onLabel.getText().getTextStyle().setBold(true);
  onLabel.getText().getTextStyle().setForegroundColor(COLORS.gold);

  var onSteps = [
    {label: '4. Phase 1',      desc: 'Structure, sigs,\nbalancing', color: COLORS.bgCard},
    {label: '5. Phase 2',      desc: 'Script execution\n(Plutus only)', color: COLORS.bgCard},
    {label: '6. Inclusion',    desc: 'Added to block\nby SPO', color: COLORS.bgCard},
    {label: '7. Confirmation', desc: 'Block accepted\nby network', color: COLORS.bgCard},
  ];

  x = 30;
  onSteps.forEach(function(step) {
    var box = s.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, 220, 155, 65);
    box.getFill().setSolidFill(step.color);
    box.getBorder().setWeight(1);
    box.getBorder().getLineFill().setSolidFill(COLORS.gold);
    var tf = box.getText();
    tf.setText(step.label + '\n' + step.desc);
    tf.getTextStyle().setFontFamily('Open Sans');
    tf.getTextStyle().setFontSize(11);
    tf.getTextStyle().setForegroundColor(COLORS.text);
    tf.getParagraphs()[0].getRange().getTextStyle().setBold(true);
    x += 168;
  });

  addBody(s, [
    'Phase 1 fails → no fee charged (free rejection)',
    'Phase 2 fails → collateral consumed (spam prevention)',
    'Simple transfers → only Phase 1 applies',
  ], {top: 310, left: 30, width: 660, size: 13});

  addSlideNumber(s, 7);
  addNotes(s, 'Emphasize the two-phase validation model. Phase 1 checks are "free" — they validate structure, signatures, and the balancing equation. If Phase 1 fails, no fee is charged. Phase 2 runs Plutus scripts — if Phase 2 fails, the collateral is consumed. For simple transfers (no scripts), only Phase 1 applies.');
}

function slide08_coinSelection(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Coin Selection — Picking the Right UTXOs');

  // Left column
  var lh = s.insertTextBox('Your wallet:', 30, 85, 330, 25);
  lh.getText().getTextStyle().setFontFamily('Montserrat');
  lh.getText().getTextStyle().setFontSize(14);
  lh.getText().getTextStyle().setBold(true);
  lh.getText().getTextStyle().setForegroundColor(COLORS.accentLight);

  addBody(s, [
    'UTXO A:   5 ADA',
    'UTXO B:  50 ADA',
    'UTXO C:  12 ADA',
    'UTXO D:   3 ADA',
    '',
    'You want to send 15 ADA',
    'Which UTXOs do you pick?',
  ], {top: 115, left: 30, width: 310, height: 200, size: 14});

  // Divider
  var div = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 350, 90, 2, 280);
  div.getFill().setSolidFill(COLORS.accent);
  hideBorder(div);

  // Right column
  var rh = s.insertTextBox('Options:', 370, 85, 330, 25);
  rh.getText().getTextStyle().setFontFamily('Montserrat');
  rh.getText().getTextStyle().setFontSize(14);
  rh.getText().getTextStyle().setBold(true);
  rh.getText().getTextStyle().setForegroundColor(COLORS.success);

  var right = addBody(s, [
    'B (50) → change: ~34.83 ADA',
    'A+C (17) → change: ~1.83 ADA',
    'A+C+D (20) → change: ~4.83 ADA',
    '',
    'Trade-offs:',
    '  Fewer inputs = smaller tx = lower fee',
    '  Avoid "dust" UTXOs (tiny remainders)',
    '  Don\'t fragment unnecessarily',
    '',
    'Most SDKs include a coin selection',
    '  algorithm that chooses for you',
  ], {top: 115, left: 370, width: 330, height: 260, size: 13});

  addSlideNumber(s, 8);
  addNotes(s, 'Coin selection is a surprisingly complex problem. The library handles it, but understanding it helps debug issues. Common problem: "I have 100 ADA total but the transaction says insufficient funds" — this can happen if the ADA is split across many tiny UTXOs and the combined fees eat up the balance.');
}

function slide09_fees(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'How Fees Work');

  addCodeBlock(s, '  fee = minFeeA × txSize(bytes) + minFeeB\n\n  Example: 300-byte tx\n  fee = 44 × 300 + 155,381 = 168,581 lovelace (~0.17 ADA)', {top: 82, left: 50, width: 620, height: 80});

  var body = addBody(s, [
    'Deterministic fees — you know the cost BEFORE submitting',
    '  No "gas price wars" or fee spikes',
    '  No failed transactions that still charge a fee (Phase 1)',
    '',
    'The chicken-and-egg problem:',
    '  Fee depends on transaction size',
    '  Transaction size depends on fee (fee is in the tx body!)',
    '  Solution: estimate → calculate → rebuild',
    '  Transaction builder libraries handle this automatically',
  ], {top: 180});
  boldRanges(body.getText(), ['Deterministic fees', 'chicken-and-egg problem']);
  addSlideNumber(s, 9);
  addNotes(s, 'This is one of Cardano\'s strongest selling points: fee predictability. Developers can guarantee exactly what a transaction will cost before submitting it. The chicken-and-egg problem is interesting — the library solves it by doing iterative estimation.');
}

function slide10_addressesKeys(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Keys, Addresses, and Wallets');

  addCodeBlock(s, '  HD Wallet path:  m / 1852\' / 1815\' / account\' / role / index\n  1852 = Shelley purpose    1815 = Cardano coin type (Lovelace\'s birth year)', {top: 80, left: 40, width: 640, height: 50});

  var body = addBody(s, [
    'Address types:',
    '  Base address = payment cred + staking cred (most common)',
    '  Enterprise address = payment cred only (no staking)',
    '  Stake address = staking cred only (for delegation)',
    '',
    'Encoding: Bech32 format',
    '  Mainnet:  addr1...',
    '  Testnet:  addr_test1...',
    '',
    '24-word mnemonic = root of all keys = THE wallet',
    'Lose it → lose everything.  Share it → share everything.',
  ], {top: 148});
  boldRanges(body.getText(), ['Base address', 'Enterprise address', 'Stake address', '24-word mnemonic = root of all keys = THE wallet']);
  colorRanges(body.getText(), ['Lose it → lose everything.  Share it → share everything.'], COLORS.warning);
  addSlideNumber(s, 10);
  addNotes(s, 'A "wallet" in Cardano is NOT a single address — it\'s the entire derivation tree from a mnemonic. The base address is what we use in this tutorial. Stress that the mnemonic IS the wallet: losing it means losing all funds, sharing it means sharing all funds.');
}

function slide11_nativeTokens(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Native Tokens — No Smart Contract Required');

  // Left column
  var lh = s.insertTextBox('Ethereum Approach', 30, 85, 330, 25);
  lh.getText().getTextStyle().setFontFamily('Montserrat');
  lh.getText().getTextStyle().setFontSize(14);
  lh.getText().getTextStyle().setBold(true);
  lh.getText().getTextStyle().setForegroundColor(COLORS.warning);

  addBody(s, [
    'Tokens = smart contract state',
    '  (ERC-20, ERC-721)',
    'Each token = deploy a contract',
    'Transfer = call contract function',
    'Requires gas for execution',
  ], {top: 115, left: 30, width: 310, height: 170, size: 14});

  // Divider
  var div = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 350, 90, 2, 280);
  div.getFill().setSolidFill(COLORS.accent);
  hideBorder(div);

  // Right column
  var rh = s.insertTextBox('Cardano Approach', 370, 85, 330, 25);
  rh.getText().getTextStyle().setFontFamily('Montserrat');
  rh.getText().getTextStyle().setFontSize(14);
  rh.getText().getTextStyle().setBold(true);
  rh.getText().getTextStyle().setForegroundColor(COLORS.success);

  addBody(s, [
    'Tokens are first-class citizens',
    'Carried alongside ADA in outputs',
    'No smart contract for transfers',
    'Same mechanism as sending ADA',
    'Atomic multi-asset transfers',
    'Cheaper & simpler',
  ], {top: 115, left: 370, width: 330, height: 200, size: 14});

  addSlideNumber(s, 11);
  addNotes(s, 'On Ethereum, sending USDC means calling the USDC smart contract. On Cardano, sending a native token is exactly the same operation as sending ADA — it\'s just another value in the output. This makes token operations cheaper, simpler, and more uniform.');
}

function slide12_valueType(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Multi-Asset Values');

  addCodeBlock(s, '  Value = ADA (lovelace) + Map<PolicyId, Map<AssetName, Quantity>>', {top: 80, left: 40, width: 640, height: 35});

  addCodeBlock(s, '  {\n    "lovelace": 5000000,              // 5 ADA\n    "abc123...def456": {               // PolicyId\n      "TutorialToken": 1000,           // 1000 tokens\n      "AnotherToken": 50               // 50 tokens\n    },\n    "789xyz...abc012": {               // Different policy\n      "NFT001": 1                      // 1 NFT\n    }\n  }', {top: 125, left: 40, width: 640, height: 170});

  var body = addBody(s, [
    'A single UTXO can carry ADA + tokens from multiple policies',
    'ADA (lovelace) is always present — no PolicyId needed',
  ], {top: 315, left: 50, width: 620});
  boldRanges(body.getText(), ['A single UTXO can carry ADA + tokens from multiple policies']);
  addSlideNumber(s, 12);
  addNotes(s, 'The Value type is a nested map: first level is PolicyId (token family), second level is AssetName (specific token), and the value is the quantity. ADA itself is just lovelace without a PolicyId — it\'s the "native" currency.');
}

function slide13_minUtxo(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Why Every UTXO Needs ADA');

  addCodeBlock(s, '  minAda = coinsPerUTXOByte × utxoSize(bytes)', {top: 82, left: 60, width: 560, height: 35});

  var body = addBody(s, [
    'Rule: Every UTXO must carry a minimum amount of ADA',
    '',
    'Why? UTXOs consume memory in the node\'s UTXO set.',
    '     ADA is the "rent" for that storage.',
    '',
    'Typical minimums:',
    '  ADA-only UTXO:        ~1.0 ADA',
    '  UTXO with 1 token:    ~1.5 ADA',
    '  UTXO with 5 tokens:   ~2.0 ADA',
    '  UTXO with inline datum: ~2.5+ ADA',
    '',
    'Common error: "OutputTooSmall"',
    'Most SDKs adjust automatically if below minimum',
  ], {top: 130});
  boldRanges(body.getText(), ['Rule:', 'Why?']);
  colorRanges(body.getText(), ['"OutputTooSmall"'], COLORS.warning);
  addSlideNumber(s, 13);
  addNotes(s, 'This is the #1 gotcha for beginners with native tokens. You can\'t send "just tokens" — you must always include enough ADA. If you\'re building an NFT marketplace, every UTXO holding an NFT must also hold ~1.5 ADA.');
}

function slide14_mintingPolicies(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Who Can Create Tokens?');

  var body = addBody(s, [
    'A minting policy defines the rules for creating/destroying tokens',
    '',
    'NativeScript types:',
    '  ScriptPubkey     — requires a specific key\'s signature',
    '  ScriptAll        — ALL conditions must be met',
    '  ScriptAny        — ANY one condition must be met',
    '  ScriptAtLeast    — at least N-of-M conditions',
    '  RequireTimeBefore — only valid before slot X',
    '  RequireTimeAfter  — only valid after slot X',
    '',
    'Time-locked policy = fixed supply:',
    '  Combine key requirement + time lock',
    '  After expiry → no one can ever mint more',
    '  Provably finite-supply tokens',
  ]);
  boldRanges(body.getText(), ['minting policy', 'ScriptPubkey', 'ScriptAll', 'ScriptAny', 'ScriptAtLeast', 'RequireTimeBefore', 'RequireTimeAfter', 'Time-locked policy = fixed supply:']);
  colorRanges(body.getText(), ['no one can ever mint more'], COLORS.gold);
  addSlideNumber(s, 14);
  addNotes(s, 'Minting policies are access control for token creation. The time-locked pattern is especially important for token launches: by combining ScriptAll with RequireTimeBefore, you can prove that no new tokens will ever be minted after a certain date. In our tutorial code, we use PolicyUtil.createMultiSigScriptAllPolicy.');
}

function slide15_policyIdAssetName(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Token Identity');

  var body = addBody(s, [
    'PolicyId = Blake2b-224 hash of the policy script',
    '  28 bytes = 56 hex characters',
    '  Uniquely identifies the "token family"',
    '  Cannot be changed after creation (it\'s a hash)',
    '',
    'AssetName = human-readable name (up to 32 bytes)',
    '  Identifies a specific token within a policy',
    '  Hex-encoded on-chain',
    '',
    'Full token ID = PolicyId + AssetName',
  ]);
  boldRanges(body.getText(), ['PolicyId', 'AssetName', 'Full token ID']);

  addCodeBlock(s, '  PolicyId:  abc123...def456  (56 hex chars)\n  AssetName: 5475746f7269616c546f6b656e  (hex of "TutorialToken")\n  Fingerprint (CIP-14): asset1...  (human-friendly)', {top: 310, left: 40, width: 640, height: 65});

  addSlideNumber(s, 15);
  addNotes(s, 'The PolicyId is the permanent, immutable anchor of a token family. AssetName distinguishes tokens within the same policy — for example, an NFT collection might have one PolicyId with different AssetNames for each NFT.');
}

function slide16_pitfalls(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Top 5 Mistakes Beginners Make');

  var body = addBody(s, [
    '1. Forgetting the change output',
    '    Entire input minus fee goes to the receiver. You lose your ADA!',
    '',
    '2. Min UTXO not met',
    '    "OutputTooSmall" error. Every output needs ~1-2 ADA.',
    '',
    '3. Wrong network',
    '    Testnet tx to mainnet (or vice versa). Check address prefix!',
    '',
    '4. TTL too tight',
    '    Tx expires before reaching a block producer. Allow 5-10 min.',
    '',
    '5. Spending already-spent UTXOs',
    '    UTXOs are one-time use. Refresh your UTXO set before building.',
  ], {top: 85, size: 14});
  boldRanges(body.getText(), ['1. Forgetting the change output', '2. Min UTXO not met', '3. Wrong network', '4. TTL too tight', '5. Spending already-spent UTXOs']);
  colorRanges(body.getText(), ['You lose your ADA!', '"OutputTooSmall"'], COLORS.warning);
  addSlideNumber(s, 16);
  addNotes(s, '#1 is the most dangerous — it\'s how people lose funds. Transaction builder libraries create change outputs automatically, but understanding this is critical. #2 is the most common. #5 happens in concurrent scenarios — if two people try to spend the same UTXO, only one succeeds.');
}

function slide17_tooling(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  setBackground(s);
  addTitle(s, 'Developer Tools');

  // Left column - SDKs
  var lh = s.insertTextBox('SDKs / Libraries', 30, 85, 330, 25);
  lh.getText().getTextStyle().setFontFamily('Montserrat');
  lh.getText().getTextStyle().setFontSize(14);
  lh.getText().getTextStyle().setBold(true);
  lh.getText().getTextStyle().setForegroundColor(COLORS.accentLight);

  var left = addBody(s, [
    'Java: cardano-client-lib ← today',
    'JS/TS: Mesh SDK, Lucid, Blaze',
    'Python: PyCardano',
    'Rust: cardano-serialization-lib',
    'Haskell: cardano-api (official)',
  ], {top: 115, left: 30, width: 310, height: 160, size: 14});
  colorRanges(left.getText(), ['← today'], COLORS.success);

  // Divider
  var div = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 350, 90, 2, 280);
  div.getFill().setSolidFill(COLORS.accent);
  hideBorder(div);

  // Right column - Backends & tools
  var rh = s.insertTextBox('Infrastructure', 370, 85, 330, 25);
  rh.getText().getTextStyle().setFontFamily('Montserrat');
  rh.getText().getTextStyle().setFontSize(14);
  rh.getText().getTextStyle().setBold(true);
  rh.getText().getTextStyle().setForegroundColor(COLORS.accentLight);

  addBody(s, [
    'Blockfrost — hosted REST API',
    'Koios — community, open source',
    'Ogmios + Kupo — self-hosted',
    'Yaci DevKit — local dev chain',
    '',
    'Explorers:',
    '  CardanoScan, CExplorer',
    '',
    'Testnets:',
    '  Preprod (stable), Preview (edge)',
  ], {top: 115, left: 370, width: 330, height: 260, size: 13});

  addSlideNumber(s, 17);
  addNotes(s, 'For this tutorial we chose Java + cardano-client-lib + Blockfrost. Blockfrost provides a free tier sufficient for development. For production, consider self-hosted solutions (Ogmios + Kupo) for full control.');
}

