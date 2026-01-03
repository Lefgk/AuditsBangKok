# Lemonad Protocol Security Review

## Introduction

A time-boxed security review of the **Lemonad Protocol** was conducted by **Bangkok Audits**, with a focus on the security aspects of the smart contract implementation.

## Disclaimer

A smart contract security review can never verify the complete absence of vulnerabilities. This is a time, resource and expertise bound effort where we try to find as many vulnerabilities as possible. We can not guarantee 100% security after the review or even if the review will find any problems with your smart contracts. Subsequent security reviews, bug bounty programs and on-chain monitoring are strongly recommended.

## About Bangkok Audits

Bangkok Audits is an independent smart contract security firm specializing in comprehensive protocol reviews. Our team brings deep expertise in DeFi security, having reviewed DEXs, yield farming protocols, gaming contracts, and complex financial systems.

## About Lemonad Protocol

Lemonad is a comprehensive DeFi ecosystem built on Monad, consisting of:

- **DEX (Uniswap V2 Fork)**: LemonRouter, LemonPair, LemonFactory for decentralized token swaps
- **Gaming Suite**: Dice, Lottery, Prediction Markets, PvP Battles, Racing games
- **Yield Farming**: MasterChef-style farming with LEMON token rewards
- **Treasury Management**: Centralized fee collection and distribution

### Privileged Roles & Actors

| Role | Description |
|------|-------------|
| Owner | Can modify game parameters, pause games, withdraw emergency funds, update fees |
| Treasury | Receives house fees from all games and DEX operations |
| EntropyManager | Centralized VRF provider for randomness in games |
| GameRegistry | Controls which games are active and can modify configurations |

### Observations

- Protocol uses Pyth Network for price feeds in prediction markets
- Games utilize commit-reveal pattern with VRF for fair randomness
- DEX follows standard Uniswap V2 patterns with custom fee collection
- NFT integration for game participation and yield boosting

---

## Risk Classification

|                | High Impact     | Medium Impact  | Low Impact     |
|----------------|-----------------|----------------|----------------|
| High Likelihood| Critical        | High           | Medium         |
| Medium Likelihood| High          | Medium         | Low            |
| Low Likelihood | Medium          | Low            | Low            |

### Impact

- **High**: Leads to significant loss of user funds, protocol insolvency, or complete protocol failure
- **Medium**: Leads to partial loss of funds, temporary denial of service, or governance manipulation
- **Low**: Leads to minor issues, inconvenience, or suboptimal behavior

### Likelihood

- **High**: Attack is easy to perform and likely to happen
- **Medium**: Attack requires specific conditions but is feasible
- **Low**: Attack requires significant effort, resources, or unlikely conditions

---

## Security Assessment Summary

| Review Details | |
|----------------|---|
| **Protocol Name** | Lemonad Protocol |
| **Repository** | Private |
| **Commit** | Latest main branch |
| **Review Date** | January 2026 |
| **Methods** | Manual review, static analysis |

### Scope

| Contract | SLOC |
|----------|------|
| `LeMonad.sol` | ~50 |
| `dex/LemonRouter.sol` | ~200 |
| `dex/LemonPair.sol` | ~300 |
| `dex/LemonFactory.sol` | ~100 |
| `dex/FeeCollector.sol` | ~80 |
| `dex/WMON.sol` | ~50 |
| `farming/LemonChef.sol` | ~250 |
| `games/LemonDice.sol` | ~200 |
| `games/LemonLotto.sol` | ~250 |
| `games/LemonPredict.sol` | ~350 |
| `games/LemonBattles.sol` | ~370 |
| `games/SqueezeRacing.sol` | ~400 |
| `games/Treasury.sol` | ~150 |
| `games/YieldBoostVault.sol` | ~320 |
| `games/EntropyManager.sol` | ~100 |

---

## Findings Summary

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| [H-01] | Emergency withdrawal allows owner to drain all user staked funds | High | Open |
| [M-01] | Stale oracle price can resolve prediction markets incorrectly | Medium | Open |
| [M-02] | Treasury lacks recovery mechanism for accidentally sent tokens | Medium | Open |
| [M-03] | Vault reward calculation can permanently block user claims | Medium | Open |
| [M-04] | Emergency refund logic creates confusing user experience | Medium | Open |
| [L-01] | Unbounded loop in matchmaking can cause DoS | Low | Open |
| [L-02] | Active races array iteration may become expensive | Low | Open |
| [L-03] | LemonChef allows duplicate pool creation | Low | Open |
| [L-04] | Tax rate can be set to 100% allowing seizure of all withdrawals | Low | Open |
| [L-05] | Multiple unbounded arrays never cleaned up | Low | Open |

