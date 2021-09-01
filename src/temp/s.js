
// more test data:
// address: 15spd3BbkCkKfV3DFJsont4xj9WUA6U5qr
// signature: ICoKLeD3vKrduUx0P
// message: 15spd3BbkCkKfV3DFJsont4xj9WUA6U5qr:1630369839:starRegistry

// electrum test (legacy?) wallet
// country weapon winner federal know agent sugar square rookie prize chaos axis

// electrum test wallet:
// passphrase: join ecology prize melt sausage social picnic detail street cheese achieve able
// password: udacwallet

// test address: bc1ql2v5f3h23478sytwrzt9pa2uvkzrkkxcln8er8
// message: bc1ql2v5f3h23478sytwrzt9pa2uvkzrkkxcln8er8:1629842934:starRegistry
// signed: IB9S2T+kr0/q+4408RmO6Sqjb+efGEYcxHiZQRcQoX0gEw/hp1Lt0megpbjlyzIP2DyEPmqtMCW6AZgjOgBonsA=


let bc = new Blockchain

let d1 = {'trx1':'first transaction in first block', 'trx2':'second transaction in firstblock'};
let b1 = new Block(d1)

bc._addBlock(b1)

bc.chain

let msg = ''

bc.requestMessageOwnershipVerification("bc1ql2v5f3h23478sytwrzt9pa2uvkzrkkxcln8er8").then(
    function(val) { console.log("okay"); console.log(val); msg = val; },
    function(err) { console.log("nokay"); }
);

//bc._addBlock("sldkfjsdlkj").then(function(val) { console.log("okay"); console.log(val); },function(err) { console.log("nokay"); });

bc._addBlock(new Block("{'trx': 'detail'}"))


bc.getBlockByHash("ecbeabab9fe1a9f39ce744e1301e59f1289bb4c2f901369dbdff1cbb79fc59f0").then(
    function(val) { console.log("found"); console.log(val); },
    function(err) { console.log("nokay"); }
);



