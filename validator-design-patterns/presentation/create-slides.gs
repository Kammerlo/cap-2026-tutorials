/**
 * Validator Design Patterns on Cardano — Google Slides Generator
 * CAP 2026
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. New project — paste this file
 * 3. Run createPresentation, accept permissions
 * 4. Open the URL printed in Execution Log
 *
 * Companion deck for the four demo validators in
 *   validator-design-patterns/aiken/validators/{one_shot_nft, state_machine, oracle, withdraw_zero}.ak
 */

// ─── Theme ──────────────────────────────────────────────────────────────────

const COLORS = {
  bg:          '#ffffff',
  card:        '#f5f7fa',
  accent:      '#0033ad',
  accent2:     '#0052cc',
  text:        '#1a1a2e',
  dim:         '#64748b',
  codeBg:      '#0f172a',
  codeText:    '#e2e8f0',
  codeAccent:  '#7dd3fc',
  warn:        '#dc2626',
  ok:          '#059669',
  gold:        '#b45309',
  eth:         '#627eea',
};

// Slide canvas is 720 x 405. Grid:
//   margin = 30
//   title   y=20  h=38  size=26
//   content y=70..380
//   page #  y=388

// ─── Main ───────────────────────────────────────────────────────────────────

function createPresentation() {
  const deck = SlidesApp.create('Validator Design Patterns on Cardano — CAP 2026');
  deck.getSlides()[0].remove();

  slide01_title(deck);
  slide02_whyPatterns(deck);
  slide03_patternMap(deck);
  slide04_utxoIdentity(deck);

  // Pattern 1
  slide05_oneShotIntro(deck);
  slide06_oneShotMechanism(deck);
  slide07_oneShotCode(deck);
  slide08_oneShotProjects(deck);

  // Pattern 2
  slide09_threadTokenIntro(deck);
  slide10_threadTokenMechanism(deck);
  slide11_stateMachineCode(deck);
  slide12_stateMachineProjects(deck);

  // Pattern 3
  slide13_refInputsIntro(deck);
  slide14_oracleMechanism(deck);
  slide15_oracleCode(deck);
  slide16_oracleProjects(deck);

  // Pattern 4
  slide17_withdrawZeroProblem(deck);
  slide18_withdrawZeroMechanism(deck);
  slide19_withdrawZeroCode(deck);
  slide20_withdrawZeroProjects(deck);

  slide21_otherPatterns(deck);
  slide22_doubleSatisfaction(deck);
  slide23_cfTemplateRepo(deck);
  slide24_cfTemplateMapping(deck);
  slide25_decisionGuide(deck);
  slide26_resources(deck);
  slide27_summary(deck);

  Logger.log('Presentation created: ' + deck.getUrl());
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function newSlide(deck) {
  var s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  s.getBackground().setSolidFill(COLORS.bg);
  return s;
}

function addTitle(slide, text) {
  var box = slide.insertTextBox(text, 30, 20, 660, 38);
  var ts = box.getText().getTextStyle();
  ts.setFontFamily('Montserrat');
  ts.setFontSize(26);
  ts.setBold(true);
  ts.setForegroundColor(COLORS.text);
  // Accent underline
  var underline = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 30, 60, 50, 3);
  underline.getFill().setSolidFill(COLORS.accent);
  underline.getBorder().setTransparent();
  return box;
}

/// Body text. opts: { top, height, size }
function addBody(slide, lines, opts) {
  opts = opts || {};
  var top  = opts.top    || 75;
  var h    = opts.height || 300;
  var size = opts.size   || 13;
  var box  = slide.insertTextBox(lines.join('\n'), 30, top, 660, h);
  var t    = box.getText();
  var ts   = t.getTextStyle();
  ts.setFontFamily('Open Sans');
  ts.setFontSize(size);
  ts.setForegroundColor(COLORS.text);
  t.getParagraphStyle().setLineSpacing(125);
  t.getParagraphStyle().setSpaceBelow(2);
  return box;
}

/// Dark code block, explicitly LEFT-aligned. opts: { top, height, size }
function addCode(slide, code, opts) {
  opts = opts || {};
  var top  = opts.top    || 70;
  var h    = opts.height || 220;
  var size = opts.size   || 11;
  var shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 30, top, 660, h);
  shape.getFill().setSolidFill(COLORS.codeBg);
  shape.getBorder().setTransparent();
  shape.setContentAlignment(SlidesApp.ContentAlignment.TOP);
  // Use a TextBox INSIDE the rectangle so we get padding control + reliable left align
  var tb = slide.insertTextBox(code, 42, top + 8, 636, h - 16);
  var t  = tb.getText();
  var ts = t.getTextStyle();
  ts.setFontFamily('Courier New');
  ts.setFontSize(size);
  ts.setForegroundColor(COLORS.codeText);
  t.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.START);
  t.getParagraphStyle().setLineSpacing(112);
  t.getParagraphStyle().setSpaceBelow(0);
  return shape;
}

function addCaption(slide, text, top) {
  var box = slide.insertTextBox(text, 30, top, 660, 60);
  var t = box.getText();
  var ts = t.getTextStyle();
  ts.setFontFamily('Open Sans');
  ts.setFontSize(12);
  ts.setForegroundColor(COLORS.dim);
  ts.setItalic(true);
  t.getParagraphStyle().setLineSpacing(125);
  return box;
}