---

## Findings

### [H-01] Emergency withdrawal allows owner to drain all user staked funds

**Severity:** High

**Impact:** High - Owner can withdraw all staked user funds, causing complete loss of deposits for all users.

**Likelihood:** Medium - Requires malicious or compromised owner, but no on-chain safeguards exist.

**Location:** `games/YieldBoostVault.sol:308`

**Description:**

The `emergencyWithdrawToken` function allows the owner to withdraw ANY ERC20 token from the contract, including the staked token that users have deposited:

```solidity
function emergencyWithdrawToken(address _token, uint256 _amount) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    IERC20(_token).safeTransfer(owner(), _amount);
}
```

This function has no restrictions on which tokens can be withdrawn or how much. The owner can call this with the stake token address and drain the entire contract balance, including all user deposits.

**Attack Scenario:**
1. Users stake 1,000,000 LEMON tokens in the vault
2. Owner calls `emergencyWithdrawToken(lemonToken, 1000000e18)`
3. All user funds are transferred to owner
4. Users cannot withdraw their stakes

**Recommendation:**

Add a check to prevent withdrawing staked tokens beyond available rewards:

```solidity
function emergencyWithdrawToken(address _token, uint256 _amount) external onlyOwner {
    require(_token != address(0), "Invalid token address");

    if (_token == address(token)) {
        uint256 availableToWithdraw = token.balanceOf(address(this)) - totalStaked;
        require(_amount <= availableToWithdraw, "Cannot withdraw staked funds");
    }

    IERC20(_token).safeTransfer(owner(), _amount);
}
```

---

### [M-01] Stale oracle price can resolve prediction markets incorrectly

**Severity:** Medium

**Impact:** High - Markets could be resolved with outdated prices, causing incorrect outcomes and financial losses.

**Likelihood:** Low - Requires oracle to return stale data, which is uncommon but possible.

**Location:** `games/LemonPredict.sol:157`

**Description:**

The contract uses `pyth.getPriceUnsafe()` which returns price data without validating freshness:

```solidity
IPyth.Price memory priceData = pyth.getPriceUnsafe(market.priceId);
```

During periods of high volatility or network congestion, the price data could be significantly outdated, leading to incorrect market resolution.

**Attack Scenario:**
1. Market closes at timestamp T
2. Price at T is $100, but cached oracle price is from T-1 hour showing $95
3. Users who bet "under $97" win incorrectly
4. Legitimate winners based on actual price lose funds

**Recommendation:**

Use `pyth.getPrice()` which validates freshness, or add explicit staleness check:

```solidity
IPyth.Price memory priceData = pyth.getPriceUnsafe(market.priceId);
require(block.timestamp - priceData.publishTime < MAX_PRICE_AGE, "Stale price");
```

---

### [M-02] Treasury lacks recovery mechanism for accidentally sent tokens

**Severity:** Medium

**Impact:** Medium - Tokens sent outside normal game flows could be permanently locked.

**Likelihood:** Medium - Users occasionally send tokens to wrong addresses.

**Location:** `games/Treasury.sol`

**Description:**

The Treasury contract can receive funds via `receive()` but only has withdrawal functions for tracked game tokens. If tokens are accidentally sent directly to the treasury (outside normal game flows), they become permanently locked with no recovery mechanism.

**Recommendation:**

Add a generic token rescue function for non-tracked tokens:

```solidity
function rescueToken(address _token, uint256 _amount) external onlyOwner {
    require(!isTrackedToken[_token], "Use designated withdrawal");
    IERC20(_token).safeTransfer(owner(), _amount);
}
```

---

### [M-03] Vault reward calculation can permanently block user claims

**Severity:** Medium

**Impact:** High - Users cannot claim legitimately earned rewards.

**Likelihood:** Low - Requires vault to become underfunded relative to promised rewards.

**Location:** `games/YieldBoostVault.sol:148`

**Description:**

If `totalRewardsAvailable` is less than a user's accumulated rewards, the claim function reverts:

```solidity
require(totalRewardsAvailable >= rewards, "Insufficient vault rewards");
```

The reward rate continues accumulating based on APR regardless of actual available funds, creating a scenario where users are promised rewards they cannot claim.

**Recommendation:**

Allow partial claims up to available rewards:

