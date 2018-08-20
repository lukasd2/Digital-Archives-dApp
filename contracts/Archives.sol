pragma solidity ^0.4.24;


import "./Whitelist.sol";

contract Archives is Whitelist {

    //For more complex data types, Solidity provides: struct
    struct Artwork {
        uint id;
        address author;
        string name;
        string description;
        string dataHash;
        bool validation;
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
        string _data,
        bool validation
    );

    event ValidateArtw(
        uint indexed _id,
        address indexed _author
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
            _dataHash,
            false
        );

        emit LogSendArtw(artworkCounter, msg.sender, _name, _description, _dataHash, false);
    }


    function set(string _x) public {
        storeHash = _x;
    }

    function get() public view returns (string) {
        return storeHash;
    }
    
    constructor() public  {
        addArtwork(1, 0x9Fb867de1eD00990FCFFefC7925846068561ef3C, "Opera d'arte minore 1", "Descrizione dell'opera", "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE", false);
        addArtwork(2, 0x9Fb867de1eD00990FCFFefC7925846068561ef3C, "Immagine creata da Tizio", "Voglio preservare questa immagine sulla blockchain...", "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE", false);
    }

    function test() onlyIfWhitelisted(msg.sender) public {
        addArtwork(3, 0x9Fb867de1eD00990FCFFefC7925846068561ef3C, "esempio3", "descrizione esempio 3", "QmVFCTESBiwPExSBYkA5EKLQ1MHWKYG2UuHSxZAWoQHLhE", true);
    }

    function addArtwork(uint _id, address _author, string _name, string _description, string _dataHash, bool _validation) public {
        artworkCounter++;
        artworks[artworkCounter] = Artwork (
            _id,
            _author,
            _name,
            _description,
            _dataHash,
            _validation
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

    function approveArtwork(uint _id) onlyIfWhitelisted(msg.sender) public {
        artworks[_id].validation = true;
        emit ValidateArtw(_id, msg.sender);
    }
}