function addPageNum(slide, num) {
  var box = slide.insertTextBox(String(num), 670, 388, 30, 14);
  var ts = box.getText().getTextStyle();
  ts.setFontFamily('Open Sans');
  ts.setFontSize(9);
  ts.setForegroundColor(COLORS.dim);
}

function bold(textRange, phrases) {
  var raw = textRange.asString();
  phrases.forEach(function(p) {
    var i = raw.indexOf(p);
    while (i !== -1) {
      textRange.getRange(i, i + p.length).getTextStyle().setBold(true);
      i = raw.indexOf(p, i + p.length);
    }
  });
}

function color(textRange, phrases, c) {
  var raw = textRange.asString();
  phrases.forEach(function(p) {
    var i = raw.indexOf(p);
    while (i !== -1) {
      textRange.getRange(i, i + p.length).getTextStyle().setForegroundColor(c);
      i = raw.indexOf(p, i + p.length);
    }
  });
}

/// Card with colored title bar and body. Returns body textbox.
function card(slide, title, lines, x, y, w, h, accent) {
  var box = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, h);
  box.getFill().setSolidFill(COLORS.card);
  box.getBorder().setWeight(1);
  box.getBorder().getLineFill().setSolidFill(accent);

  var titleBar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, 22);
  titleBar.getFill().setSolidFill(accent);
  titleBar.getBorder().setTransparent();

  var titleBox = slide.insertTextBox(title, x + 8, y + 2, w - 16, 20);
  var ts = titleBox.getText().getTextStyle();
  ts.setFontFamily('Montserrat');
  ts.setFontSize(11);
  ts.setBold(true);
  ts.setForegroundColor('#ffffff');

  var bodyBox = slide.insertTextBox(lines.join('\n'), x + 10, y + 28, w - 20, h - 32);
  var t = bodyBox.getText();
  var bs = t.getTextStyle();
  bs.setFontFamily('Open Sans');
  bs.setFontSize(10);
  bs.setForegroundColor(COLORS.text);
  t.getParagraphStyle().setLineSpacing(120);
  return bodyBox;
}

function step(slide, text, x, y, w, h, fill, border) {
  var bx = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, h);
  bx.getFill().setSolidFill(fill);
  bx.getBorder().setWeight(1);
  bx.getBorder().getLineFill().setSolidFill(border);
  var tx = slide.insertTextBox(text, x, y + 4, w, h - 8);
  var t = tx.getText();
  var ts = t.getTextStyle();
  ts.setFontFamily('Open Sans');
  ts.setFontSize(10);
  ts.setForegroundColor(COLORS.text);
  t.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  t.getParagraphStyle().setLineSpacing(115);
  return tx;
}

function arrow(slide, x, y) {
  var a = slide.insertTextBox('→', x, y, 16, 22);
  var ts = a.getText().getTextStyle();
  ts.setFontSize(16);
  ts.setForegroundColor(COLORS.dim);
  ts.setBold(true);
}

function notes(slide, t) {
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(t);
}

// ─── Slides ─────────────────────────────────────────────────────────────────

function slide01_title(deck) {
  var s = newSlide(deck);

  var t = s.insertTextBox('Validator\nDesign Patterns', 40, 110, 640, 130);
  var ts = t.getText().getTextStyle();
  ts.setFontFamily('Montserrat'); ts.setFontSize(48); ts.setBold(true);
  ts.setForegroundColor(COLORS.text);

  var line = s.insertShape(SlidesApp.ShapeType.RECTANGLE, 40, 240, 200, 4);
  line.getFill().setSolidFill(COLORS.accent);
  line.getBorder().setTransparent();

  var sub = s.insertTextBox('Patterns Cardano protocols actually use', 40, 254, 640, 30);
  var ss = sub.getText().getTextStyle();
  ss.setFontFamily('Open Sans'); ss.setFontSize(18);
  ss.setForegroundColor(COLORS.accent2);

  var foot = s.insertTextBox('CAP 2026  •  Aiken  •  Plutus V3  •  eUTXO', 40, 365, 640, 22);
  var fs = foot.getText().getTextStyle();
  fs.setFontFamily('Open Sans'); fs.setFontSize(11);
  fs.setForegroundColor(COLORS.dim);

  notes(s, 'Welcome. Last session: HOW to write a validator. This session: WHICH patterns experienced Cardano protocols use, and WHY.');
}

function slide02_whyPatterns(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Why Patterns Matter');

  var b = addBody(s, [
    'eUTXO is a different model — Solidity intuitions don\'t transfer.',
    '',
    'Every serious Cardano protocol re-discovers the same questions:',
    '   How do I uniquely identify ONE on-chain object?',
    '   How does that object EVOLVE across transactions?',
    '   How do MANY readers share data WITHOUT contention?',
    '   How does ONE tx validate MANY things efficiently?',
    '',
    'These problems have established answers. Today we build four of them in Aiken.',
  ], {top: 80, size: 14});
  bold(b.getText(), ['eUTXO is a different model', 'four of them']);

  addPageNum(s, 2);
  notes(s, 'These are not academic patterns — every one ships in production at Minswap, SundaeSwap, Indigo, Charli3.');
}

