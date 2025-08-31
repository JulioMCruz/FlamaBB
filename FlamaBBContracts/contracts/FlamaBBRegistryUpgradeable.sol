// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title FlamaBBRegistryUpgradeable
 * @dev Registry for experience discovery, reviews, and reputation management
 */
contract FlamaBBRegistryUpgradeable is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    struct ExperienceMetadata {
        uint256 experienceId;
        string category; // restaurant, bar, cultural, outdoor, shopping, attraction
        string[] tags;
        string city;
        string neighborhood;
        uint256 averageRating; // Scaled by 100 (e.g., 450 = 4.50 stars)
        uint256 totalReviews;
        uint256 totalParticipants;
        bool isActive;
        uint256 lastActivityAt;
    }

    struct Review {
        uint256 experienceId;
        address reviewer;
        uint256 rating; // 1-5 (scaled by 100)
        string comment;
        uint256 timestamp;
        bool isVerified; // True if reviewer completed the experience
    }

    struct UserReputation {
        address userAddress;
        uint256 experiencesCreated;
        uint256 experiencesCompleted;
        uint256 totalEarnings;
        uint256 averageCreatorRating;
        uint256 averageParticipantRating;
        bool isVerified;
        uint256 joinedAt;
    }

    // State variables
    uint256 private nextReviewId;
    
    // Mappings
    mapping(uint256 => ExperienceMetadata) public experienceMetadata;
    mapping(uint256 => Review) public reviews;
    mapping(uint256 => uint256[]) public experienceReviews;
    mapping(address => UserReputation) public userReputations;
    mapping(address => uint256[]) public userCreatedExperiences;
    mapping(address => uint256[]) public userCompletedExperiences;
    mapping(string => uint256[]) public categoryExperiences;
    mapping(string => uint256[]) public cityExperiences;

    // Events
    event ExperienceRegistered(
        uint256 indexed experienceId,
        address indexed creator,
        string category,
        string city
    );
    event ReviewSubmitted(
        uint256 indexed reviewId,
        uint256 indexed experienceId,
        address indexed reviewer,
        uint256 rating
    );
    event ReputationUpdated(
        address indexed user,
        uint256 experiencesCreated,
        uint256 experiencesCompleted,
        uint256 averageRating
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        nextReviewId = 1;
    }

    /**
     * @dev Register an experience in the registry for discovery
     */
    function registerExperience(
        uint256 _experienceId,
        address _creator,
        string memory _category,
        string[] memory _tags,
        string memory _city,
        string memory _neighborhood
    ) external nonReentrant {
        require(_experienceId > 0, "Invalid experience ID");
        require(_creator != address(0), "Invalid creator address");
        require(bytes(_category).length > 0, "Category required");
        require(bytes(_city).length > 0, "City required");
        
        // Initialize experience metadata
        experienceMetadata[_experienceId] = ExperienceMetadata({
            experienceId: _experienceId,
            category: _category,
            tags: _tags,
            city: _city,
            neighborhood: _neighborhood,
            averageRating: 0,
            totalReviews: 0,
            totalParticipants: 0,
            isActive: true,
            lastActivityAt: block.timestamp
        });

        // Add to category and city indexes
        categoryExperiences[_category].push(_experienceId);
        cityExperiences[_city].push(_experienceId);
        userCreatedExperiences[_creator].push(_experienceId);

        // Update creator reputation
        UserReputation storage creatorRep = userReputations[_creator];
        if (creatorRep.userAddress == address(0)) {
            creatorRep.userAddress = _creator;
            creatorRep.joinedAt = block.timestamp;
        }
        creatorRep.experiencesCreated++;

        emit ExperienceRegistered(_experienceId, _creator, _category, _city);
        emit ReputationUpdated(
            _creator,
            creatorRep.experiencesCreated,
            creatorRep.experiencesCompleted,
            creatorRep.averageCreatorRating
        );
    }

    /**
     * @dev Submit a review for an experience
     */
    function submitReview(
        uint256 _experienceId,
        uint256 _rating,
        string memory _comment,
        bool _isVerified
    ) external nonReentrant {
        require(_experienceId > 0, "Invalid experience ID");
        require(_rating >= 100 && _rating <= 500, "Rating must be 1-5 (scaled by 100)");
        require(experienceMetadata[_experienceId].experienceId != 0, "Experience not registered");

        uint256 reviewId = nextReviewId++;

        reviews[reviewId] = Review({
            experienceId: _experienceId,
            reviewer: msg.sender,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp,
            isVerified: _isVerified
        });

        experienceReviews[_experienceId].push(reviewId);

        // Update experience rating
        ExperienceMetadata storage metadata = experienceMetadata[_experienceId];
        uint256 totalRating = metadata.averageRating * metadata.totalReviews + _rating;
        metadata.totalReviews++;
        metadata.averageRating = totalRating / metadata.totalReviews;
        metadata.lastActivityAt = block.timestamp;

        emit ReviewSubmitted(reviewId, _experienceId, msg.sender, _rating);
    }

    /**
     * @dev Mark experience completion for participant (updates reputation)
     */
    function markExperienceCompleted(
        uint256 _experienceId,
        address _participant
    ) external nonReentrant {
        require(_experienceId > 0, "Invalid experience ID");
        require(_participant != address(0), "Invalid participant");
        
        ExperienceMetadata storage metadata = experienceMetadata[_experienceId];
        require(metadata.experienceId != 0, "Experience not registered");

        // Update participant reputation
        UserReputation storage participantRep = userReputations[_participant];
        if (participantRep.userAddress == address(0)) {
            participantRep.userAddress = _participant;
            participantRep.joinedAt = block.timestamp;
        }
        participantRep.experiencesCompleted++;
        userCompletedExperiences[_participant].push(_experienceId);

        // Update experience participant count
        metadata.totalParticipants++;
        metadata.lastActivityAt = block.timestamp;

        emit ReputationUpdated(
            _participant,
            participantRep.experiencesCreated,
            participantRep.experiencesCompleted,
            participantRep.averageParticipantRating
        );
    }

    // Discovery functions
    function getExperiencesByCategory(string memory _category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return categoryExperiences[_category];
    }

    function getExperiencesByCity(string memory _city) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return cityExperiences[_city];
    }

    function getExperienceReviews(uint256 _experienceId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return experienceReviews[_experienceId];
    }

    function getUserCreatedExperiences(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userCreatedExperiences[_user];
    }

    function getUserCompletedExperiences(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userCompletedExperiences[_user];
    }

    function getReview(uint256 _reviewId) 
        external 
        view 
        returns (Review memory) 
    {
        return reviews[_reviewId];
    }

    function getUserReputation(address _user) 
        external 
        view 
        returns (UserReputation memory) 
    {
        return userReputations[_user];
    }

    // Admin functions
    function updateExperienceStatus(uint256 _experienceId, bool _isActive) 
        external 
        onlyOwner 
    {
        require(experienceMetadata[_experienceId].experienceId != 0, "Experience not found");
        experienceMetadata[_experienceId].isActive = _isActive;
    }

    function removeReview(uint256 _reviewId) external onlyOwner {
        require(reviews[_reviewId].reviewer != address(0), "Review not found");
        
        uint256 experienceId = reviews[_reviewId].experienceId;
        uint256 rating = reviews[_reviewId].rating;
        
        // Update experience rating (remove this review)
        ExperienceMetadata storage metadata = experienceMetadata[experienceId];
        if (metadata.totalReviews > 1) {
            uint256 totalRating = metadata.averageRating * metadata.totalReviews - rating;
            metadata.totalReviews--;
            metadata.averageRating = totalRating / metadata.totalReviews;
        } else {
            metadata.averageRating = 0;
            metadata.totalReviews = 0;
        }

        delete reviews[_reviewId];
    }

    function _authorizeUpgrade(address newImplementation) 
        internal 
        onlyOwner 
        override 
    {}
}