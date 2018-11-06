const Archives = artifacts.require("./Archives.sol");
const assert = require('chai').assert;
const should = require('chai').should();

/*
- Part 2:
Test suite for events. Checking the effects of events execution on our contract state.
*/

contract('Archives', (accounts) => {
    const contractOwner = accounts[0]; //since the constructor is called at the deployment, we suppose the author address equal to the first ganache account (0x9Fb867de1eD00990FCFFefC7925846068561ef3C)
    const artworkName = 'Artwork Name';
    const descriptionHash = 'QmRDKiVKaEFxcEa5z9haS1fEhQbQriqYgNnAsHmgxM2de6';
    const mainPreviewHash = 'QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE';
    const accountToWhitelist = accounts[1]; //used to add permissions of artworkChecker
    const artworkCheckerRole = "artworkChecker";
    //Event publishArtwork, creation of a new object/artwork on blockchain
    it("it should publish an artwork ", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.publishArtwork(artworkName, descriptionHash, mainPreviewHash);
            //Event emitted, check receipt values (ouput)
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "LogSendArtw", "event should be LogSendArtw");
            assert.equal(receipt.logs[0].args._name, artworkName, "Event name must be " + artworkName);
            assert.equal(receipt.logs[0].args._descriptionHash, descriptionHash, "Event description hash must be " + descriptionHash);
            assert.equal(receipt.logs[0].args._data, mainPreviewHash, "Event main preview hash hash must be " + mainPreviewHash);
            return artworkInstance.getArtworks();
        }).then((artworkNumber) => {
            assert.equal(artworkNumber[0], 1, 'Artwork with ID = 1');
            assert.equal(artworkNumber[1], 2, 'Artwork with ID = 2');
            assert.equal(artworkNumber[2], 3, 'Artwork with ID = 3');
            assert.equal(artworkNumber[3], 4, 'Inserted Artwork with ID = 4');
            return artworkInstance.artworks(4);
        }).then((artwork) => {
            assert.equal(artwork[0], 4, "Contains the correct id");
            assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
            assert.equal(artwork[2], artworkName, "contains correct name");
            assert.equal(artwork[3], descriptionHash, "contains correct descriptionHash");
            assert.equal(artwork[4], mainPreviewHash, "contains correct mainPreviewHash");
            assert.equal(artwork[5], false, "contains validation field set to true");
            assert.equal(artwork[6], 0, "contains 0 votes count");
        });
    });

    //Event modifyArtworkDescription, modify of description (hash generated from IPFS) that can be done only by artwork's author
    it("it should modify an artwork", () => {
        return Archives.deployed().then(function (instance) {
            artworkInstance = instance;
            id = 4;
            newDescriptionHash = '0x0';
            return artworkInstance.modifyArtworkDescription(id, newDescriptionHash, { from: contractOwner });
            //Event emitted, check receipt values (ouput)
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "artworkModify", "Event should be LogSendArtw");
            assert.equal(receipt.logs[0].args._id, id, "Artwork id must be" + id);
            assert.equal(receipt.logs[0].args._author, contractOwner, "Event sender must be" + contractOwner);
            return artworkInstance.artworks(id);
        }).then((artwork) => {
            assert.equal(artwork[0], 4, "Contains the correct id");
            assert.equal(artwork[1], contractOwner, "contains the correct author, equale to contract owner");
            assert.equal(artwork[2], artworkName, "contains correct name");
            assert.equal(artwork[3], newDescriptionHash, "contains correct descriptionHash");
            assert.equal(artwork[4], mainPreviewHash, "contains correct mainPreviewHash");
            assert.equal(artwork[5], false, "contains validation field set to true");
            assert.equal(artwork[6], 0, "contains 0 votes count");
            return artworkInstance.getArtworks();
        }).then((artworkNumber) => {
            assert.equal(artworkNumber[0], 1, 'Artwork with ID = 1');
            assert.equal(artworkNumber[1], 2, 'Artwork with ID = 2');
            assert.equal(artworkNumber[2], 3, 'Inserted Artwork with ID = 3');
        });
    });
    //An owner should be able to add an address to the whitelist with artwork checker permissions
    it("it should add an artworkChecker", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.addAddressToWhitelist(accountToWhitelist, { from: contractOwner });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "RoleAdded", "Event should be RoleAdded");
            assert.equal(receipt.logs[0].args.operator, accountToWhitelist, "Operator address must be " + accountToWhitelist);
            assert.equal(receipt.logs[0].args.role, artworkCheckerRole, "Operator role must be " + artworkCheckerRole);
            return artworkInstance.whitelist(accountToWhitelist);
        }).then((bool) => {
            assert.equal(bool, true, accountToWhitelist + "is on the whitelist");
        });
    });
    //Artwork checkers should be able to cast votes
    it("it should allow for artworkCheckers to vote", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.approveArtwork(2, { from: accountToWhitelist });
        }).then(() => {
            //assert.equal(accountToWhitelist.myVotes.length, 1, "contains validation field set to true");
            return artworkInstance.artworks(2);
        }).then((artwork) => {
            assert.equal(artwork[5], false, "Contains the correct id");
            assert.equal(artwork[6], 1, "contains 1 votes count");
        });
    });

    it("it should add a second artworkChecker", () => {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            return artworkInstance.addAddressToWhitelist(accounts[2], { from: contractOwner });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, "One event should have been triggered");
            assert.equal(receipt.logs[0].event, "RoleAdded", "Event should be RoleAdded");
            assert.equal(receipt.logs[0].args.operator, accounts[2], "Operator address must be " + accountToWhitelist);
            assert.equal(receipt.logs[0].args.role, artworkCheckerRole, "Operator role must be " + artworkCheckerRole);
            return artworkInstance.whitelist(accounts[2]);
        }).then((bool) => {
            assert.equal(bool, true, accounts[2] + "is on the whitelist");
        });
    });
    //We assume that an artwork is "validated" if votesNum >= 2
    it("it should allow to vote and approve the artwork", function () {
        return Archives.deployed().then((instance) => {
            artworkInstance = instance;
            votedId = 2;
            return artworkInstance.approveArtwork(votedId, { from: accounts[2] });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, "ValidateArtw should have been triggered once");
            assert.equal(receipt.logs[0].event, "ValidateArtw", "Event should be ValidateArtw");
            assert.equal(receipt.logs[0].args._id, votedId, "Approved artwork must be " + votedId);
            assert.equal(receipt.logs[0].args._author, accounts[2], "Final vote from " + accounts[1]);
            return artworkInstance.artworks(votedId);
        }).then((artwork) => {
            assert.equal(artwork[5], true, "Contains the correct id");
            assert.equal(artwork[6], 2, "contains 2 votes count");
        });
    });
});