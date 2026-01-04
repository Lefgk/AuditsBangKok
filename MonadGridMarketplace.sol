// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract MonadGridMarketplace is Ownable, ReentrancyGuard {
    using Address for address payable;

    uint96 private constant MAX_BPS = 10_000;
    uint96 private constant MAX_ROYALTY_BPS = 1_000;
    uint256 private constant MAX_BULK_OPERATIONS = 50;

    struct Listing {
        address seller;
        uint128 price;
    }

    struct Offer {
        address bidder;
        uint128 price;
        uint64 expiration;
    }

    struct RoyaltyInfo {
        address recipient;
        uint96 bps;
    }

    uint96 public marketplaceFee;
    address public feeRecipient;

    mapping(address => mapping(uint256 => Listing)) private _listings;
    mapping(address => mapping(uint256 => Offer)) private _offers;
    mapping(address => RoyaltyInfo) private _royalties;
    mapping(address => address) private _collectionOwners;

    event ListingCreated(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed seller,
        uint128 price
    );

    event ListingUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        uint128 price
    );

    event ListingCancelled(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed seller
    );

    event ListingSold(
        address indexed collection,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint128 price,
        uint128 royaltyPaid,
        uint128 marketplaceFeePaid
    );

    event OfferPlaced(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed bidder,
        uint128 price,
        uint64 expiration
    );

    event OfferCancelled(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed bidder
    );

    event OfferAccepted(
        address indexed collection,
        uint256 indexed tokenId,
        address seller,
        address bidder,
        uint128 price,
        uint128 royaltyPaid,
        uint128 marketplaceFeePaid
    );

    event RoyaltyUpdated(
        address indexed collection,
        address indexed recipient,
        uint96 bps
    );

    event CollectionOwnerSet(
        address indexed collection,
        address indexed collectionOwner
    );

    event MarketplaceFeeUpdated(uint96 oldFee, uint96 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event BulkListingCreated(address indexed seller, uint256 count);
    event SweepExecuted(address indexed buyer, uint256 count, uint256 totalSpent);

    error InvalidCollection();
    error InvalidPrice();
    error InvalidExpiration();
    error ListingNotFound();
    error ListingExists();
    error ListingExpired();
    error OfferNotFound();
    error OfferExpired();
    error OfferTooLow();
    error Unauthorized();
    error MarketplaceNotApproved();
    error InvalidRoyaltyRecipient();
    error InvalidRoyaltyBps();
    error InvalidFeeRecipient();
    error InvalidFeeBps();
    error TooManyItems();
    error InsufficientPayment();
    error PriceExceedsMax();
    error ArrayLengthMismatch();
    error ZeroAddress();

    constructor(
        address initialOwner,
        address _feeRecipient,
        uint96 _marketplaceFee
    ) Ownable(initialOwner) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        if (_marketplaceFee > MAX_BPS) revert InvalidFeeBps();
        feeRecipient = _feeRecipient;
        marketplaceFee = _marketplaceFee;
    }

    function list(
        address collection,
        uint256 tokenId,
        uint128 price
    ) external {
        _validateCollection(collection);
        if (price == 0) revert InvalidPrice();
        
        Listing storage listing = _listings[collection][tokenId];
        if (listing.seller != address(0)) revert ListingExists();

        IERC721 token = IERC721(collection);
        if (token.ownerOf(tokenId) != msg.sender) revert Unauthorized();
        _requireMarketplaceApproval(token, tokenId, msg.sender);

        listing.seller = msg.sender;
        listing.price = price;

        emit ListingCreated(collection, tokenId, msg.sender, price);
    }

    function bulkList(
        address collection,
        uint256[] calldata tokenIds,
        uint128 price
    ) external {
        _validateCollection(collection);
        if (price == 0) revert InvalidPrice();
        
        uint256 length = tokenIds.length;
        if (length == 0 || length > MAX_BULK_OPERATIONS) revert TooManyItems();

        IERC721 token = IERC721(collection);

        for (uint256 i = 0; i < length; ) {
            uint256 tokenId = tokenIds[i];
            
            Listing storage listing = _listings[collection][tokenId];
            if (listing.seller != address(0)) revert ListingExists();

            if (token.ownerOf(tokenId) != msg.sender) revert Unauthorized();
            _requireMarketplaceApproval(token, tokenId, msg.sender);

            listing.seller = msg.sender;
            listing.price = price;

            emit ListingCreated(collection, tokenId, msg.sender, price);

            unchecked { ++i; }
        }

        emit BulkListingCreated(msg.sender, length);
    }

    function updateListing(
        address collection,
        uint256 tokenId,
        uint128 newPrice
    ) external {
        if (newPrice == 0) revert InvalidPrice();
        
        Listing storage listing = _listings[collection][tokenId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (listing.seller != msg.sender) revert Unauthorized();

        listing.price = newPrice;

        emit ListingUpdated(collection, tokenId, newPrice);
    }

    function cancelListing(address collection, uint256 tokenId) external {
        Listing storage listing = _listings[collection][tokenId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (listing.seller != msg.sender) revert Unauthorized();

        delete _listings[collection][tokenId];
        emit ListingCancelled(collection, tokenId, msg.sender);
    }

    function bulkCancelListing(address collection, uint256[] calldata tokenIds) external {
        uint256 length = tokenIds.length;
        if (length == 0 || length > MAX_BULK_OPERATIONS) revert TooManyItems();

        for (uint256 i = 0; i < length; ) {
            uint256 tokenId = tokenIds[i];
            Listing storage listing = _listings[collection][tokenId];
            
            if (listing.seller != address(0) && listing.seller == msg.sender) {
                delete _listings[collection][tokenId];
                emit ListingCancelled(collection, tokenId, msg.sender);
            }

            unchecked { ++i; }
        }
    }

    function buy(address collection, uint256 tokenId) external payable nonReentrant {
        Listing memory listing = _listings[collection][tokenId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (msg.value != listing.price) revert InvalidPrice();

        delete _listings[collection][tokenId];

        IERC721 token = IERC721(collection);
        if (token.ownerOf(tokenId) != listing.seller) revert Unauthorized();
        _requireMarketplaceApproval(token, tokenId, listing.seller);

        token.safeTransferFrom(listing.seller, msg.sender, tokenId);

        (uint128 royaltyPaid, uint128 feePaid) = _distributeProceeds(
            collection,
            tokenId,
            listing.seller,
            listing.price
        );

        emit ListingSold(
            collection,
            tokenId,
            listing.seller,
            msg.sender,
            listing.price,
            royaltyPaid,
            feePaid
        );
    }

    function sweep(
        address collection,
        uint256[] calldata tokenIds
    ) external payable nonReentrant {
        _validateCollection(collection);
        
        uint256 length = tokenIds.length;
        if (length == 0 || length > MAX_BULK_OPERATIONS) revert TooManyItems();

        IERC721 token = IERC721(collection);
        uint256 totalSpent = 0;
        uint256 successCount = 0;

        for (uint256 i = 0; i < length; ) {
            uint256 tokenId = tokenIds[i];
            Listing memory listing = _listings[collection][tokenId];

            if (listing.seller == address(0)) {
                unchecked { ++i; }
                continue;
            }

            if (token.ownerOf(tokenId) != listing.seller) {
                unchecked { ++i; }
                continue;
            }
            if (token.getApproved(tokenId) != address(this) && 
                !token.isApprovedForAll(listing.seller, address(this))) {
                unchecked { ++i; }
                continue;
            }

            if (totalSpent + listing.price > msg.value) {
                unchecked { ++i; }
                continue;
            }

            delete _listings[collection][tokenId];

            token.safeTransferFrom(listing.seller, msg.sender, tokenId);

            (uint128 royaltyPaid, uint128 feePaid) = _distributeProceeds(
                collection,
                tokenId,
                listing.seller,
                listing.price
            );

            totalSpent += listing.price;
            unchecked { ++successCount; }

            emit ListingSold(
                collection,
                tokenId,
                listing.seller,
                msg.sender,
                listing.price,
                royaltyPaid,
                feePaid
            );

            unchecked { ++i; }
        }

        if (msg.value > totalSpent) {
            payable(msg.sender).sendValue(msg.value - totalSpent);
        }

        emit SweepExecuted(msg.sender, successCount, totalSpent);
    }

    function getListing(address collection, uint256 tokenId) external view returns (Listing memory) {
        return _listings[collection][tokenId];
    }

    function getListings(
        address[] calldata collections,
        uint256[] calldata tokenIds
    ) external view returns (Listing[] memory) {
        uint256 length = collections.length;
        if (length != tokenIds.length) revert ArrayLengthMismatch();

        Listing[] memory listings = new Listing[](length);
        for (uint256 i = 0; i < length; ) {
            listings[i] = _listings[collections[i]][tokenIds[i]];
            unchecked { ++i; }
        }
        return listings;
    }

    function placeOffer(
        address collection,
        uint256 tokenId,
        uint64 expiration
    ) external payable nonReentrant {
        _validateCollection(collection);
        if (msg.value == 0) revert InvalidPrice();

        Offer storage current = _offers[collection][tokenId];
        uint64 normalizedExpiration = _normalizeExpiration(expiration);

        if (current.bidder != address(0)) {
            if (current.expiration != 0 && current.expiration < block.timestamp) {
                _refundOffer(collection, tokenId);
            } else {
                if (msg.value <= current.price) revert OfferTooLow();
                _refundOffer(collection, tokenId);
            }
        }

        current.bidder = msg.sender;
        current.price = uint128(msg.value);
        current.expiration = normalizedExpiration;

        emit OfferPlaced(collection, tokenId, msg.sender, uint128(msg.value), normalizedExpiration);
    }

    function cancelOffer(address collection, uint256 tokenId) external nonReentrant {
        Offer storage offer = _offers[collection][tokenId];
        if (offer.bidder == address(0)) revert OfferNotFound();
        if (offer.bidder != msg.sender) revert Unauthorized();

        uint256 amount = offer.price;
        delete _offers[collection][tokenId];
        payable(msg.sender).sendValue(amount);

        emit OfferCancelled(collection, tokenId, msg.sender);
    }

    function acceptOffer(
        address collection,
        uint256 tokenId,
        address expectedBidder,
        uint128 minPrice
    ) external nonReentrant {
        Offer memory offer = _offers[collection][tokenId];
        if (offer.bidder == address(0)) revert OfferNotFound();
        if (offer.expiration != 0 && offer.expiration < block.timestamp) revert OfferExpired();
        if (expectedBidder != address(0) && offer.bidder != expectedBidder) revert Unauthorized();
        if (offer.price < minPrice) revert InvalidPrice();

        IERC721 token = IERC721(collection);
        if (token.ownerOf(tokenId) != msg.sender) revert Unauthorized();
        _requireMarketplaceApproval(token, tokenId, msg.sender);

        delete _offers[collection][tokenId];

        token.safeTransferFrom(msg.sender, offer.bidder, tokenId);
        
        (uint128 royaltyPaid, uint128 feePaid) = _distributeProceeds(
            collection,
            tokenId,
            msg.sender,
            offer.price
        );

        emit OfferAccepted(
            collection,
            tokenId,
            msg.sender,
            offer.bidder,
            offer.price,
            royaltyPaid,
            feePaid
        );
    }

    function getOffer(address collection, uint256 tokenId) external view returns (Offer memory) {
        return _offers[collection][tokenId];
    }

    function setCollectionOwner(address collection, address collectionOwner) external onlyOwner {
        _validateCollection(collection);
        _collectionOwners[collection] = collectionOwner;
        emit CollectionOwnerSet(collection, collectionOwner);
    }

    function updateRoyalty(
        address collection,
        address recipient,
        uint96 bps
    ) external {
        address collOwner = _collectionOwners[collection];
        
        bool isAuthorized = (msg.sender == owner());

        if (!isAuthorized && collOwner == msg.sender) {
            isAuthorized = true;
        }
        
        if (!isAuthorized && collOwner == address(0)) {
            try Ownable(collection).owner() returns (address owner) {
                if (owner == msg.sender) {
                    isAuthorized = true;
                }
            } catch {}
        }

        if (!isAuthorized) revert Unauthorized();

        if (bps > MAX_ROYALTY_BPS) revert InvalidRoyaltyBps();
        if (bps > 0 && recipient == address(0)) revert InvalidRoyaltyRecipient();

        _royalties[collection] = RoyaltyInfo(recipient, bps);
        emit RoyaltyUpdated(collection, recipient, bps);
    }

    function getRoyaltyInfo(address collection) external view returns (RoyaltyInfo memory) {
        return _royalties[collection];
    }

    function getCollectionOwner(address collection) external view returns (address) {
        return _collectionOwners[collection];
    }

    function setMarketplaceFee(uint96 newFee) external onlyOwner {
        if (newFee > MAX_BPS) revert InvalidFeeBps();
        uint96 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(oldFee, newFee);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidFeeRecipient();
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    function withdrawFees(address payable recipient, uint256 amount) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        recipient.sendValue(amount);
    }

    function _refundOffer(address collection, uint256 tokenId) private {
        Offer storage offer = _offers[collection][tokenId];
        if (offer.bidder == address(0)) return;
        
        uint256 amount = offer.price;
        address bidder = offer.bidder;
        delete _offers[collection][tokenId];
        
        payable(bidder).sendValue(amount);
        emit OfferCancelled(collection, tokenId, bidder);
    }

    function _distributeProceeds(
        address collection,
        uint256 tokenId,
        address seller,
        uint128 amount
    ) private returns (uint128 royaltyPaid, uint128 feePaid) {
        uint128 remaining = amount;

        if (marketplaceFee > 0 && feeRecipient != address(0)) {
            feePaid = uint128((uint256(amount) * marketplaceFee) / MAX_BPS);
            if (feePaid > 0) {
                remaining -= feePaid;
                payable(feeRecipient).sendValue(feePaid);
            }
        }

        RoyaltyInfo memory royalty = _royalties[collection];
        if (royalty.recipient != address(0) && royalty.bps > 0) {
            royaltyPaid = uint128((uint256(amount) * royalty.bps) / MAX_BPS);
            if (royaltyPaid > 0) {
                remaining -= royaltyPaid;
                payable(royalty.recipient).sendValue(royaltyPaid);
            }
        } else {
            try IERC2981(collection).royaltyInfo(tokenId, amount) returns (address receiver, uint256 royaltyAmount) {
                if (receiver != address(0) && royaltyAmount > 0) {
                    royaltyPaid = uint128(royaltyAmount);
                    
                    uint128 maxRoyalty = uint128((uint256(amount) * MAX_ROYALTY_BPS) / MAX_BPS);
                    if (royaltyPaid > maxRoyalty) {
                        royaltyPaid = maxRoyalty;
                    }

                    if (royaltyPaid > remaining) royaltyPaid = remaining;
                    remaining -= royaltyPaid;
                    payable(receiver).sendValue(royaltyPaid);
                }
            } catch {}
        }

        payable(seller).sendValue(remaining);
    }

    function _requireMarketplaceApproval(
        IERC721 token,
        uint256 tokenId,
        address owner
    ) private view {
        if (token.getApproved(tokenId) != address(this) && 
            !token.isApprovedForAll(owner, address(this))) {
            revert MarketplaceNotApproved();
        }
    }

    function _normalizeExpiration(uint64 expiration) private view returns (uint64) {
        if (expiration == 0) return 0;
        if (uint256(expiration) <= block.timestamp) revert InvalidExpiration();
        return expiration;
    }

    function _validateCollection(address collection) private pure {
        if (collection == address(0)) revert InvalidCollection();
    }

    receive() external payable {
        revert("Direct payments disabled");
    }

    fallback() external payable {
        revert("Invalid call");
    }
}
