// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProphecyToken
 * @dev ERC-721 NFT contract for AI Fortune Teller "Retirement Prophecy" tokens
 * Features updatable metadata to track user's resilience journey
 */
contract ProphecyToken is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to prophecy data
    mapping(uint256 => ProphecyData) public prophecies;

    struct ProphecyData {
        uint256 resilienceScore;
        string occupation;
        uint256 timestamp;
        uint256 updateCount;
        address recipient;
    }

    event ProphecyMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 resilienceScore,
        string occupation
    );

    event ProphecyUpdated(
        uint256 indexed tokenId,
        uint256 newScore,
        uint256 updateCount
    );

    constructor() ERC721("AI Fortune Prophecy", "PROPHECY") Ownable(msg.sender) {}

    /**
     * @dev Mint a new prophecy NFT
     * @param recipient Address to receive the NFT
     * @param tokenURI IPFS URI for metadata
     * @param resilienceScore Initial AI resilience score (0-100)
     * @param occupation User's occupation
     * @return tokenId The ID of the newly minted token
     */
    function mintProphecy(
        address recipient,
        string memory tokenURI,
        uint256 resilienceScore,
        string memory occupation
    ) public onlyOwner returns (uint256) {
        require(resilienceScore <= 100, "Score must be 0-100");
        require(bytes(occupation).length > 0, "Occupation required");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        prophecies[newTokenId] = ProphecyData({
            resilienceScore: resilienceScore,
            occupation: occupation,
            timestamp: block.timestamp,
            updateCount: 0,
            recipient: recipient
        });

        emit ProphecyMinted(newTokenId, recipient, resilienceScore, occupation);

        return newTokenId;
    }

    /**
     * @dev Update prophecy metadata after user upskills
     * @param tokenId Token to update
     * @param newTokenURI New IPFS URI with updated metadata
     * @param newScore Updated resilience score
     */
    function updateProphecy(
        uint256 tokenId,
        string memory newTokenURI,
        uint256 newScore
    ) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        require(newScore <= 100, "Score must be 0-100");
        require(newScore > prophecies[tokenId].resilienceScore, "Score must increase");

        _setTokenURI(tokenId, newTokenURI);
        
        prophecies[tokenId].resilienceScore = newScore;
        prophecies[tokenId].updateCount++;

        emit ProphecyUpdated(tokenId, newScore, prophecies[tokenId].updateCount);
    }

    /**
     * @dev Get prophecy data for a token
     * @param tokenId Token to query
     * @return ProphecyData struct with token details
     */
    function getProphecy(uint256 tokenId) public view returns (ProphecyData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return prophecies[tokenId];
    }

    /**
     * @dev Get total number of minted prophecies
     * @return Total token count
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Override to prevent transfers (soulbound option - can be removed if transferability desired)
     * Uncomment to make tokens soulbound
     */
    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) internal virtual override {
    //     require(from == address(0), "Prophecy tokens are soulbound");
    //     super._beforeTokenTransfer(from, to, tokenId);
    // }
}