function slide03_patternMap(deck) {
  var s = newSlide(deck);
  addTitle(s, 'The Four Patterns We\'ll Build');

  card(s, '1.  ONE-SHOT NFT', [
    'Singleton mint via TxOutRef.',
    'Foundation for every "unique"',
    'on-chain object.',
  ], 30, 75, 320, 95, COLORS.accent);

  card(s, '2.  THREAD TOKEN + STATE MACHINE', [
    'Stable identity across UTXO updates.',
    'Thread NFT + continuing output +',
    'explicit state transitions.',
  ], 370, 75, 320, 95, COLORS.ok);

  card(s, '3.  REFERENCE INPUTS  (CIP-31)', [
    'Read on-chain data without spending.',
    'Eliminates oracle contention.',
    'The key Vasil-era unlock.',
  ], 30, 180, 320, 95, COLORS.gold);

  card(s, '4.  WITHDRAW-ZERO TRICK', [
    'One stake validator gates many spends.',
    'Turns O(N²) batch checks into O(N).',
    'How DEX batchers actually scale.',
  ], 370, 180, 320, 95, COLORS.warn);

  addCaption(s, 'For each pattern: WHY  →  HOW (compiling Aiken)  →  WHERE production code uses it.', 290);

  addPageNum(s, 3);
  notes(s, 'Roadmap. Each pattern: 4 slides — problem, mechanism, code, real projects.');
}

function slide04_utxoIdentity(deck) {
  var s = newSlide(deck);
  addTitle(s, 'The Core Problem — UTXO Identity');

  var b = addBody(s, [
    'Ethereum:  contract has a STABLE address forever.',
    'Cardano:   every UTXO has a TRANSIENT identity — spend destroys, replaces.',
    '',
    'But protocols need stable on-chain objects:',
    '   THIS pool.   THIS oracle feed.   THIS loan.   THIS CDP.',
    '',
    'Cardano\'s answer:   identity by ASSET, not by address.',
    '',
    '   Mint a unique token (a "thread NFT")',
    '   The token travels with the state UTXO',
    '   Off-chain query: "which UTXO at script S contains token T?"',
    '',
    'Every pattern in this session traces back to this single idea.',
  ], {top: 80});
  bold(b.getText(), ['STABLE address', 'TRANSIENT identity', 'identity by ASSET, not by address', 'single idea']);
  color(b.getText(), ['STABLE address'], COLORS.eth);
  color(b.getText(), ['TRANSIENT identity'], COLORS.warn);
  color(b.getText(), ['identity by ASSET, not by address'], COLORS.ok);

  addPageNum(s, 4);
  notes(s, 'The conceptual key. Once "identity by asset" lands, the rest is natural.');
}

// ── Pattern 1: One-Shot NFT ────────────────────────────────────────────────

function slide05_oneShotIntro(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Pattern 1 — One-Shot NFT');

  var b = addBody(s, [
    'Goal: guarantee a token can be minted exactly ONCE in chain history.',
    '',
    'Why we need this:',
    '   An NFT must be unique — anything else is fungible.',
    '   Pool NFTs, factory authority tokens, oracle feed IDs, CIP-68',
    '   reference tokens — they all start here.',
    '',
    'Why naive doesn\'t work:',
    '   A minting policy is a pure function of (Redeemer, Context).',
    '   Any tx can re-run it. We need a constraint the chain enforces.',
    '',
    'Cardano gives us exactly one such primitive: spending a specific UTXO.',
  ], {top: 80});
  bold(b.getText(), ['exactly ONCE', 'pure function', 'spending a specific UTXO']);

  addPageNum(s, 5);
  notes(s, 'Frame the impossibility before the trick. A pure function over Data alone cannot enforce "at most once".');
}

function slide06_oneShotMechanism(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Mechanism — Parameterise by a Seed UTXO');

  var b = addBody(s, [
    'At deployment, pick any UTXO you control. Bake its OutputReference into',
    'the validator as a compile-time parameter.',
    '',
    'The mint succeeds only if:',
    '   1.  the seed UTXO is among the tx inputs',
    '   2.  exactly the expected token (qty 1) is minted',
    '',
    'UTXOs are spent at most once. So the seed appears in inputs in at most',
    'one tx, ever.   Therefore the mint succeeds at most once.',
  ], {top: 80, height: 150});
  bold(b.getText(), ['compile-time parameter', 'at most once', 'at most once']);

  // Flow diagram
  step(s, 'Seed UTXO\n(any output\nyou control)',  30, 245, 145, 60, '#eef2ff', COLORS.accent);
  arrow(s, 178, 263);
  step(s, 'Tx consumes seed\n+ invokes policy',   200, 245, 145, 60, '#fef3c7', COLORS.gold);
  arrow(s, 348, 263);
  step(s, 'Policy checks:\nseed in inputs\n+ qty == 1', 370, 245, 145, 60, '#f0fdf4', COLORS.ok);
  arrow(s, 518, 263);
  step(s, 'NFT minted.\nForever unique.',         540, 245, 145, 60, '#f0fdf4', COLORS.ok);

  addPageNum(s, 6);
  notes(s, 'Each seed UTXO gives a different script hash → different policy ID. You cannot pre-mint and re-use.');
}

