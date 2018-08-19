pragma solidity ^0.4.23;

contract Archives {

    //For more complex data types, Solidity provides: struct
    struct Artwork {
        uint id;
        address author;
        string name;
        string description;
        string dataHash;
    }

    //state variables
    mapping (uint => Artwork) public artworks; //automatically sets a getter
    //stores the total number of works submitted
    uint artworkCounter;
    //hash of the file on ipfs (encrypted location)
    string storeHash;

    //events 

    event LogSendArtw(
        uint indexed _id,
        address indexed _author,
        string _name,
        string _description,
        string _data
    );

    //publish an artwork
    function publishArtwork(string _name, string _description, string _dataHash) public {
        //new artw
        artworkCounter++;
        artworks[artworkCounter] = Artwork(
            artworkCounter,
            msg.sender,
            _name,
            _description,
            _dataHash
        );

        emit LogSendArtw(artworkCounter, msg.sender, _name, _description, _dataHash);
    }


    function set(string _x) public {
        storeHash = _x;
    }

    function get() public view returns (string) {
        return storeHash;
    }
    
    constructor() public  {
        addArtwork(1, 0x9Fb867de1eD00990FCFFefC7925846068561ef3C, "art1", "desc1", "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE");
        addArtwork(2, 0x9Fb867de1eD00990FCFFefC7925846068561ef3C, "art2", "desc2", "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE");
    }

    function addArtwork(uint _id, address _author, string _name, string _description, string _dataHash) public {
        artworkCounter++;
        artworks[artworkCounter] = Artwork (
            _id,
            _author,
            _name,
            _description,
            _dataHash
        );
    }

    //fetch the number of artworks in the contract 
    function getNumberOfArtworks() public view returns(uint) {
        return artworkCounter;
    }

    function getArtworks() public view returns(uint[]) {
        //prepare output array, it cannot contain more artworks than we have in the contract
        uint[] memory artwIds = new uint[](artworkCounter);
        uint numberOfArtw = 0;
        //iterate over artworks 
        for(uint i = 1; i <= artworkCounter; i++) {
            artwIds[numberOfArtw] = artworks[i].id;
            numberOfArtw++;
        }
        //copy the artworks Ids array into smaller displayArt array
        uint[] memory displayArt = new uint[](numberOfArtw);
        for(uint j = 0; j < numberOfArtw; j++) {
            displayArt[j] = artwIds[j];
        }
        return displayArt;
    }

   

}