# Lemonad Protocol Security Audit Report

**Auditor:** Bangkok Audits
**Date:** January 2026
**Version:** 1.0
**Commit:** Latest main branch

---

## Executive Summary

Bangkok Audits conducted a comprehensive security audit of the Lemonad Protocol smart contracts. The protocol consists of a DEX (Uniswap V2 fork), gaming contracts (Dice, Lotto, Predict, Battles, Racing), yield farming (LemonChef), and treasury management.

### Findings Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 4 |
| Low | 5 |
| Informational | 3 |

---

## Scope

The following contracts were audited:

- `LeMonad.sol` - ERC20 Token
- `dex/LemonRouter.sol` - DEX Router
- `dex/LemonPair.sol` - LP Token / AMM
- `dex/LemonFactory.sol` - Pair Factory
- `dex/FeeCollector.sol` - Fee Management
- `dex/WMON.sol` - Wrapped MON
- `farming/LemonChef.sol` - Yield Farming
- `games/LemonDice.sol` - Dice Game
- `games/LemonLotto.sol` - Lottery Game
- `games/LemonPredict.sol` - Prediction Markets
- `games/LemonBattles.sol` - PvP Battles
- `games/SqueezeRacing.sol` - Racing Game
- `games/Treasury.sol` - Treasury Management
- `games/YieldBoostVault.sol` - Staking Vault
- `games/EntropyManager.sol` - VRF Manager

---

## Findings

### [H-01] Emergency Withdrawal Can Drain User Funds

**Severity:** High
**Location:** `games/YieldBoostVault.sol:308`

**Description:**
The `emergencyWithdrawToken` function allows the owner to withdraw ANY ERC20 token from the contract, including the staked token that users have deposited.

```solidity
function emergencyWithdrawToken(address _token, uint256 _amount) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    IERC20(_token).safeTransfer(owner(), _amount);
}
```

**Impact:**
The contract owner can withdraw all staked user funds at any time, resulting in complete loss of user deposits. This is a centralization/rug pull risk.

**Recommendation:**
Either remove this function or add a check that prevents withdrawing more than `totalRewardsAvailable`:
```solidity
if (_token == address(token)) {
    require(_amount <= totalRewardsAvailable, "Cannot withdraw staked funds");
}
```

---

### [M-01] Stale Oracle Price in LemonPredict

**Severity:** Medium
**Location:** `games/LemonPredict.sol:157`

**Description:**
The contract uses `pyth.getPriceUnsafe()` which doesn't validate price freshness. A stale price could be used to resolve markets incorrectly.

```solidity
IPyth.Price memory priceData = pyth.getPriceUnsafe(market.priceId);
```

**Impact:**
Markets could be resolved with outdated prices, leading to incorrect outcomes and financial losses for users who bet correctly based on actual market conditions.

**Recommendation:**
Use `pyth.getPrice()` which validates price freshness, or add a staleness check:
```solidity
require(block.timestamp - priceData.publishTime < MAX_PRICE_AGE, "Stale price");
```

---

### [M-02] Treasury Has No Fund Recovery Mechanism

**Severity:** Medium
**Location:** `games/Treasury.sol`

**Description:**
The Treasury contract can receive funds via `receive()` but the owner controls all distributions. If tokens are accidentally sent to the treasury that aren't tracked, they could become permanently locked.

**Impact:**
Tokens accidentally sent to Treasury (outside normal game flows) may become unrecoverable.

**Recommendation:**
Add a generic token rescue function for non-tracked tokens, or ensure all receivable tokens have withdrawal mechanisms.

---

### [M-03] YieldBoostVault Reward Calculation Can Block Claims

**Severity:** Medium
**Location:** `games/YieldBoostVault.sol:148`

**Description:**
If `totalRewardsAvailable` is less than a user's earned rewards, the `claimRewards` function will revert:

```solidity
require(totalRewardsAvailable >= rewards, "Insufficient vault rewards");
```

**Impact:**
Users may be unable to claim legitimately earned rewards if the vault becomes underfunded, even though the rewards were promised based on the reward rate.

**Recommendation:**
Allow users to claim up to the available rewards, or implement a queue system for claims when funds are low.

---

### [M-04] LemonPredict Emergency Refund Logic Flaw

**Severity:** Medium
**Location:** `games/LemonPredict.sol:323-333`

**Description:**
The `emergencyRefund` function sets `finalPrice = 0` to indicate a refund market. However, `claimWinnings` doesn't check for this condition, so users on the winning side could still try to claim (and fail) before realizing they need to call `claimRefund`.

**Impact:**
Poor user experience and potential confusion during emergency refund situations.

**Recommendation:**
Modify `claimWinnings` to detect refund markets and revert with a clear message directing users to `claimRefund`.

---

### [L-01] DoS Vector in LemonBattles Matchmaking

