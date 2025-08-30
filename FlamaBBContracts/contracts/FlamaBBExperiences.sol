// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FlamaBBExperiences
 * @dev Smart contract for managing local experiences on the FlamaBB platform
 * 
 * Features:
 * - Experience creation and management
 * - Booking system with payment handling
 * - Rating and review system
 * - Host verification and reputation
 */
contract FlamaBBExperiences is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    // State variables
    IERC20 public immutable flamaToken;
    uint256 public platformFeePercent = 500; // 5% platform fee (500 basis points)
    uint256 public constant MAX_FEE_PERCENT = 1000; // 10% max fee
    uint256 public experienceCounter;
    uint256 public bookingCounter;
    
    // Experience structure
    struct Experience {
        uint256 id;
        address host;
        string title;
        string description;
        string location;
        string imageUrl;
        uint256 pricePerPerson;
        uint256 maxParticipants;
        uint256 availableSpots;
        uint256 createdAt;
        bool isActive;
        bool isVerified;
        uint256 totalRatings;
        uint256 averageRating; // Rating out of 5, scaled by 100 (500 = 5.00 stars)
    }
    
    // Booking structure
    struct Booking {
        uint256 id;
        uint256 experienceId;
        address participant;
        uint256 numberOfPeople;
        uint256 totalPaid;
        uint256 bookingDate;
        BookingStatus status;
        bool hasReviewed;
    }
    
    // Enums
    enum BookingStatus {
        Pending,
        Confirmed,
        Completed,
        Cancelled,
        Refunded
    }
    
    // Mappings
    mapping(uint256 => Experience) public experiences;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public hostExperiences;
    mapping(address => uint256[]) public userBookings;
    mapping(address => bool) public verifiedHosts;
    mapping(uint256 => uint256[]) public experienceBookings;
    
    // Events
    event ExperienceCreated(
        uint256 indexed experienceId,
        address indexed host,
        string title,
        uint256 pricePerPerson,
        uint256 maxParticipants
    );
    
    event ExperienceUpdated(uint256 indexed experienceId, address indexed host);
    event ExperienceDeactivated(uint256 indexed experienceId, address indexed host);
    event HostVerified(address indexed host);
    event HostUnverified(address indexed host);
    
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed experienceId,
        address indexed participant,
        uint256 numberOfPeople,
        uint256 totalPaid
    );
    
    event BookingConfirmed(uint256 indexed bookingId);
    event BookingCompleted(uint256 indexed bookingId);
    event BookingCancelled(uint256 indexed bookingId);
    event BookingRefunded(uint256 indexed bookingId, uint256 refundAmount);
    
    event ReviewAdded(
        uint256 indexed experienceId,
        uint256 indexed bookingId,
        address indexed reviewer,
        uint256 rating
    );
    
    event PlatformFeeUpdated(uint256 newFeePercent);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    
    constructor(address _flamaToken) Ownable(msg.sender) {
        require(_flamaToken != address(0), "Invalid token address");
        flamaToken = IERC20(_flamaToken);
    }
    
    /**
     * @dev Creates a new experience
     */
    function createExperience(
        string calldata title,
        string calldata description,
        string calldata location,
        string calldata imageUrl,
        uint256 pricePerPerson,
        uint256 maxParticipants
    ) external whenNotPaused {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(pricePerPerson > 0, "Price must be greater than zero");
        require(maxParticipants > 0, "Max participants must be greater than zero");
        
        uint256 experienceId = ++experienceCounter;
        
        experiences[experienceId] = Experience({
            id: experienceId,
            host: msg.sender,
            title: title,
            description: description,
            location: location,
            imageUrl: imageUrl,
            pricePerPerson: pricePerPerson,
            maxParticipants: maxParticipants,
            availableSpots: maxParticipants,
            createdAt: block.timestamp,
            isActive: true,
            isVerified: verifiedHosts[msg.sender],
            totalRatings: 0,
            averageRating: 0
        });
        
        hostExperiences[msg.sender].push(experienceId);
        
        emit ExperienceCreated(
            experienceId,
            msg.sender,
            title,
            pricePerPerson,
            maxParticipants
        );
    }
    
    /**
     * @dev Books an experience
     */
    function bookExperience(
        uint256 experienceId,
        uint256 numberOfPeople
    ) external whenNotPaused nonReentrant {
        Experience storage experience = experiences[experienceId];
        
        require(experience.id != 0, "Experience does not exist");
        require(experience.isActive, "Experience is not active");
        require(numberOfPeople > 0, "Number of people must be greater than zero");
        require(numberOfPeople <= experience.availableSpots, "Not enough available spots");
        require(experience.host != msg.sender, "Cannot book your own experience");
        
        uint256 totalCost = experience.pricePerPerson * numberOfPeople;
        uint256 platformFee = (totalCost * platformFeePercent) / 10000;
        uint256 hostAmount = totalCost - platformFee;
        
        // Transfer payment from user
        flamaToken.safeTransferFrom(msg.sender, address(this), totalCost);
        
        // Update available spots
        experience.availableSpots -= numberOfPeople;
        
        // Create booking
        uint256 bookingId = ++bookingCounter;
        bookings[bookingId] = Booking({
            id: bookingId,
            experienceId: experienceId,
            participant: msg.sender,
            numberOfPeople: numberOfPeople,
            totalPaid: totalCost,
            bookingDate: block.timestamp,
            status: BookingStatus.Pending,
            hasReviewed: false
        });
        
        userBookings[msg.sender].push(bookingId);
        experienceBookings[experienceId].push(bookingId);
        
        // Transfer payment to host (minus platform fee)
        flamaToken.safeTransfer(experience.host, hostAmount);
        
        emit BookingCreated(bookingId, experienceId, msg.sender, numberOfPeople, totalCost);
    }
    
    /**
     * @dev Confirms a booking (callable by host)
     */
    function confirmBooking(uint256 bookingId) external whenNotPaused {
        Booking storage booking = bookings[bookingId];
        Experience storage experience = experiences[booking.experienceId];
        
        require(booking.id != 0, "Booking does not exist");
        require(experience.host == msg.sender, "Only host can confirm booking");
        require(booking.status == BookingStatus.Pending, "Booking is not pending");
        
        booking.status = BookingStatus.Confirmed;
        emit BookingConfirmed(bookingId);
    }
    
    /**
     * @dev Marks a booking as completed (callable by host)
     */
    function completeBooking(uint256 bookingId) external whenNotPaused {
        Booking storage booking = bookings[bookingId];
        Experience storage experience = experiences[booking.experienceId];
        
        require(booking.id != 0, "Booking does not exist");
        require(experience.host == msg.sender, "Only host can complete booking");
        require(booking.status == BookingStatus.Confirmed, "Booking is not confirmed");
        
        booking.status = BookingStatus.Completed;
        emit BookingCompleted(bookingId);
    }
    
    /**
     * @dev Adds a review for a completed booking
     */
    function addReview(uint256 bookingId, uint256 rating) external whenNotPaused {
        Booking storage booking = bookings[bookingId];
        Experience storage experience = experiences[booking.experienceId];
        
        require(booking.id != 0, "Booking does not exist");
        require(booking.participant == msg.sender, "Only participant can review");
        require(booking.status == BookingStatus.Completed, "Booking is not completed");
        require(!booking.hasReviewed, "Already reviewed");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        booking.hasReviewed = true;
        
        // Update experience rating
        uint256 scaledRating = rating * 100; // Scale rating (5 stars = 500)
        uint256 newTotalRatings = experience.totalRatings + 1;
        uint256 newAverageRating = ((experience.averageRating * experience.totalRatings) + scaledRating) / newTotalRatings;
        
        experience.totalRatings = newTotalRatings;
        experience.averageRating = newAverageRating;
        
        emit ReviewAdded(booking.experienceId, bookingId, msg.sender, rating);
    }
    
    /**
     * @dev Verifies a host (only owner)
     */
    function verifyHost(address host) external onlyOwner {
        require(host != address(0), "Invalid host address");
        verifiedHosts[host] = true;
        
        // Update verification status for host's experiences
        uint256[] storage hostExps = hostExperiences[host];
        for (uint256 i = 0; i < hostExps.length; i++) {
            experiences[hostExps[i]].isVerified = true;
        }
        
        emit HostVerified(host);
    }
    
    /**
     * @dev Unverifies a host (only owner)
     */
    function unverifyHost(address host) external onlyOwner {
        require(host != address(0), "Invalid host address");
        verifiedHosts[host] = false;
        
        // Update verification status for host's experiences
        uint256[] storage hostExps = hostExperiences[host];
        for (uint256 i = 0; i < hostExps.length; i++) {
            experiences[hostExps[i]].isVerified = false;
        }
        
        emit HostUnverified(host);
    }
    
    /**
     * @dev Updates platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= MAX_FEE_PERCENT, "Fee exceeds maximum");
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev Withdraws platform fees (only owner)
     */
    function withdrawFees(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        uint256 balance = flamaToken.balanceOf(address(this));
        require(amount <= balance, "Insufficient contract balance");
        
        flamaToken.safeTransfer(msg.sender, amount);
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // View functions
    function getExperience(uint256 experienceId) external view returns (Experience memory) {
        return experiences[experienceId];
    }
    
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }
    
    function getHostExperiences(address host) external view returns (uint256[] memory) {
        return hostExperiences[host];
    }
    
    function getUserBookings(address user) external view returns (uint256[] memory) {
        return userBookings[user];
    }
    
    function getExperienceBookings(uint256 experienceId) external view returns (uint256[] memory) {
        return experienceBookings[experienceId];
    }
    
    function isHostVerified(address host) external view returns (bool) {
        return verifiedHosts[host];
    }
    
    function getContractBalance() external view returns (uint256) {
        return flamaToken.balanceOf(address(this));
    }
}