const Archives = artifacts.require("./Archives.sol");
const assert = require('chai').assert;
const should  = require('chai').should();

/* 
- Part 1:
Test suite for inital contract state. Checking default values and expect behaviors at contract deployment before any action 
or transaction took place (a part from constructor). This is the definition of smart contract base state. 
*/

contract('Archives', (accounts) => {
    const contractOwner = accounts[0]; //since the constructor is called at the deployment, we suppose the author address equal to the first ganache account (e.g. 0x9Fb867de1eD00990FCFFefC7925846068561ef3C)
    
    it('it should be initialized with three artworks from constructor', () => {
        return Archives.deployed().then((instance) => {
            return instance.getArtworks(); // if constructor is set to insert two artworks, this function should return exactly those two 
        }).then((artworkNumber) => {
            assert.equal(artworkNumber[0], 1, 'Article with ID = 1');
            assert.equal(artworkNumber[1], 2, 'Article with ID = 2');
            assert.equal(artworkNumber[2], 3, 'Article with ID = 3');
            should.not.exist(artworkNumber[3], 4, 'Fourth article'); //constructor sets two artworks starting from index 0. Therefore, artwork at index 2 should not exist
        });
    });

    it("it initializes the artworks with correct values", () => {
        return Archives.deployed().then((instance) => {
          artworkInstance = instance;
          return artworkInstance.artworks(1);
        }).then((artwork) => {
          assert.equal(artwork[0], 1, "Contains the correct id");
          assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
          assert.equal(artwork[2], "Opera d'arte minore approvata", "contains correct name");
          assert.equal(artwork[3], "QmRDKiVKaEFxcEa5z9haS1fEhQbQriqYgNnAsHmgxM2de6", "contains correct descriptionHash");
          assert.equal(artwork[4], "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE", "contains correct mainPreviewHash");
          assert.equal(artwork[5], true, "contains validation field set to true");
          assert.equal(artwork[6], 2, "contains 2 votes count");
          return artworkInstance.artworks(2);
        }).then((artwork) => {
          assert.equal(artwork[0], 2, "contains the correct id");
          assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
          assert.equal(artwork[2], "Opera d'arte scultura", "contains the correct name");
          assert.equal(artwork[3], "QmRDKiVKaEFxcEa5z9haS1fEhQbQriqYgNnAsHmgxM2de6", "contains correct descriptionHash");
          assert.equal(artwork[4], "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE", "contains correct mainPreviewHash");
          assert.equal(artwork[5], false, "contains validation field set to false");
          assert.equal(artwork[6], 0, "contains 0 votes count");
          return artworkInstance.artworks(3);
        }).then((artwork) => {
            assert.equal(artwork[0], 3, "contains the correct id");
            assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
            assert.equal(artwork[2], "Opera d'arte scultura", "contains the correct name");
            assert.equal(artwork[3], "QmRDKiVKaEFxcEa5z9haS1fEhQbQriqYgNnAsHmgxM2de6", "contains correct descriptionHash");
            assert.equal(artwork[4], "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE", "contains correct mainPreviewHash");
            assert.equal(artwork[5], false, "contains validation field set to false");
            assert.equal(artwork[6], 0, "contains 0 votes count");
          });
      });

      it("it should contain exactly three artworks at first deployment", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.getNumberOfArtworks();
        }).then((number) => {
            assert.equal(number, 3, "Three artworks are initialized at deployment");
        });
      });
      //Owner contract address check
      it("it should have an owner equal to accounts[0] by default", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.owner();
        }).then((address) => {
            assert.equal(address, contractOwner, "Owner account");
        });
      });

      it("it should have one role on whitelist named artworkChecker", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.ROLE_WHITELISTED();
        }).then((name) => {
            assert.equal(name, "artworkChecker", "One role (artworkChecker) is implemented on the contract whitelist");
        });
      });

      it("it should not have contractOwner account address on whitelist", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.whitelist(contractOwner);
        }).then((boolean) => {
            assert.equal(boolean, false, "Contract owner should not be on whitelist");
        });
      });
});