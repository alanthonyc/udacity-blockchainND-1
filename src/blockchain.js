/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
        console.log("blockchain created:");
        console.log(this);
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this; // `this` is the blockchain, not the block
        return new Promise(async (resolve, reject) => {
            let error = false;
            // 0 - check for genesis block (height == 0)
            if (self.height == -1) { // Genesis Block
                block.height = 0;
                // previousBlockHash is null
    
            } else { // Append New Block
                block.height = self.height + 1;
                block.previousBlockHash = self.chain[self.height].hash;
            }
            console.log(`adding block, body:\n${block.body}`);
            block.hash = SHA256(JSON.stringify(block.body)).toString();
            block.time = new Date().getTime().toString().slice(0,-3);
            self.chain[self.chain.length] = block;
            self.height = block.height;
            if (error) {
                reject();
            } else {
                resolve(block);
            }
            //let data = JSON.parse(block).data;
            // 1 - assign block height
            // 2 - assign timestamp
            // 3 - assign previousBlockHash
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            let time = new Date().getTime().toString().slice(0,-3);
            let message = address + `:${new Date().getTime().toString().slice(0,-3)}` + ":starRegistry";
            resolve(message);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            let error = false;
            let errMessage = "";
            let msg_time = parseInt(message.split(':')[1]);
            let current_time = parseInt(new Date().getTime().toString().slice(0, -3));
            let elapsed_time = current_time - msg_time;
            if (elapsed_time > 3000000000) {
                error = true;
                errMessage = "Timeout";
                reject(errMessage);
            } else {
                if (bitcoinMessage.verify(message, address, signature)) {
                    let starData = {
                        "message":`${message}`,
                        "address":`${address}`,
                        "signature":`${signature}`,
                        "star": {
                            "dec": star.dec,
                            "ra": star.ra,
                            "story": star.story
                        }
                    };
                    let block = new BlockClass.Block(starData);
                    self._addBlock(block);
                    console.log(`Adding block: ${self.height}`);
                    resolve(block);
                    console.log(block);
                } else {
                    errMessage = "Message failed verification.";
                    reject(errMessage);
                }
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let error = false;
            let height = self.height;
            let block = self.chain[height];
            let found = false;
            console.log(`getting block by hash:\n${hash}`);
            for (;height >= 0 && !found;) {
                console.log(`block #${height}`);
                if (hash === block.hash) {
                    found = true;
                } else {
                    height -= 1;
                    block = self.chain[height];
                }
            }
            console.log('tried all blocks');
            self.validateChain();//temp
            if (!error && found) {
                resolve(block);
            } else {
                resolve(false);
            };
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            let error = false;
            let height = self.height;
            let block = self.chain[height];
            let found = false;
            console.log(`getting stars by wallet: ${address}`);
            for (;height > 0;) {
                let decoded_body = hex2ascii(block.body);
                let body_data = JSON.parse(decoded_body);
                let body_wallet = body_data.address;
                if (body_wallet === address) {
                    stars[stars.length] = block;
                };
                height -= 1;
                block = self.chain[height];
            }
            if (!error) {
                resolve(stars);
            } else {
                reject("Error retrieving stars.");
            };
            
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            let error = false;
            let height = self.height;
            let block = self.chain[height];
            console.log('validating blockchain');
            for (const b of self.chain.reverse()) {
                console.log(`validating: ${b.height}`);
                await b.validate().then (
                    function(val) { 
                        console.log('okay')
                        errorLog[errorLog.length] = b.height;
                    },
                    function(err) { console.log('nokay')}
                );
                console.log(errorLog);
            }
            console.log(self.chain);
            resolve();
        });
    }

}

module.exports.Blockchain = Blockchain;   