function slide07_oneShotCode(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Code — one_shot_nft.ak');

  addCode(s, [
    'validator one_shot_nft(seed: OutputReference, asset_name: ByteArray) {',
    '  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {',
    '    // (1) seed UTXO must be consumed in this tx',
    '    let seed_consumed =',
    '      list.any(self.inputs, fn(i) { i.output_reference == seed })',
    '',
    '    // (2) exactly one expected token minted under this policy',
    '    let minted = assets.tokens(self.mint, policy_id)',
    '    let exactly_one =',
    '      when dict.to_pairs(minted) is {',
    '        [Pair(name, qty)] -> name == asset_name && qty == 1',
    '        _ -> False',
    '      }',
    '',
    '    seed_consumed && exactly_one',
    '  }',
    '  else(_) { False }',
    '}',
  ].join('\n'), {top: 70, height: 240, size: 11});

  addCaption(s, 'Two checks. Forgetting #2 is the #1 audit finding for new Aiken devs.', 320);

  addPageNum(s, 7);
  notes(s, 'Two-check pattern: input check + mint quantity check. Both required.');
}

function slide08_oneShotProjects(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Production Use — One-Shot NFT');

  card(s, 'MINSWAP V2',     ['Pool factory authority NFT', 'github.com/minswap/minswap-dex-v2'], 30, 75, 320, 70, COLORS.accent);
  card(s, 'SUNDAESWAP V3',  ['Pool identification NFTs', 'github.com/SundaeSwap-finance/sundae-contracts'], 370, 75, 320, 70, COLORS.ok);
  card(s, 'INDIGO',         ['Protocol authority tokens', 'github.com/IndigoProtocol'], 30, 155, 320, 70, COLORS.gold);
  card(s, 'ANASTASIA LABS', ['Canonical reference impl', 'github.com/Anastasia-Labs/aiken-design-patterns'], 370, 155, 320, 70, COLORS.warn);

  card(s, 'CARDANO FOUNDATION TEMPLATE REPO', [
    '/factory/      — instance creation via seed UTXO',
    '/editable-nft/ — collection reference NFTs',
    'github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring',
  ], 30, 235, 660, 90, COLORS.accent2);

  addPageNum(s, 8);
  notes(s, 'Send students to Minswap V2 factory_validator first. CF template /factory/ for a stripped-down version.');
}

// ── Pattern 2: State Machine ───────────────────────────────────────────────

function slide09_threadTokenIntro(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Pattern 2 — Thread Token + State Machine');

  var b = addBody(s, [
    'We need a STABLE on-chain object that can EVOLVE.',
    'A pool whose reserves change.   A CDP whose collateral moves.',
    '',
    'eUTXO has no "state" — only UTXOs that get spent and replaced.',
    '',
    'The recipe combines three patterns:',
    '   Thread token       — a unique NFT the state UTXO always carries',
    '   Continuing output  — spend must produce a successor at the same script',
    '   State machine      — explicit phase tag with allowed transitions',
    '',
    'Multi-validator: mint + spend handlers in one Aiken block share one script',
    'hash, so the thread token\'s policy = the state script\'s credential.',
  ], {top: 80});
  bold(b.getText(), ['STABLE', 'EVOLVE', 'three patterns', 'Multi-validator']);

  addPageNum(s, 9);
  notes(s, 'Three patterns that essentially always come together. Teach them as one unit.');
}

function slide10_threadTokenMechanism(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Lifecycle of a State UTXO');

  // Lifecycle steps
  step(s, 'INIT\nmint thread NFT\n(one-shot)',          30, 90, 155, 65, '#f0fdf4', COLORS.ok);
  arrow(s, 188, 113);
  step(s, 'STEP 1\nspend +\nre-pay self',              210, 90, 155, 65, '#f0fdf4', COLORS.ok);
  arrow(s, 368, 113);
  step(s, 'STEP 2\nspend +\nre-pay self',              390, 90, 155, 65, '#f0fdf4', COLORS.ok);
  arrow(s, 548, 113);
  step(s, 'CLOSE\nspend +\nburn NFT',                  570, 90, 120, 65, '#fef2f2', COLORS.warn);

  var b = addBody(s, [
    'Each tx that touches the state must produce ONE continuing output:',
    '   same script address',
    '   same thread NFT (qty = 1)',
    '   updated datum that satisfies the transition rule',
    '',
    'Off-chain code finds it by querying the asset:',
  ], {top: 175, height: 100, size: 13});
  bold(b.getText(), ['ONE continuing output']);

  addCode(s, '  GET /assets/{policy_id}{asset_name}/addresses   →   the canonical state UTXO',
    {top: 290, height: 30, size: 11});

  addCaption(s, 'The asset is the pointer. Burn the asset → state ceases to exist.', 330);

  addPageNum(s, 10);
  notes(s, 'Token = pointer. Validator = rule book. Off-chain = asset query.');
}

function slide11_stateMachineCode(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Code — state_machine.ak (excerpt)');

  addCode(s, [
    'pub type Phase { Idle, Active, Closed }',
    '',
    'pub type Counter {',
    '  state: Phase, count: Int, owner: VerificationKeyHash,',
    '}',
    '',
    'validator state_machine {',
    '  mint(action, policy_id, self) {',
    '    // Init = one-shot mint, paid to self with Idle datum',
    '    // Burn = qty -1, only valid when state was Closed',
    '  }',
    '  spend(datum, action, own_ref, self) {',
    '    expect Some(prev) = datum',
    '    expect list.has(self.extra_signatories, prev.owner)',
    '    when action is {',
    '      Start     -> // Idle    → Active,   count = 0',
    '      Increment -> // Active  → Active,   count = prev.count + 1',
    '      Stop      -> // Active  → Closed,   count preserved',
    '    }',
    '  }',
    '}',
  ].join('\n'), {top: 70, height: 245, size: 11});

  addCaption(s, 'Each transition checks: continuing output exists, thread NFT preserved, owner unchanged.', 325);

  addPageNum(s, 11);
  notes(s, 'Two-step shutdown is intentional: spend ends in Closed, mint then burns the NFT.');
}

