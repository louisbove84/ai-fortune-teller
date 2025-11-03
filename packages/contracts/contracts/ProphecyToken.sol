// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProphecyToken
 * @dev ERC-721 NFT contract for AI Fortune Teller prophecies
 * Each NFT represents a user's career resilience assessment with updatable metadata
 */
contract ProphecyToken is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;
    uint256 public mintPrice;
    address public constant PROFIT_RECIPIENT = 0x3b583CA8953effcF2135679886A9965754954204;
    
    struct ProphecyData {
        uint256 resilienceScore;  // 0-100
        string occupation;
        uint256 timestamp;
        uint256 updateCount;      // Number of times updated after upskilling
        address recipient;
    }
    
    // Mapping from token ID to prophecy data
    mapping(uint256 => ProphecyData) public prophecies;
    
    // Events
    event ProphecyMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 resilienceScore,
        string occupation,
        string tokenURI
    );
    
    event ProphecyUpdated(
        uint256 indexed tokenId,
        uint256 newScore,
        string newTokenURI
    );
    
    constructor() ERC721("AI Fortune Prophecy", "PROPHECY") Ownable(msg.sender) {
        _nextTokenId = 1;
        mintPrice = 0.00001 ether; // Default mint price: 0.00001 ETH
    }
    
    /**
     * @dev Set the mint price (owner only)
     * @param _mintPrice New mint price in wei
     */
    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }
    
    /**
     * @dev Mint a new prophecy NFT (public - anyone can mint)
     * @param tokenURI IPFS URI containing the NFT metadata
     * @param score AI resilience score (0-100)
     * @param occupation User's occupation
     * @return tokenId The ID of the newly minted token
     */
    function mintProphecy(
        string memory tokenURI,
        uint256 score,
        string memory occupation
    ) public payable nonReentrant returns (uint256) {
        require(score <= 100, "Score must be <= 100");
        require(bytes(occupation).length > 0, "Occupation cannot be empty");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        // Send all mint price to profit recipient
        (bool success, ) = payable(PROFIT_RECIPIENT).call{value: mintPrice}("");
        require(success, "Transfer to profit recipient failed");
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            uint256 refund = msg.value - mintPrice;
            (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }
        
        address to = msg.sender; // Mint to the caller
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        prophecies[tokenId] = ProphecyData({
            resilienceScore: score,
            occupation: occupation,
            timestamp: block.timestamp,
            updateCount: 0,
            recipient: to
        });
        
        emit ProphecyMinted(to, tokenId, score, occupation, tokenURI);
        return tokenId;
    }
    
    /**
     * @dev Mint a new prophecy NFT (owner only - for backwards compatibility)
     * @param to Address to receive the NFT
     * @param tokenURI IPFS URI containing the NFT metadata
     * @param score AI resilience score (0-100)
     * @param occupation User's occupation
     * @return tokenId The ID of the newly minted token
     */
    function mintProphecyFor(
        address to,
        string memory tokenURI,
        uint256 score,
        string memory occupation
    ) public onlyOwner nonReentrant returns (uint256) {
        require(score <= 100, "Score must be <= 100");
        require(bytes(occupation).length > 0, "Occupation cannot be empty");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        prophecies[tokenId] = ProphecyData({
            resilienceScore: score,
            occupation: occupation,
            timestamp: block.timestamp,
            updateCount: 0,
            recipient: to
        });
        
        emit ProphecyMinted(to, tokenId, score, occupation, tokenURI);
        return tokenId;
    }
    
    /**
     * @dev Update an existing prophecy after user upskills
     * @param tokenId Token ID to update
     * @param newTokenURI New IPFS URI with updated metadata
     * @param newScore Updated resilience score
     */
    function updateProphecy(
        uint256 tokenId,
        string memory newTokenURI,
        uint256 newScore
    ) public onlyOwner nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(newScore <= 100, "Score must be <= 100");
        
        prophecies[tokenId].resilienceScore = newScore;
        prophecies[tokenId].updateCount++;
        _setTokenURI(tokenId, newTokenURI);
        
        emit ProphecyUpdated(tokenId, newScore, newTokenURI);
    }
    
    /**
     * @dev Get prophecy data for a token
     * @param tokenId Token ID to query
     * @return ProphecyData struct with all prophecy information
     */
    function getProphecy(uint256 tokenId) public view returns (ProphecyData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return prophecies[tokenId];
    }
    
    /**
     * @dev Get the current token counter
     * @return The next token ID that will be minted
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Optional: Uncomment to make NFTs soulbound (non-transferable)
    /*
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "Prophecy tokens are soulbound");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    */
}

