pragma experimental ABIEncoderV2;
pragma solidity >=0.4.25 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract SupplyChain is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _txnIds;
    Counters.Counter private _paramIds;
    Counters.Counter private _userIds;
    struct Product {
        uint productId;
        string name;
        string origin;
        uint productionDate;
        address supplier;
        address manufacturer;
        address distributor;
        address pharmacy;
        address user;
        string nftId;
        string rawMaterialInfo;
        string certifications;
        string productDescription;
    }

    struct Parameters {
        uint productId;
        string location;
        uint timestamp;
        uint temperature;
        uint humidity;
        string recordedBy; 
    }

    struct User {
        address userAddress;
        string name;
        string password;
        string userType;
    }

    mapping (uint => Product) products;
    mapping (uint => Parameters) parameters;
    mapping (uint => User) users;
    mapping (address => uint) balances;
    event LogMessage(string message);
    constructor() ERC721("ProductNFT", "PNFT") {}

    function createProduct(string memory _name, string memory _origin, uint _productionDate, string memory _rawMaterialInfo, string memory _certifications, string memory _productDescription, string memory location, uint timestamp, uint temperature, uint humidity, address supplier, string memory _nftId) public {
        uint newItemId = _tokenIds.current();
        products[newItemId] = Product(newItemId, _name, _origin, _productionDate, supplier, msg.sender, address(0), address(0), address(0), _nftId, _rawMaterialInfo, _certifications, _productDescription);
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, "https://localhost:5500/nft/");
        _tokenIds.increment();
        uint newParamId = _paramIds.current();
        parameters[newParamId] = Parameters(newItemId, location, timestamp, temperature, humidity, "manufacturer");
        _paramIds.increment();
    }

    function verifyLogin(address _userAddress, string memory _password, string memory _userType) public view returns (bool) {
        for (uint i = 0; i < _userIds.current(); i++) {
            if (keccak256(bytes(users[i].userType)) == keccak256(bytes(_userType)) && users[i].userAddress == _userAddress && keccak256(bytes(users[i].password)) == keccak256(bytes(_password))){
                return true;
            }
        }
        return false;
    }

    function getProductDetails(uint _productId) public view returns (Product memory) {
        return products[_productId];
    }

    function getParameterDetails(uint _productId, string memory recorded) public view returns (Parameters memory) {
        for (uint i = 0; i < _paramIds.current(); i++) {
            if(parameters[i].productId == _productId && keccak256(bytes(parameters[i].recordedBy)) == keccak256(bytes(recorded))) {
                return parameters[i];
            }
        }
        return parameters[0];
    }

    function getUserDetails(address _userAddress) public view returns (User memory) {
        for (uint i = 0; i < _userIds.current(); i++) {
            if(users[i].userAddress == _userAddress) {
                return users[i];
            }
        }
        return users[0];
    }




    function createUser(address _userAddress, string memory _name, string memory password, string memory userType) public {
        _userIds.increment();
        uint newUserId = _userIds.current();
        users[newUserId] = User(_userAddress, _name, password, userType);
    }


    function updateProductParameters(uint _productId, string memory _location, uint _timestamp, uint _temperature, uint _humidity, string memory updatedBy) public {
        require(msg.sender == products[_productId].manufacturer || msg.sender == products[_productId].distributor || msg.sender == products[_productId].pharmacy || msg.sender == products[_productId].user, "Only manufacturer, distributor, pharmacy and user can update temperature information");
                _paramIds.increment();
        uint newParamId = _paramIds.current();
        parameters[newParamId] = Parameters(_productId, _location, _timestamp, _temperature, _humidity, updatedBy);
    }

    function getProductsOfUser(address user) public view returns (string memory) {
        string memory items;
        for (uint i = 0; i < _tokenIds.current(); i++) {
            if (checkNFTOwner(i) == user) {
                items = string(abi.encodePacked(items, Strings.toString(i),":" , products[i].name, ","));
            }
        }
        return items;
    }

    function checkNFTOwner(uint256 _tokenId) public view returns (address) {
        address owner = ownerOf(_tokenId);
        return owner;
    }

    function transferProductOwnership(uint _productId, address _to) public {
        require(msg.sender == checkNFTOwner(_productId), "You are not the owner of this product");
        require(msg.sender != _to, "You cannot transfer product to yourself");
        safeTransferFrom(msg.sender, _to, _productId);
    }
}
