// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title PaymentEscrowUpgradeable
 * @dev Handles milestone-based payments for experiences
 * Supports Coinbase server wallets for experience creators
 */
contract PaymentEscrowUpgradeable is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable 
{
    struct Payment {
        uint256 experienceId;
        address participant;
        address experienceWallet; // Coinbase server wallet
        uint256 totalAmount;
        uint256 advanceAmount;
        uint256 checkinAmount;
        uint256 midExperienceAmount;
        uint256 completionAmount;
        uint256 paidAmount;
        PaymentStatus status;
        uint256 createdAt;
    }

    enum PaymentStatus {
        Created,
        PartiallyPaid,
        Completed,
        Refunded
    }

    // State variables
    uint256 public platformFeeRate; // Basis points
    address public platformFeeRecipient;
    
    // Mappings
    mapping(bytes32 => Payment) public payments;
    mapping(uint256 => mapping(address => bytes32)) public experiencePayments;
    mapping(address => bytes32[]) public userPayments;

    // Events
    event PaymentCreated(
        bytes32 indexed paymentId,
        uint256 indexed experienceId,
        address indexed participant,
        address experienceWallet,
        uint256 totalAmount
    );
    event PaymentReleased(
        bytes32 indexed paymentId,
        address indexed recipient,
        uint256 amount,
        string milestone
    );
    event PaymentRefunded(
        bytes32 indexed paymentId,
        address indexed participant,
        uint256 amount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _platformFeeRate,
        address _platformFeeRecipient
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        platformFeeRate = _platformFeeRate;
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * @dev Creates a new payment escrow for an experience
     */
    function createPayment(
        uint256 _experienceId,
        address _participant,
        address _experienceWallet,
        uint256 _totalAmount,
        uint256 _advancePercentage,
        uint256 _checkinPercentage,
        uint256 _midExperiencePercentage,
        uint256 _completionPercentage
    ) external payable whenNotPaused nonReentrant {
        require(_participant != address(0), "Invalid participant");
        require(_experienceWallet != address(0), "Invalid experience wallet");
        require(_totalAmount > 0, "Total amount must be greater than 0");
        
        bytes32 paymentId = keccak256(
            abi.encodePacked(_experienceId, _participant, block.timestamp)
        );
        
        require(payments[paymentId].participant == address(0), "Payment already exists");

        uint256 advanceAmount = (_totalAmount * _advancePercentage) / 100;
        require(msg.value == advanceAmount, "Incorrect advance payment");

        payments[paymentId] = Payment({
            experienceId: _experienceId,
            participant: _participant,
            experienceWallet: _experienceWallet,
            totalAmount: _totalAmount,
            advanceAmount: advanceAmount,
            checkinAmount: (_totalAmount * _checkinPercentage) / 100,
            midExperienceAmount: (_totalAmount * _midExperiencePercentage) / 100,
            completionAmount: (_totalAmount * _completionPercentage) / 100,
            paidAmount: msg.value,
            status: PaymentStatus.Created,
            createdAt: block.timestamp
        });

        experiencePayments[_experienceId][_participant] = paymentId;
        userPayments[_participant].push(paymentId);

        emit PaymentCreated(
            paymentId, 
            _experienceId, 
            _participant, 
            _experienceWallet, 
            _totalAmount
        );
    }

    /**
     * @dev Release check-in payment (called by ExperienceManager)
     */
    function releaseCheckinPayment(uint256 _experienceId, address _participant) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        bytes32 paymentId = experiencePayments[_experienceId][_participant];
        Payment storage payment = payments[paymentId];
        
        require(payment.participant != address(0), "Payment not found");
        require(payment.status == PaymentStatus.Created, "Invalid payment status");

        // Participant pays the check-in amount
        uint256 checkinAmount = payment.checkinAmount;
        require(address(this).balance >= checkinAmount, "Insufficient participant balance");

        // Transfer check-in payment to experience wallet
        uint256 platformFee = (checkinAmount * platformFeeRate) / 10000;
        uint256 creatorAmount = checkinAmount - platformFee;

        (bool success1,) = payment.experienceWallet.call{value: creatorAmount}("");
        require(success1, "Transfer to experience wallet failed");

        if (platformFee > 0) {
            (bool success2,) = platformFeeRecipient.call{value: platformFee}("");
            require(success2, "Platform fee transfer failed");
        }

        payment.paidAmount += checkinAmount;
        payment.status = PaymentStatus.PartiallyPaid;

        emit PaymentReleased(paymentId, payment.experienceWallet, creatorAmount, "checkin");
    }

    /**
     * @dev Release completion payment (mid-experience + completion)
     */
    function releaseCompletionPayment(uint256 _experienceId, address _participant) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        bytes32 paymentId = experiencePayments[_experienceId][_participant];
        Payment storage payment = payments[paymentId];
        
        require(payment.participant != address(0), "Payment not found");
        require(payment.status == PaymentStatus.PartiallyPaid, "Must complete check-in first");

        uint256 remainingAmount = payment.midExperienceAmount + payment.completionAmount;
        
        // Transfer remaining payment to experience wallet
        uint256 platformFee = (remainingAmount * platformFeeRate) / 10000;
        uint256 creatorAmount = remainingAmount - platformFee;

        (bool success1,) = payment.experienceWallet.call{value: creatorAmount}("");
        require(success1, "Transfer to experience wallet failed");

        if (platformFee > 0) {
            (bool success2,) = platformFeeRecipient.call{value: platformFee}("");
            require(success2, "Platform fee transfer failed");
        }

        payment.paidAmount += remainingAmount;
        payment.status = PaymentStatus.Completed;

        emit PaymentReleased(paymentId, payment.experienceWallet, creatorAmount, "completion");
    }

    /**
     * @dev Refund payment in case of cancellation
     */
    function refundPayment(uint256 _experienceId, address _participant) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        bytes32 paymentId = experiencePayments[_experienceId][_participant];
        Payment storage payment = payments[paymentId];
        
        require(payment.participant != address(0), "Payment not found");
        require(
            payment.status == PaymentStatus.Created || 
            payment.status == PaymentStatus.PartiallyPaid,
            "Cannot refund completed payment"
        );

        uint256 refundAmount = payment.paidAmount;
        require(refundAmount > 0, "No amount to refund");

        payment.status = PaymentStatus.Refunded;

        (bool success,) = _participant.call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit PaymentRefunded(paymentId, _participant, refundAmount);
    }

    // View functions
    function getPayment(uint256 _experienceId, address _participant) 
        external 
        view 
        returns (Payment memory) 
    {
        bytes32 paymentId = experiencePayments[_experienceId][_participant];
        return payments[paymentId];
    }

    function getUserPayments(address _user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userPayments[_user];
    }

    // Admin functions
    function updatePlatformFee(uint256 _newFeeRate, address _newRecipient) 
        external 
        onlyOwner 
    {
        require(_newFeeRate <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeeRate = _newFeeRate;
        platformFeeRecipient = _newRecipient;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
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

    // Receive function to accept payments
    receive() external payable {}
}