```solidity
uint256 claimableAmount = rewards > totalRewardsAvailable ? totalRewardsAvailable : rewards;
require(claimableAmount > 0, "Nothing to claim");
```

---

### [M-04] Emergency refund logic creates confusing user experience

**Severity:** Medium

**Impact:** Low - Poor user experience and failed transactions.

**Likelihood:** Medium - Occurs whenever emergency refund is triggered.

**Location:** `games/LemonPredict.sol:323-333`

**Description:**

When `emergencyRefund` is called, it sets `finalPrice = 0`. However, `claimWinnings` doesn't check for this condition, so users attempt to claim winnings (which fails) before realizing they need to call `claimRefund` instead.

**Recommendation:**

Add a check in `claimWinnings`:

```solidity
function claimWinnings(uint256 marketId) external {
    Market storage market = markets[marketId];
    require(market.resolved, "Market not resolved");
    require(market.finalPrice != 0, "Market was refunded - use claimRefund");
    // ...
}
```

---

### [L-01] Unbounded loop in matchmaking can cause DoS

**Severity:** Low

**Location:** `games/LemonBattles.sol:197-210`

**Description:**

The `_tryMatchmaking` function iterates through all pending entries:

```solidity
for (uint256 i = 0; i < pendingEntryIds.length; i++) {
    // ...
}
```

If the pending queue grows large, gas costs become prohibitively expensive.

**Recommendation:**

Add maximum iteration limit:

```solidity
uint256 maxIterations = pendingEntryIds.length > 100 ? 100 : pendingEntryIds.length;
for (uint256 i = 0; i < maxIterations; i++) {
```

---

### [L-02] Active races array iteration may become expensive

**Severity:** Low

**Location:** `games/SqueezeRacing.sol - _removeFromActive()`

**Description:**

Removing races iterates through the active array. With many concurrent races, this becomes expensive.

**Recommendation:**

Consider limiting maximum concurrent races or using more efficient data structures.

---

### [L-03] LemonChef allows duplicate pool creation

**Severity:** Low

**Location:** `farming/LemonChef.sol`

**Description:**

The `add()` function doesn't check if a staking token already exists, allowing duplicate pools for the same LP token.

**Recommendation:**

Track added tokens and prevent duplicates:

```solidity
mapping(address => bool) public poolExists;

function add(...) external onlyOwner {
    require(!poolExists[_lpToken], "Pool exists");
    poolExists[_lpToken] = true;
    // ...
}
```

---

### [L-04] Tax rate can be set to 100% allowing seizure of all withdrawals

**Severity:** Low

**Location:** `games/YieldBoostVault.sol:285-296`

**Description:**

Owner can set `initialTaxRate` to 100% (10000 basis points), effectively seizing all user withdrawals.

**Recommendation:**

Add a reasonable maximum cap (e.g., 50%):

```solidity
require(_taxRate <= 5000, "Tax rate too high");
```

---

### [L-05] Multiple unbounded arrays never cleaned up

**Severity:** Low

**Location:** Multiple files

**Description:**

Arrays tracking battles, entries, and races grow indefinitely without cleanup, increasing gas costs over time.

**Recommendation:**

Implement periodic cleanup or use mappings with separate counters.

---

## Informational Findings

### [I-01] Centralized VRF Management

The EntropyManager creates a single point of failure for randomness. Consider documenting trust assumptions and planning migration to decentralized VRF.

### [I-02] High Daily Reward Rate Cap

Maximum 10% daily reward rate could deplete rewards rapidly. Consider lower default caps.

### [I-03] DEX Follows Standard Patterns

Positive finding: DEX contracts closely follow well-audited Uniswap V2 implementation.

---

## Security Patterns Observed

### Positive
- Solidity ^0.8.20+ with overflow protection
- ReentrancyGuard on state-changing functions
- SafeERC20 for token transfers
- Proper VRF implementation for randomness
- Commit-reveal pattern in games

### Concerns
- Significant owner control over funds
- Emergency functions too powerful
- Oracle dependency for predictions

---

## Conclusion

The Lemonad Protocol demonstrates solid security practices with proper use of Solidity 0.8.x, reentrancy guards, and VRF randomness. The main concerns are centralization risks in emergency withdrawal functions that could allow complete drainage of user funds.

**We recommend addressing the High severity finding before deployment.**

**Overall Risk Assessment: Medium**

---

*This security review was conducted by Bangkok Audits. For questions or clarifications, contact our team.*
