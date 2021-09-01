
const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');
const bitcoinMessage = require('bitcoinjs-message');

class Block {

    // Constructor - argument data will be the object containing the transaction data
	constructor(data){
        console.log('\n\n=======');
        console.log('building a block:');
        console.log(data);
        console.log('-------');
        console.log(data.data);
        console.log('-------');
        console.log(JSON.stringify(data));
        console.log('-------');
        console.log(JSON.stringify(data).toString());
        console.log('-------');
        console.log(JSON.stringify(data).toString('hex'));
        console.log('=======');
		this.hash = null;                                           // Hash of the block
		this.height = 0;                                            // Block Height (consecutive number of each block)
		this.body = Buffer.from(JSON.stringify(data)).toString('hex');   // Will contain the transactions stored in the block, by default it will encode the data
        console.log(this.body);
		this.time = 0;                                              // Timestamp for the Block creation
		this.previousBlockHash = null;                              // Reference to the previous Block Hash
    }

    /**
     *  validate() method will validate if the block has been tampered or not.
     *  Been tampered means that someone from outside the application tried to change
     *  values in the block data as a consecuence the hash of the block should be different.
     *  Steps:
     *  1. Return a new promise to allow the method be called asynchronous.
     *  2. Save the in auxiliary variable the current hash of the block (`this` represent the block object)
     *  3. Recalculate the hash of the entire block (Use SHA256 from crypto-js library)
     *  4. Compare if the auxiliary hash value is different from the calculated one.
     *  5. Resolve true or false depending if it is valid or not.
     *  Note: to access the class values inside a Promise code you need to create an auxiliary value `let self = this;`
     */
    validate() {
        let self = this;
        return new Promise((resolve, reject) => {
            // Save in auxiliary variable the current block hash
            let current_hash = self.hash;
                                            
            // Recalculate the hash of the Block
            recalculated_hash = SHA256(JSON.stringify(self.body)).toString();

            // Comparing if the hashes changed
            if (current_hash === recalculated_hash) {
                // Returning the Block is not valid
                resolve(true);
            } else {
                // Returning the Block is valid
                resolve(false);
            }
        });
    }

    /**
     *  Auxiliary Method to return the block body (decoding the data)
     *  Steps:
     *  
     *  1. Use hex2ascii module to decode the data
     *  2. Because data is a javascript object use JSON.parse(string) to get the Javascript Object
     *  3. Resolve with the data and make sure that you don't need to return the data for the `genesis block` 
     *     or Reject with an error.
     */
    getBData() { // Getting the encoded data saved in the Block
        let self = this;
        return new Promise((resolve, reject) => {
            // Decoding the data to retrieve the JSON representation of the object
            console.log("decoding:");
            console.log(self.body);
            let decoded_body = hex2ascii(self.body);
            console.log(decoded_body);
            let body_data = JSON.parse(decoded_body).data;
            console.log(body_data);
            resolve(body_data);
            // Parse the data to an object to be retrieve.
            // Resolve with the data if the object isn't the Genesis block
        });
    }

}

module.exports.Block = Block;                    // Exposing the Block class as a module


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
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new Block({data: 'Genesis Block'});
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
        let self = this;
        return new Promise(async (resolve, reject) => {
            let error = false;
            // 0 - check for genesis block (height == -1 or 'Genesis Block')
            if (self.height == -1) { // Genesis Block
                block.height = 0;
                // previousBlockHash is null
    
            } else { // Append New Block
                block.height = self.height + 1;
                block.previousBlockHash = self.chain[self.height].hash;
            }
            console.log('hashing body:');
            console.log(block.body);
            block.hash = SHA256(JSON.stringify(block.body)).toString();
            block.time = new Date().getTime().toString().slice(0,-3);
            self.chain[self.chain.length] = block;
            self.height = block.height;
            if (error) {
                reject();
            } else {
                resolve(block);
            }
        });
    }

    _scratchFunction(block) {

            // 1 - assign block height
            // 2 - assign timestamp
            // 3 - assign previousBlockHash
            let error = false;
            let body_data = "";
            block.getBData().then(
                function(value) {
                   console.log("bdata success");
                    body_data = value;
                    resolve(body_data);
                },
                function(error) {
                    console.log("bdata error");
                    reject();
                }
            );
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
            let msg_time = parseInt(message.split(':')[1]);
            let current_time = parseInt(new Date().getTime().toString().slice(0, -3));
            let elapsed_time = current_time - msg_time;
            console.log("submitStar time verification");
            console.log(msg_time);
            console.log(current_time);
            console.log(elapsed_time);
            resolve("okay");
            bitcoinMessage.verify(message, address, signature);
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
            for (;height >= 0 && !found;) {
                if (hash === block.hash) {
                    found = true;
                } else {
                    height -= 1;
                    block = self.chain[height];
                }
            }
            if (!error && found) {
                console.log('found');
                console.log(hex2ascii(block.body));
                resolve(block.hash);
            } else {
                reject("not found");
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
            
        });
    }

}

module.exports.Blockchain = Blockchain;   
