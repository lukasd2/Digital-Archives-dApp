const Archives = artifacts.require("./Archives.sol");
const assert = require('chai').assert;
const should  = require('chai').should();

/*
- Part 3:
Test suite for unwanted actions. Example...
*/

contract('Archives', (accounts) => {
    it('it should not contain third artwork', () => {
        return Archives.deployed().then((instance) => {
            return instance.getArtworks(); // if constructor is set to insert two artworks, this function should return exactly those two 
        }).then((artworkNumber) => {
            should.not.exist(artworkNumber[2], 3, 'Article three'); //constructor sets two artworks starting from index 0. Therefore, artwork at index 2 should not exist
 //constructor sets two artworks starting from index 0. Therefore, artwork at index 2 should not exist
        });
    });
});