function slide12_stateMachineProjects(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Production Use — State Machines');

  card(s, 'MINSWAP V1 / V2',  ['Each pool has a unique pool_NFT', 'Pool UTXO carries reserves'], 30, 75, 320, 70, COLORS.accent);
  card(s, 'SUNDAESWAP V3',    ['Pool state via pool_ident NFT', 'Sophisticated state evolution'], 370, 75, 320, 70, COLORS.ok);
  card(s, 'INDIGO',           ['CDP UTXO with per-CDP NFT', 'Active / Frozen / Liquidated'], 30, 155, 320, 70, COLORS.gold);
  card(s, 'CARDANO-LOANS',    ['Offered → Active → Repaid', 'github.com/fallen-icarus/cardano-loans'], 370, 155, 320, 70, COLORS.warn);

  card(s, 'CARDANO FOUNDATION TEMPLATE REPO', [
    '/auction/   bidding state machine          /vesting/   time-locked release',
    '/crowdfund/ deadline + refund transitions  /bet/, /escrow/, /htlc/   small demos',
  ], 30, 235, 660, 75, COLORS.accent2);

  addPageNum(s, 12);
  notes(s, 'Cardano-Loans is the cleanest small repo to read end to end.');
}

// ── Pattern 3: Reference Inputs ────────────────────────────────────────────

function slide13_refInputsIntro(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Pattern 3 — Reference Inputs (CIP-31)');

  var b = addBody(s, [
    'Pre-Vasil: reading on-chain data required SPENDING the UTXO.',
    'One reader per block. Oracles unusable at scale.',
    '',
    'CIP-31 (Vasil, 2022) introduced REFERENCE INPUTS:',
    '   appear in self.reference_inputs and in the script context',
    '   are NOT consumed — they remain on chain',
    '   unbounded many txs in the same block can reference them',
    '',
    'Combined with CIP-32 inline datums: a clean read primitive.',
    '',
    'Classic use case: ORACLES.',
  ], {top: 80});
  bold(b.getText(), ['SPENDING the UTXO', 'NOT consumed', 'ORACLES']);
  color(b.getText(), ['ORACLES'], COLORS.accent);

  addPageNum(s, 13);
  notes(s, 'Most important post-Genesis upgrade for smart-contract scalability.');
}

function slide14_oracleMechanism(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Oracle Architecture — Two Validators');

  card(s, 'ORACLE_FEED  (writer)', [
    'Operator-only spend handler.',
    'Continuing output preserves NFT.',
    'Updates infrequently.',
  ], 30, 75, 320, 90, COLORS.accent);

  card(s, 'PRICE_CONSUMER  (reader)', [
    'Reads oracle as REFERENCE INPUT.',
    'Verifies address + feed NFT.',
    'Many readers per block — no contention.',
  ], 370, 75, 320, 90, COLORS.ok);

  // Read flow
  var label = s.insertTextBox('READ FLOW per consumer tx:', 30, 180, 400, 18);
  var ls = label.getText().getTextStyle();
  ls.setFontFamily('Montserrat'); ls.setFontSize(11); ls.setBold(true);
  ls.setForegroundColor(COLORS.text);

  step(s, 'Find oracle in\nreference_inputs', 30, 205, 145, 50, '#fef3c7', COLORS.gold);
  arrow(s, 178, 220);
  step(s, 'Verify\naddr + NFT',               200, 205, 145, 50, '#fef3c7', COLORS.gold);
  arrow(s, 348, 220);
  step(s, 'Read\ninline datum',               370, 205, 145, 50, '#f0fdf4', COLORS.ok);
  arrow(s, 518, 220);
  step(s, 'Check\nfreshness',                 540, 205, 150, 50, '#f0fdf4', COLORS.ok);

  addCaption(s, 'Address + thread NFT together prevent impersonation. Either alone is unsafe.', 280);

  addPageNum(s, 14);
  notes(s, 'Two-check verification is non-negotiable. NFT-only checks have been exploited.');
}

function slide15_oracleCode(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Code — oracle.ak (consumer)');

  addCode(s, [
    'validator price_consumer(',
    '  oracle_addr: Address,',
    '  feed_policy: PolicyId,',
    '  feed_token: ByteArray,',
    ') {',
    '  spend(datum, _action, _own_ref, self) {',
    '    expect Some(d) = datum',
    '    expect list.has(self.extra_signatories, d.owner)',
    '',
    '    expect Some(oracle_ref) =',
    '      list.find(self.reference_inputs, fn(i) {',
    '        i.output.address == oracle_addr',
    '          && assets.quantity_of(',
    '               i.output.value, feed_policy, feed_token) == 1',
    '      })',
    '',
    '    expect InlineDatum(raw) = oracle_ref.output.datum',
    '    expect feed: FeedDatum = raw',
    '    feed.price >= d.threshold && feed.updated_at > 0',
    '  }',
    '}',
  ].join('\n'), {top: 70, height: 260, size: 10});

  addCaption(s, 'Consumer never spends the oracle. Same UTXO supports unbounded parallel reads.', 340);

  addPageNum(s, 15);
  notes(s, 'Parameterising on (oracle_addr, feed_policy, feed_token) pins the trusted feed at compile time.');
}

