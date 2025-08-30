// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title FlamaBBToken
 * @dev ERC20 token for the FlamaBB social experiences platform
 * 
 * Features:
 * - Standard ERC20 functionality
 * - Burnable tokens for deflationary mechanics
 * - Pausable for emergency situations
 * - Permit functionality for gasless approvals
 * - Owned for controlled minting (if needed)
 */
contract FlamaBBToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    // Maximum supply to prevent infinite inflation
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev Constructor that mints initial supply to the deployer
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial supply to mint
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        _mint(msg.sender, initialSupply);
        emit TokensMinted(msg.sender, initialSupply);
    }
    
    /**
     * @dev Mints tokens to specified address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Pauses all token transfers
     * Only callable by owner for emergency situations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers
     * Only callable by owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Burns tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Burns tokens from specified account (with allowance)
     * @param account Account to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
    
    // Override required by Solidity for multiple inheritance
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}