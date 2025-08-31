// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "./PaymentEscrowUpgradeable.sol";

/**
 * @title ExperienceManagerUpgradeable
 * @dev Manages experience lifecycle: creation, registration, check-in, completion
 * Integrates with Coinbase server wallets for experience-specific payment addresses
 */
contract ExperienceManagerUpgradeable is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable 
{
    struct Experience {
        uint256 id;
        address creator;
        address experienceWallet; // Coinbase server wallet for this experience
        string title;
        string description;
        string location;
        uint256 price; // Total price in wei
        uint256 maxParticipants;
        uint256 currentParticipants;
        ExperienceStatus status;
        uint256 createdAt;
        uint256 scheduledAt;
        PaymentStructure paymentStructure;
    }

    struct PaymentStructure {
        uint256 advancePercentage; // Default 5% 
        uint256 checkinPercentage; // Default 40%
        uint256 midExperiencePercentage; // Default 35%
        uint256 completionPercentage; // Default 20%
    }

    enum ExperienceStatus {
        Active,
        Full,
        InProgress,
        Completed,
        Cancelled
    }

    // State variables
    PaymentEscrowUpgradeable public paymentEscrow;
    uint256 private nextExperienceId;
    uint256 public platformFeeRate; // Basis points (e.g., 50 = 0.5%)
    address public platformFeeRecipient;

    // Mappings
    mapping(uint256 => Experience) public experiences;
    mapping(uint256 => address[]) public experienceParticipants;
    mapping(address => uint256[]) public userExperiences;
    mapping(uint256 => mapping(address => bool)) public hasRegistered;
    mapping(uint256 => mapping(address => bool)) public hasCheckedIn;
    mapping(uint256 => mapping(address => bool)) public hasCompleted;

    // Events
    event ExperienceCreated(
        uint256 indexed experienceId,
        address indexed creator,
        address indexed experienceWallet,
        string title,
        uint256 price
    );
    event UserRegistered(uint256 indexed experienceId, address indexed user);
    event UserCheckedIn(uint256 indexed experienceId, address indexed user);
    event ExperienceCompleted(uint256 indexed experienceId);
    event ExperienceCancelled(uint256 indexed experienceId);
    event PaymentEscrowUpdated(address indexed newEscrow);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address payable _paymentEscrow,
        uint256 _platformFeeRate,
        address _platformFeeRecipient
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        paymentEscrow = PaymentEscrowUpgradeable(_paymentEscrow);
        platformFeeRate = _platformFeeRate;
        platformFeeRecipient = _platformFeeRecipient;
        nextExperienceId = 1;
    }

    /**
     * @dev Creates a new experience with Coinbase server wallet integration
     * @param _experienceWallet Coinbase server wallet address for this experience
     * @param _title Experience title
     * @param _description Experience description
     * @param _location Experience location
     * @param _price Total experience price in wei
     * @param _maxParticipants Maximum number of participants
     * @param _scheduledAt Unix timestamp for experience start
     * @param _paymentStructure Custom payment milestone percentages
     */
    function createExperience(
        address _experienceWallet,
        string memory _title,
        string memory _description,
        string memory _location,
        uint256 _price,
        uint256 _maxParticipants,
        uint256 _scheduledAt,
        PaymentStructure memory _paymentStructure
    ) external whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_price > 0, "Price must be greater than 0");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(_experienceWallet != address(0), "Experience wallet required");
        require(_scheduledAt > block.timestamp, "Schedule time must be in future");
        
        // Validate payment structure totals 100%
        uint256 totalPercentage = _paymentStructure.advancePercentage + 
                                 _paymentStructure.checkinPercentage + 
                                 _paymentStructure.midExperiencePercentage + 
                                 _paymentStructure.completionPercentage;
        require(totalPercentage == 100, "Payment structure must total 100%");

        uint256 experienceId = nextExperienceId++;

        experiences[experienceId] = Experience({
            id: experienceId,
            creator: msg.sender,
            experienceWallet: _experienceWallet,
            title: _title,
            description: _description,
            location: _location,
            price: _price,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            status: ExperienceStatus.Active,
            createdAt: block.timestamp,
            scheduledAt: _scheduledAt,
            paymentStructure: _paymentStructure
        });

        userExperiences[msg.sender].push(experienceId);

        emit ExperienceCreated(experienceId, msg.sender, _experienceWallet, _title, _price);

        return experienceId;
    }

    /**
     * @dev Register for an experience with 5% advance payment
     */
    function registerForExperience(uint256 _experienceId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        Experience storage experience = experiences[_experienceId];
        require(experience.id != 0, "Experience does not exist");
        require(experience.status == ExperienceStatus.Active, "Experience not active");
        require(experience.currentParticipants < experience.maxParticipants, "Experience full");
        require(!hasRegistered[_experienceId][msg.sender], "Already registered");
        require(msg.sender != experience.creator, "Creator cannot register");

        uint256 advancePayment = (experience.price * experience.paymentStructure.advancePercentage) / 100;
        require(msg.value == advancePayment, "Incorrect advance payment amount");

        // Register user
        hasRegistered[_experienceId][msg.sender] = true;
        experienceParticipants[_experienceId].push(msg.sender);
        experience.currentParticipants++;
        userExperiences[msg.sender].push(_experienceId);

        // Update status if full
        if (experience.currentParticipants == experience.maxParticipants) {
            experience.status = ExperienceStatus.Full;
        }

        // Create escrow payment
        paymentEscrow.createPayment{value: msg.value}(
            _experienceId,
            msg.sender,
            experience.experienceWallet,
            experience.price,
            experience.paymentStructure.advancePercentage,
            experience.paymentStructure.checkinPercentage,
            experience.paymentStructure.midExperiencePercentage,
            experience.paymentStructure.completionPercentage
        );

        emit UserRegistered(_experienceId, msg.sender);
    }

    /**
     * @dev Check-in to experience (triggers second payment)
     */
    function checkInToExperience(uint256 _experienceId, address _participant) 
        external 
        whenNotPaused 
    {
        Experience storage experience = experiences[_experienceId];
        require(experience.id != 0, "Experience does not exist");
        require(msg.sender == experience.creator, "Only creator can check-in participants");
        require(hasRegistered[_experienceId][_participant], "User not registered");
        require(!hasCheckedIn[_experienceId][_participant], "Already checked in");

        hasCheckedIn[_experienceId][_participant] = true;
        
        // Update experience status to in progress if first check-in
        if (experience.status != ExperienceStatus.InProgress) {
            experience.status = ExperienceStatus.InProgress;
        }

        // Trigger check-in payment release
        paymentEscrow.releaseCheckinPayment(_experienceId, _participant);

        emit UserCheckedIn(_experienceId, _participant);
    }

    /**
     * @dev Complete experience for a participant (triggers final payments)
     */
    function completeExperienceForParticipant(uint256 _experienceId, address _participant) 
        external 
        whenNotPaused 
    {
        Experience storage experience = experiences[_experienceId];
        require(experience.id != 0, "Experience does not exist");
        require(msg.sender == experience.creator, "Only creator can complete");
        require(hasCheckedIn[_experienceId][_participant], "User must check-in first");
        require(!hasCompleted[_experienceId][_participant], "Already completed");

        hasCompleted[_experienceId][_participant] = true;

        // Release remaining payments
        paymentEscrow.releaseCompletionPayment(_experienceId, _participant);

        emit UserCheckedIn(_experienceId, _participant);
    }

    /**
     * @dev Complete entire experience (all participants)
     */
    function completeExperience(uint256 _experienceId) external whenNotPaused {
        Experience storage experience = experiences[_experienceId];
        require(experience.id != 0, "Experience does not exist");
        require(msg.sender == experience.creator, "Only creator can complete");
        require(experience.status == ExperienceStatus.InProgress, "Experience not in progress");

        experience.status = ExperienceStatus.Completed;

        emit ExperienceCompleted(_experienceId);
    }

    /**
     * @dev Cancel experience and handle refunds
     */
    function cancelExperience(uint256 _experienceId) external whenNotPaused {
        Experience storage experience = experiences[_experienceId];
        require(experience.id != 0, "Experience does not exist");
        require(
            msg.sender == experience.creator || msg.sender == owner(),
            "Only creator or owner can cancel"
        );
        require(
            experience.status == ExperienceStatus.Active || 
            experience.status == ExperienceStatus.Full,
            "Cannot cancel in-progress or completed experience"
        );

        experience.status = ExperienceStatus.Cancelled;

        // Process refunds for all registered participants
        address[] memory participants = experienceParticipants[_experienceId];
        for (uint256 i = 0; i < participants.length; i++) {
            paymentEscrow.refundPayment(_experienceId, participants[i]);
        }

        emit ExperienceCancelled(_experienceId);
    }

    // View functions
    function getExperience(uint256 _experienceId) 
        external 
        view 
        returns (Experience memory) 
    {
        return experiences[_experienceId];
    }

    function getExperienceParticipants(uint256 _experienceId) 
        external 
        view 
        returns (address[] memory) 
    {
        return experienceParticipants[_experienceId];
    }

    function getUserExperiences(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userExperiences[_user];
    }

    function getNextExperienceId() external view returns (uint256) {
        return nextExperienceId;
    }

    // Admin functions
    function updatePaymentEscrow(address payable _newEscrow) external onlyOwner {
        require(_newEscrow != address(0), "Invalid escrow address");
        paymentEscrow = PaymentEscrowUpgradeable(_newEscrow);
        emit PaymentEscrowUpdated(_newEscrow);
    }

    function updatePlatformFee(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeeRate = _newFeeRate;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) 
        internal 
        onlyOwner 
        override 
    {}
}