function slide16_oracleProjects(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Production Use — Oracles');

  card(s, 'CHARLI3',           ['Reference oracle on Cardano', 'Used by Indigo, Lenfi, Liqwid', 'github.com/Charli3-Official'], 30, 75, 320, 80, COLORS.accent);
  card(s, 'ORCFAX',            ['Alternative oracle network', 'CER-published price feeds', 'github.com/orcfax'], 370, 75, 320, 80, COLORS.ok);
  card(s, 'WINGRIDERS TWAP',   ['Pool TWAP exposed as ref input', 'Internal oracle for own protocol'], 30, 165, 320, 70, COLORS.gold);
  card(s, 'INDIGO',            ['Wraps Charli3 with extra checks', 'iAsset price feeds for CDPs'], 370, 165, 320, 70, COLORS.warn);

  card(s, 'CARDANO FOUNDATION TEMPLATE REPO', [
    '/pricebet/  payouts conditional on oracle feed     /lottery/  entropy via ref input',
    '/storage/   shared on-chain data read by many',
  ], 30, 245, 660, 75, COLORS.accent2);

  addPageNum(s, 16);
  notes(s, 'Audit lesson: never trust a datum without checking address + NFT together.');
}

// ── Pattern 4: Withdraw-Zero ───────────────────────────────────────────────

function slide17_withdrawZeroProblem(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Pattern 4 — The Scaling Problem');

  var b = addBody(s, [
    'A DEX batcher consumes N orders + the pool in one transaction.',
    'Each order has its own spend validator invocation.',
    '',
    'If each one re-runs the SAME global check ("does the pool invariant hold?"),',
    'cost is:',
    '',
    '   N invocations  ×  cost-of-global-check   =   O(N²)',
    '',
    'Cardano\'s ex-budget caps batch sizes brutally. A 10-order batch hits the wall.',
    '',
    'We need:',
    '   global check runs ONCE per transaction',
    '   each spend just confirms the global check is happening',
  ], {top: 80});
  bold(b.getText(), ['SAME global check', 'O(N²)', 'ONCE per transaction']);
  color(b.getText(), ['O(N²)'], COLORS.warn);

  addPageNum(s, 17);
  notes(s, 'Conceptual peak. Pi Lanningham (SundaeSwap CTO) has talks dedicated to this.');
}

function slide18_withdrawZeroMechanism(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Mechanism — Stake Validator + Zero Withdrawal');

  var b = addBody(s, [
    'Plutus V3 validators have a `withdraw` handler — invoked when the tx',
    'contains a reward-account WITHDRAWAL from this stake credential.',
    '',
    'The trick:',
    '   include a withdrawal of 0 ADA from the stake credential',
    '   the protocol still treats it as a withdrawal → stake validator runs',
    '   the stake validator does ALL the heavy verification, ONCE',
    '',
    'Each spend becomes trivial:',
    '   "Is there a withdrawal from THE trusted stake credential?"',
    '   Constant-time map lookup.',
  ], {top: 80, height: 200});
  bold(b.getText(), ['withdraw', 'WITHDRAWAL', '0 ADA', 'ONCE', 'Constant-time map lookup']);

  // Cost comparison
  var label = s.insertTextBox('COST COMPARISON', 30, 280, 400, 18);
  var ls = label.getText().getTextStyle();
  ls.setFontFamily('Montserrat'); ls.setFontSize(11); ls.setBold(true);
  ls.setForegroundColor(COLORS.text);

  var bad = s.insertTextBox('before:   N × O(global)   =   O(N²)', 30, 302, 660, 18);
  var bs = bad.getText().getTextStyle();
  bs.setFontFamily('Courier New'); bs.setFontSize(12); bs.setForegroundColor(COLORS.warn);

  var good = s.insertTextBox('after:    N × O(1)  +  1 × O(global)   =   O(N) + constant', 30, 322, 660, 18);
  var gs = good.getText().getTextStyle();
  gs.setFontFamily('Courier New'); gs.setFontSize(12); gs.setForegroundColor(COLORS.ok);

  addPageNum(s, 18);
  notes(s, 'Why ZERO ADA? Withdrawal amount is irrelevant — we only need the entry in the map. Zero is cheapest.');
}

function slide19_withdrawZeroCode(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Code — withdraw_zero.ak');

  addCode(s, [
    '// (1) Stake validator does the EXPENSIVE check, ONCE',
    'validator batch_authority {',
    '  withdraw(redeemer: BatchAction, _credential, self: Transaction) {',
    '    when redeemer is { Settle -> /* heavy global check */ }',
    '  }',
    '}',
    '',
    '// (2) Each order spend just checks the stake validator runs',
    'validator order(batch_authority_hash: ByteArray) {',
    '  spend(datum, _redeemer, _own_ref, self) {',
    '    expect Some(_) = datum',
    '    let trusted = Script(batch_authority_hash)',
    '    when pairs.get_first(self.withdrawals, trusted) is {',
    '      Some(_) -> True   // stake validator IS being invoked',
    '      None    -> False',
    '    }',
    '  }',
    '}',
  ].join('\n'), {top: 70, height: 255, size: 11});

  addCaption(s, 'All complexity moves to the stake validator. Order spend is trivially auditable.', 335);

  addPageNum(s, 19);
  notes(s, 'Order validator is dramatically simpler than naive — that\'s the point.');
}

