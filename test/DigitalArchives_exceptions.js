const Archives = artifacts.require("./Archives.sol");
const assert = require('chai').assert;
const should  = require('chai').should();

/*
- Part 3:
    Test suite for unwanted actions, edge cases etc.
*/

contract('Archives', (accounts) => {
    const contractOwner = accounts[0]; 
    const unauthorizedAccount = accounts[4]; // Account used to test for edge cases 
    const accountToWhitelist = accounts[1];

    it('it should not contain third artwork', () => {
        return Archives.deployed().then((artworkInstance) => {
            return artworkInstance.getArtworks(); // if constructor is set to insert two artworks, this function should return exactly those two 
        }).then((artworkNumber) => {
            should.not.exist(artworkNumber[2], 3, 'Article three'); //constructor sets two artworks starting from index 0. Therefore, artwork at index 2 should not exist
 //constructor sets two artworks starting from index 0. Therefore, artwork at index 2 should not exist
        });
    });
    
    //Testing for unauthorized edits
    it('it should throw an exception if you try to modify the description of an artwork you do not own', () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            idToModify = 2; //artwork id made by a different account
            newDescriptionHash = '0x0';
            return artworkInstance.modifyArtworkDescription(idToModify, newDescriptionHash, { from: unauthorizedAccount });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert"); //error produced should be: "VM Exception while processing transaction: revert"
            //console.log(error.message);
            return artworkInstance.artworks(idToModify);
        }).then((artwork) => {
          assert.equal(artwork[0], 2, "contains the correct id");
          assert.equal(artwork[1], contractOwner, "contains the correct author, equal to contract owner");
          assert.equal(artwork[3], "QmRDKiVKaEFxcEa5z9haS1fEhQbQriqYgNnAsHmgxM2de6", "contains the same descriptionHash");
        });
    });

    it('it should throw an exception if you try to modify the description of an artwork that does not exist', () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            idToModify = 4; //artwork id made by a different account
            newDescriptionHash = '0x0';
            return artworkInstance.modifyArtworkDescription(idToModify, newDescriptionHash, { from: unauthorizedAccount });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert"); //error produced should be: "VM Exception while processing transaction: revert"
        });
    });

    //Only contract owner should be able to add accounts on whitelist
    it("it should not add an artworkChecker if called by an account address not equal to contract owner address", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.addAddressToWhitelist(accountToWhitelist, { from: unauthorizedAccount });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return artworkInstance.whitelist(accountToWhitelist);
        }).then((bool) => {
            assert.equal(bool, false, accountToWhitelist + " should not be on the whitelist"); //was added by an unauthorized account. Therefore, revert.
        });
    });

    //Account can't vote (approve) if not on whitelist
    it("it should not allow accounts that are not on whitelist to vote (approve)", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.approveArtwork(2, { from: accountToWhitelist });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return artworkInstance.artworks(2);
        }).then((artwork) => {
            assert.equal(artwork[5], false, "Contains validation status == false");
            assert.equal(artwork[6], 0, "contains 0 votes count");
        });
    });

    //Artwork checkers can't cast double votes on the same artwork 
    it("it should not allow artworkCheckers to vote more than once for the same artwork", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            artworkChecker = accounts[2]
            return artworkInstance.addAddressToWhitelist(artworkChecker, { from: contractOwner });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "RoleAdded", "Event should be RoleAdded");
            assert.equal(receipt.logs[0].args.operator, artworkChecker, "Operator address must be " + artworkChecker);
            assert.equal(receipt.logs[0].args.role, 'artworkChecker', "Operator role must be = artworkChecker");
            return artworkInstance.whitelist(artworkChecker);
        }).then((bool) => {
            assert.equal(bool, true, artworkChecker + "is on the whitelist");
            return artworkInstance.approveArtwork(2, { from: artworkChecker });
        }).then(() => {
            return artworkInstance.artworks(2);
        }).then((artwork) => {
            assert.equal(artwork[5], false, "Contains the correct id");
            assert.equal(artwork[6], 1, "contains 1 votes count"); //first vote counted properly
            return artworkInstance.approveArtwork(2, { from: artworkChecker });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return artworkInstance.artworks(2);
        }).then((artwork) => {
            assert.equal(artwork[5], false, "Contains validation status == false");
            assert.equal(artwork[6], 1, "contains 1 votes count"); //from previous valid vote which was authorized 
        });
    });

    it("it should not allow artworkCheckers to vote on Artworks that have already been approved", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.approveArtwork(1, { from: artworkChecker });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return artworkInstance.artworks(1);
        }).then((artwork) => {
            assert.equal(artwork[5], true, "Contains validation status == true");
            assert.equal(artwork[6], 2, "contains 2 votes count");
        });
    });

});