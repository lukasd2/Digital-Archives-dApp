const Archives = artifacts.require("./Archives.sol");
const assert = require('chai').assert;
const should  = require('chai').should();

/*
- Part 2:
Test suite for events. Checking the effects of events execution on our contract state.
*/

contract('Archives', (accounts) => {
    const contractOwner = accounts[0]; //since the constructor is called at the deployment, we suppose the author address equal to the first ganache account (0x9Fb867de1eD00990FCFFefC7925846068561ef3C)
    const artworkName = 'Artwork Name';
    const descriptionHash = 'QmRDKiVKaEFxcEa5z9haS1fEhQbQriqYgNnAsHmgxM2de6';
    const mainPreviewHash = 'QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE';
    //Event publishArtwork, creation of a new object/artwork on blockchain
    it("it should publish an artwork ", function() {
        return Archives.deployed().then(function(instance) {
            artworkInstance = instance;
          return artworkInstance.publishArtwork(artworkName, descriptionHash, mainPreviewHash);
          //Event emitted, check receipt values (ouput)
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "LogSendArtw", "event should be LogSendArtw");
            assert.equal(receipt.logs[0].args._name, artworkName, "Event name must be " + artworkName);
            assert.equal(receipt.logs[0].args._descriptionHash, descriptionHash, "Event description hash must be " + descriptionHash);
            assert.equal(receipt.logs[0].args._data, mainPreviewHash, "Event main preview hash hash must be " + mainPreviewHash);
            return artworkInstance.getArtworks();
        }).then(function(artworkNumber) {
            assert.equal(artworkNumber[0], 1, 'Artwork with ID = 1');
            assert.equal(artworkNumber[1], 2, 'Artwork with ID = 2');
            assert.equal(artworkNumber[2], 3, 'Inserted Artwork with ID = 3');
            return artworkInstance.artworks(3);
        }).then((artwork) => {
            assert.equal(artwork[0], 3, "Contains the correct id");
            assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
            assert.equal(artwork[2], artworkName, "contains correct name");
            assert.equal(artwork[3], descriptionHash, "contains correct descriptionHash");
            assert.equal(artwork[4], mainPreviewHash, "contains correct dataHash");
            assert.equal(artwork[5], false, "contains validation field set to true");
            assert.equal(artwork[6], 0, "contains 0 votes count");
        });
    });

    //Event modifyArtworkDescription, modify of description (hash generated from IPFS) that can be done only by artwork's author
    it("it should modify an artwork ", function() {
        return Archives.deployed().then(function(instance) {
            artworkInstance = instance;
            id = 3;
            newDescriptionHash = '0x0';
            return artworkInstance.modifyArtworkDescription(id, newDescriptionHash, { from: contractOwner });
          //Event emitted, check receipt values (ouput)
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "artworkModify", "Event should be LogSendArtw");
            assert.equal(receipt.logs[0].args._id, id, "Artwork id must be" + id);
            assert.equal(receipt.logs[0].args._author, contractOwner, "Event sender must be" + contractOwner);
            return artworkInstance.artworks(id);
        }).then((artwork) => {
            assert.equal(artwork[0], 3, "Contains the correct id");
            assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
            assert.equal(artwork[2], artworkName, "contains correct name");
            assert.equal(artwork[3], newDescriptionHash, "contains correct descriptionHash");
            assert.equal(artwork[4], mainPreviewHash, "contains correct dataHash");
            assert.equal(artwork[5], false, "contains validation field set to true");
            assert.equal(artwork[6], 0, "contains 0 votes count");
            return artworkInstance.getArtworks();
        }).then(function(artworkNumber) {
            assert.equal(artworkNumber[0], 1, 'Artwork with ID = 1');
            assert.equal(artworkNumber[1], 2, 'Artwork with ID = 2');
            assert.equal(artworkNumber[2], 3, 'Inserted Artwork with ID = 3');
        });
    });
});