function slide20_withdrawZeroProjects(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Production Use — Withdraw-Zero Trick');

  card(s, 'SUNDAESWAP V3 SCOOPERS',  ['Canonical implementation', 'One stake validator authorises', 'an entire batch of orders'], 30, 75, 320, 85, COLORS.accent);
  card(s, 'MINSWAP V2',              ['Order batching same idiom', 'github.com/minswap/minswap-dex-v2'], 370, 75, 320, 85, COLORS.ok);
  card(s, 'GENIUS YIELD SLV',        ['Smart Liquidity Vaults', 'Order matching delegated to', 'a stake validator'], 30, 170, 320, 85, COLORS.gold);
  card(s, 'SPLASH PROTOCOL',         ['Concentrated liquidity DEX', 'Heavy use of the trick', 'github.com/splashprotocol'], 370, 170, 320, 85, COLORS.warn);

  card(s, 'READING LIST', [
    'Pi Lanningham\'s "Cardano Patterns" series — canonical write-up',
    'github.com/Anastasia-Labs/aiken-design-patterns — reference impl',
    'Cardano Foundation /constant-product-amm/, /payment-splitter/',
  ], 30, 265, 660, 80, COLORS.accent2);

  addPageNum(s, 20);
  notes(s, 'Pi Lanningham is the de-facto teacher for this pattern.');
}

// ── Bonus + Close ──────────────────────────────────────────────────────────

function slide21_otherPatterns(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Beyond the Big Four');

  card(s, 'BEACON TOKENS',     ['Asset name encodes a discriminator.', 'Indexers query by name.'], 30, 75, 320, 75, COLORS.accent);
  card(s, 'REFERENCE SCRIPTS (CIP-33)', ['Deploy bytecode once.', 'Saves 10–20 KB per consuming tx.'], 370, 75, 320, 75, COLORS.ok);
  card(s, 'UTXO INDEXING',     ['Redeemer carries explicit indices.', 'Closes double-satisfaction holes.'], 30, 160, 320, 75, COLORS.gold);
  card(s, 'MERKLE-PATRICIA TRIE', ['Compress per-user state into', 'one root + inclusion proofs.'], 370, 160, 320, 75, COLORS.warn);
  card(s, 'FORWARDING POLICY', ['Mint policy delegates auth to', 'an existing validator.'], 30, 245, 320, 75, COLORS.eth);
  card(s, 'NFT-GATED ADMIN',   ['Authority by holding an admin NFT.', 'Transferable + multisig-able.'], 370, 245, 320, 75, COLORS.accent2);

  addPageNum(s, 21);
  notes(s, 'Honourable mentions. Each could be its own session.');
}

function slide22_doubleSatisfaction(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Security — Double-Satisfaction Attack');

  var b = addBody(s, [
    'A tx can invoke MANY validators. Each runs independently.',
    'If two validators each demand "an output of value V exists" — and both',
    'are satisfied by the SAME output — the user pays once but both validators',
    'think they were paid.',
    '',
    'Concrete attack:',
    '   Tx spends from S1 (owes Alice 100 ADA) and S2 (also owes 100 ADA)',
    '   Tx contains ONE 100 ADA output to Alice',
    '   Both validators see the output → both pass',
    '   Attacker steals 100 ADA',
    '',
    'Defences:',
    '   Index outputs explicitly via redeemer (UTXO indexing)',
    '   Tag outputs with input-specific data (e.g. carry the OutputReference)',
    '   Forbid validator running twice in one tx',
    '   Coordinate via a global stake validator (withdraw-zero)',
  ], {top: 75, size: 12});
  bold(b.getText(), ['MANY validators', 'SAME output', 'Attacker steals 100 ADA', 'Defences:']);
  color(b.getText(), ['Attacker steals 100 ADA'], COLORS.warn);

  addPageNum(s, 22);
  notes(s, 'Read the Plutonomicon double-satisfaction page in full.');
}

function slide23_cfTemplateRepo(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Cardano Foundation: 21-Use-Case Template Repo');

  var b = addBody(s, [
    'github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring',
    '',
    '21 small examples. Each implemented BOTH on-chain (Aiken / Scalus / Plu-ts)',
    'AND off-chain (MeshJS / Lucid / cardano-client-lib / CCL-Java).',
    '',
    'Why this repo is exceptional for learning:',
    '   one design pattern per example, in isolation',
    '   multiple language implementations side by side',
    '   maintained and reviewed by the Cardano Foundation',
    '',
    'Directory pattern:',
    '   /<use-case>/onchain/<aiken|scalus|plu-ts>/',
    '   /<use-case>/offchain/<meshjs|lucid|ccl>/',
    '',
    'Use it as: "show me ONE pattern in 50 lines of Aiken" reference material.',
  ], {top: 80});
  bold(b.getText(), [
    'github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring',
    'BOTH', 'AND off-chain', 'one design pattern per example',
  ]);

  addPageNum(s, 23);
  notes(s, 'Best bridge between "I learned Aiken" and "I want to read production code".');
}