**Severity:** Low
**Location:** `games/LemonBattles.sol:197-210`

**Description:**
The `_tryMatchmaking` function iterates through all pending entries. If the pending queue grows large, this could become prohibitively expensive.

```solidity
for (uint256 i = 0; i < pendingEntryIds.length; i++) {
    // ...
}
```

**Impact:**
Gas costs could become extremely high, potentially causing transactions to fail if the queue grows too large.

**Recommendation:**
Implement a maximum iteration limit or use a more efficient matching algorithm (e.g., price-ordered queues).

---

### [L-02] DoS Vector in SqueezeRacing Active Races Array

**Severity:** Low
**Location:** `games/SqueezeRacing.sol - _removeFromActive()`

**Description:**
Similar to L-01, iterating through active races array could become expensive with many concurrent races.

**Impact:**
High gas costs when removing races from the active array.

**Recommendation:**
Use swap-and-pop pattern (which is implemented) but consider limiting maximum concurrent races.

---

### [L-03] LemonChef Missing Duplicate Pool Check

**Severity:** Low
**Location:** `farming/LemonChef.sol`

**Description:**
The `add()` function doesn't check if a staking token already exists, allowing duplicate pools with the same LP token.

**Impact:**
Could cause confusion and split liquidity if the same LP token is added multiple times.

**Recommendation:**
Add a mapping to track added tokens and prevent duplicates.

---

### [L-04] YieldBoostVault Tax Rate Can Be Set Very High

**Severity:** Low
**Location:** `games/YieldBoostVault.sol:285-296`

**Description:**
The owner can set `initialTaxRate` up to 100% (10000 basis points), effectively allowing seizure of all user withdrawals.

**Impact:**
Users could lose all funds on withdrawal if owner sets malicious tax rate.

**Recommendation:**
Consider adding a reasonable maximum (e.g., 90% initial tax is already quite high).

---

### [L-05] Unbounded Array Growth in Multiple Contracts

**Severity:** Low
**Location:** Multiple files

**Description:**
Several contracts use unbounded arrays for tracking (player battles, pending entries, etc.) that are never cleaned up.

**Impact:**
Over time, gas costs for operations involving these arrays will increase.

**Recommendation:**
Implement array cleanup mechanisms or use alternative data structures.

---

### [I-01] Centralized VRF Management

**Severity:** Informational
**Location:** `games/EntropyManager.sol`

**Description:**
The VRF system is centralized through the EntropyManager. While this simplifies integration, it introduces a single point of failure.

**Recommendation:**
Document this trust assumption clearly and consider future migration to decentralized VRF.

---

### [I-02] High Daily Reward Rate Cap

**Severity:** Informational
**Location:** `games/YieldBoostVault.sol:279`

**Description:**
The maximum daily reward rate of 10% (1000 basis points) could deplete the reward pool very quickly.

**Recommendation:**
Consider a lower cap to ensure sustainable rewards.

---

### [I-03] DEX Contracts Follow Standard Uniswap V2 Pattern

**Severity:** Informational
**Location:** `dex/*`

**Description:**
The DEX contracts closely follow the well-audited Uniswap V2 implementation, which is a positive security indicator.

---

## Security Patterns Observed

### Positive Findings

1. **Solidity 0.8.x** - All contracts use Solidity ^0.8.20+ with built-in overflow protection
2. **ReentrancyGuard** - Properly implemented on all state-changing functions
3. **SafeERC20** - Used consistently for token transfers
4. **Access Control** - Ownable pattern properly implemented
5. **VRF for Randomness** - Games use proper VRF implementation (not block-based randomness)
6. **Commit-Reveal Pattern** - Dice and lottery use proper commit-reveal to prevent manipulation

### Areas of Concern

1. **Centralization Risks** - Owner has significant control over funds and parameters
2. **Emergency Functions** - Some emergency functions are too powerful
3. **Oracle Dependency** - Prediction markets depend on Pyth oracle reliability

---

## Recommendations

1. **Implement Timelock** - Add a timelock on sensitive admin functions
2. **Multi-sig Ownership** - Transfer ownership to a multi-sig wallet
3. **Rate Limiting** - Add rate limits on parameter changes
4. **Documentation** - Document all trust assumptions and admin capabilities
5. **Monitoring** - Implement event monitoring for suspicious activity

---

## Conclusion

The Lemonad Protocol demonstrates solid security practices with proper use of Solidity 0.8.x, reentrancy guards, and safe token handling. The main concerns are centralization risks in the emergency withdrawal functions. We recommend implementing the suggested fixes, particularly for the high-severity finding in YieldBoostVault.

The gaming contracts use proper VRF randomness, which is commendable and prevents common gambling contract exploits. The DEX follows battle-tested Uniswap V2 patterns.

**Overall Risk Assessment: Medium**

---

*This audit report was generated by Bangkok Audits. For questions or clarifications, please contact our team.*