function slide24_cfTemplateMapping(deck) {
  var s = newSlide(deck);
  addTitle(s, 'CF Examples → Our Patterns');

  card(s, 'ONE-SHOT NFT', [
    '/factory/        instances via seed UTXO',
    '/editable-nft/   collection ref NFTs',
    '/auction/        unique auction NFT',
  ], 30, 75, 320, 90, COLORS.accent);

  card(s, 'THREAD TOKEN + STATE MACHINE', [
    '/auction/    Bidding → Settled',
    '/crowdfund/  Open → Funded / Refunded',
    '/vesting/, /bet/, /escrow/, /htlc/',
  ], 370, 75, 320, 90, COLORS.ok);

  card(s, 'REFERENCE INPUTS / ORACLE', [
    '/pricebet/   oracle-conditional payout',
    '/lottery/    entropy as reference input',
    '/storage/    shared on-chain data',
  ], 30, 175, 320, 90, COLORS.gold);

  card(s, 'BATCHING / WITHDRAW-ZERO', [
    '/constant-product-amm/  batched fills',
    '/payment-splitter/      multi-output coord',
    '/atomic-transaction/    multi-step atomicity',
  ], 370, 175, 320, 90, COLORS.warn);

  card(s, 'OTHER PATTERNS WORTH READING', [
    '/vault/  /upgradable-proxy/  /decentralized-identity/  /anonymous-data/',
    '/simple-transfer/, /token-transfer/  — UTXO-model basics',
  ], 30, 280, 660, 60, COLORS.eth);

  addPageNum(s, 24);
  notes(s, 'Suggested reading order: simple-transfer → token-transfer → bet → auction → constant-product-amm.');
}

function slide25_decisionGuide(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Decision Guide — Which Pattern?');

  var b = addBody(s, [
    'I need a unique on-chain object',
    '   →   One-Shot NFT',
    '',
    'I need that object to evolve over time',
    '   →   Thread Token + Continuing Output + State Machine',
    '',
    'Many txs need to read shared data without contention',
    '   →   Reference Inputs (CIP-31), often combined with thread token',
    '',
    'A batch tx must validate many similar inputs cheaply',
    '   →   Withdraw-Zero Trick',
    '',
    'I need to enumerate all instances off-chain',
    '   →   Beacon Tokens',
    '',
    'My script runs often and is large',
    '   →   Reference Scripts (CIP-33)',
    '',
    'I need to track state for thousands of users in one UTXO',
    '   →   Merkle-Patricia trie',
  ], {top: 75, size: 12});

  addPageNum(s, 25);
  notes(s, 'Most architectural choices on Cardano are pattern-selection problems.');
}

function slide26_resources(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Resources');

  var b = addBody(s, [
    'Curated examples — start here:',
    '   github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring',
    '',
    'Pattern references:',
    '   github.com/Anastasia-Labs/aiken-design-patterns',
    '   github.com/Plutonomicon/plutonomicon',
    '   aiken-lang.org   +   github.com/aiken-lang/stdlib',
    '',
    'Production code (small → large):',
    '   github.com/fallen-icarus/cardano-loans       beacons + state machine',
    '   github.com/Anastasia-Labs/cip68-template     CIP-68 reference impl',
    '   github.com/Charli3-Official/oracle-design    oracle-as-ref-input',
    '   github.com/minswap/minswap-dex-v2            full DEX, withdraw-zero',
    '   github.com/SundaeSwap-finance/sundae-contracts  advanced batching',
    '',
    'CIPs:   31 (ref inputs)   32 (inline datums)   33 (ref scripts)',
    '        68 (NFT/FT/RFT metadata)   1694 (Conway governance)',
  ], {top: 75, size: 12});
  bold(b.getText(), ['Curated examples', 'Pattern references:', 'Production code', 'CIPs:']);

  addPageNum(s, 26);
  notes(s, 'Cardano Foundation template repo is the strongest entry point.');
}

function slide27_summary(deck) {
  var s = newSlide(deck);
  addTitle(s, 'Key Takeaways');

  var b = addBody(s, [
    'Cardano protocols re-apply a small vocabulary of established patterns.',
    '',
    'Core idea: identity by ASSET, not by address.',
    'A unique NFT is the stable pointer to evolving state.',
    '',
    'The four patterns we built today:',
    '   One-Shot NFT                     uniqueness via TxOutRef seed',
    '   Thread Token + State Machine     stable identity that evolves',
    '   Reference Inputs (CIP-31)        read shared data without contention',
    '   Withdraw-Zero Trick              cheap batched validation',
    '',
    'Always remember:',
    '   verify ADDRESS and THREAD NFT together when trusting external UTXOs',
    '   assert "exactly one continuing output" for state evolution',
    '   beware double-satisfaction when multiple validators run in one tx',
    '',
    'All demo code: validator-design-patterns/aiken/validators/',
    'Next: explore the 21 use cases at the Cardano Foundation template repo.',
  ], {top: 75, size: 12});
  bold(b.getText(), [
    'identity by ASSET, not by address',
    'four patterns',
    'Always remember:',
    'ADDRESS and THREAD NFT',
    'exactly one continuing output',
    'double-satisfaction',
  ]);

  addPageNum(s, 27);
  notes(s, 'Wrap-up: small vocabulary, big leverage. Build a mini-DEX as capstone.');
}
