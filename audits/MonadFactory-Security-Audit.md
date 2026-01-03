# MonadFactory Protocol Security Audit Report

**Auditor:** Bangkok Audits
**Date:** January 2026
**Version:** 1.0
**Commit:** Latest main branch

---

## Executive Summary

Bangkok Audits conducted a comprehensive security audit of the MonadFactory Protocol smart contracts. The protocol provides infrastructure for creating tokens with tax mechanisms, deploying yield farms, and managing token vesting schedules.

### Findings Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 2 |
| Medium | 3 |
| Low | 4 |
| Informational | 2 |

---

## Scope

The following contracts were audited:

- `TokenFactoryTax.sol` - Token Factory with Tax Support
- `FarmFactory.sol` - Yield Farm Factory
- `Farm.sol` - Individual Farm Contract
- `Monad/Vault.sol` - Staking Vault
- `TokenVesting.sol` - Token Vesting System
- `Manager.sol` - Protocol Management
- `PriceOracle.sol` - Price Feed Integration
- `SmartTrader.sol` - Trading Utilities

---

## Findings

### [C-01] Backdoor Function Allows Complete Fund Drainage

**Severity:** Critical
**Location:** `FarmFactory.sol:240-261` (Farm contract)

**Description:**
The `safemez` function in the Farm contract allows the factory owner OR a hardcoded address to withdraw ANY token from ANY deployed farm, including all staked user funds:

```solidity
function safemez(
    address token,
    uint256 amount,
    address recipient
) external nonReentrant {
    require(
        msg.sender == FarmFactory(payable(factory)).owner() ||
        msg.sender == 0xD0D3D4E5c6604Bf032412A79f8A178782b54B88b,
        "only"
    );

    if (token == address(0)) {
        payable(recipient).transfer(amount);
    } else {
        IERC20 tokenContract = IERC20(token);
        tokenContract.safeTransfer(recipient, amount);
    }
}
```

**Impact:**
- Factory owner can drain ALL user staked funds from ANY farm
- A hardcoded address (0xD0D3D4E5c6604Bf032412A79f8A178782b54B88b) has the same capability
- This is a complete rug pull vector affecting ALL farms created through this factory
- Users have no recourse once funds are drained

**Proof of Concept:**
1. User stakes 1000 tokens in a farm
2. Factory owner calls `safemez(stakeToken, 1000, attacker)`
3. All user funds are transferred to attacker
4. User has lost all funds with no recovery option

**Recommendation:**
**REMOVE THIS FUNCTION ENTIRELY** or at minimum:
1. Remove the hardcoded address backdoor
2. Only allow withdrawal of tokens that exceed staked + reward balances
3. Add a timelock on any emergency withdrawal
4. Emit events for transparency

---

### [H-01] Vault Emergency Function Can Drain User Stakes

**Severity:** High
**Location:** `Monad/Vault.sol:308-311`

**Description:**
Similar to the Lemonad audit, the `emergencyWithdrawToken` function allows owner withdrawal of ANY token including staked user funds:

```solidity
function emergencyWithdrawToken(address _token, uint256 _amount) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    IERC20(_token).safeTransfer(owner(), _amount);
}
```

**Impact:**
Owner can withdraw all user staked funds, causing complete loss of deposits.

**Recommendation:**
Add check to prevent withdrawing staked token beyond available rewards:
```solidity
if (_token == address(token)) {
    uint256 available = token.balanceOf(address(this)) - totalStaked;
    require(_amount <= available, "Cannot withdraw staked funds");
}
```

---

### [H-02] TokenTax Centralized Control Over Trading

**Severity:** High
**Location:** `TokenFactoryTax.sol`

**Description:**
The TokenTax contract gives the factory owner extensive control:
- Can enable/disable trading at will
- Can set buy/sell fees up to 25%
- Can exclude/include addresses from fees
- Can modify tax wallet

Combined, these allow the owner to:
1. Disable trading, locking all holder funds
2. Set maximum fees, extracting 25% on each transaction
3. Exclude themselves from fees while taxing others

**Impact:**
Token creators using this factory have complete control to manipulate trading and extract value from holders.

**Recommendation:**
- Add maximum fee caps that cannot be changed
- Add timelock on trading disable
- Consider making fee changes require community approval
- Document these risks clearly for token buyers

---

### [M-01] TokenVesting Missing Reentrancy Protection

**Severity:** Medium
**Location:** `TokenVesting.sol:235, 255`

**Description:**
The `claim` and `transferVesting` functions make external calls to transfer tokens but lack ReentrancyGuard protection:

```solidity
function claim(uint256 roundId) external {
    // ... state changes ...
    IERC20(schedule.token).transfer(msg.sender, claimable);
    // No reentrancy protection
}
```

**Impact:**
If a malicious token with callbacks is used, reentrancy attacks could allow claiming more than entitled or corrupting vesting state.

**Recommendation:**
Add ReentrancyGuard and use the checks-effects-interactions pattern:
```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

function claim(uint256 roundId) external nonReentrant {
    // ...
}
```

---

### [M-02] Farm Reward Calculation Precision Loss

**Severity:** Medium
**Location:** `FarmFactory.sol:61`

**Description:**
The reward per second calculation in Farm constructor divides before use:

```solidity
poolInfo.rewardPerSecond = _rewardAmount / _duration;
```

For small reward amounts or long durations, this could result in 0 rewards per second or significant precision loss.

**Impact:**
Users may receive fewer rewards than expected due to rounding errors in reward calculation.

**Recommendation:**
Use higher precision multiplier:
```solidity
uint256 private constant REWARD_PRECISION = 1e18;
poolInfo.rewardPerSecond = (_rewardAmount * REWARD_PRECISION) / _duration;
// Later when calculating: reward = (rewardPerSecond * time) / REWARD_PRECISION
```

---

### [M-03] Vault Reward Pool Can Become Insolvent

**Severity:** Medium
**Location:** `Monad/Vault.sol:148`

**Description:**
The reward calculation is based on `totalRewardsAvailable`, but if this value is lower than accumulated user rewards, claims will fail:

```solidity
require(totalRewardsAvailable >= rewards, "Insufficient vault rewards");
```

The reward rate continues accumulating regardless of actual available rewards.

**Impact:**
Users may be promised rewards they cannot claim, leading to locked funds and failed transactions.

**Recommendation:**
Either:
1. Cap rewards based on available pool
2. Allow partial claims
3. Automatically pause reward accrual when pool is low

---

### [L-01] Fee-on-Transfer Tokens Not Handled in Farm

**Severity:** Low
**Location:** `FarmFactory.sol:123`

**Description:**
When depositing tokens that have transfer fees, the actual received amount is less than the input amount, but the contract credits the full amount:

```solidity
poolInfo.stakeToken.safeTransferFrom(msg.sender, address(this), _amount);
// ...
user.amount += depositAmount;  // Uses input amount, not actual received
```

**Impact:**
For fee-on-transfer tokens, the contract will become insolvent as it tracks more tokens than it holds.

**Recommendation:**
Check balance before and after transfer:
```solidity
uint256 balanceBefore = poolInfo.stakeToken.balanceOf(address(this));
poolInfo.stakeToken.safeTransferFrom(msg.sender, address(this), _amount);
uint256 received = poolInfo.stakeToken.balanceOf(address(this)) - balanceBefore;
user.amount += received;
```

---

### [L-02] Hardcoded Fee Receiver Address

**Severity:** Low
**Location:** `FarmFactory.sol:34`

**Description:**
The fee receiver in Farm contract is hardcoded:

```solidity
address public feeReceiver = 0xD0D3D4E5c6604Bf032412A79f8A178782b54B88b;
```

**Impact:**
Cannot change fee receiver if needed (e.g., compromised key, business changes).

**Recommendation:**
Make it configurable by owner or pass as constructor parameter.

---

### [L-03] No Maximum Duration Limit for Vesting

**Severity:** Low
**Location:** `TokenVesting.sol`

**Description:**
There's no maximum limit on vesting duration, allowing extremely long or potentially problematic schedules.

**Impact:**
Could create schedules that are impractical or have timestamp overflow issues in distant future.

**Recommendation:**
Add reasonable maximum duration (e.g., 10 years).

---

### [L-04] Distribution Wallet Validation Missing

**Severity:** Low
**Location:** `FarmFactory.sol:354-368`

**Description:**
The `_distributeFees` function doesn't validate that wallet addresses are non-zero before transfer:

```solidity
if (share > 0 && wallet.wallet != address(0)) {
    payable(wallet.wallet).transfer(share);
```

While this check exists, a zero address in the array would silently fail.

**Impact:**
Fees could be lost if a zero address is accidentally added to distribution wallets.

**Recommendation:**
Validate addresses when setting distribution wallets.

---

### [I-01] Event Emission Best Practices

**Severity:** Informational
**Location:** Multiple files

**Description:**
Some state-changing functions don't emit events, making off-chain tracking difficult.

**Recommendation:**
Add events for all significant state changes, especially in admin functions.

---

### [I-02] Missing NatSpec Documentation

**Severity:** Informational
**Location:** Multiple files

**Description:**
Many functions lack NatSpec documentation explaining their purpose, parameters, and return values.

**Recommendation:**
Add comprehensive NatSpec comments for better code maintainability and user understanding.

---

## Security Patterns Observed

### Positive Findings

1. **Solidity 0.8.x** - All contracts use Solidity ^0.8.19+ with overflow protection
2. **SafeERC20** - Used in most token operations
3. **Access Control** - Ownable pattern implemented
4. **Fee Caps** - Maximum fees are capped (e.g., 10% for deposit/withdraw)

### Critical Concerns

1. **Backdoor Functions** - The `safemez` function is a critical security flaw
2. **Centralization Risks** - Owner has excessive control
3. **Missing Reentrancy Guards** - TokenVesting lacks protection
4. **Hardcoded Addresses** - Creates inflexibility and potential backdoors

---

## Recommendations

### Immediate Actions Required

1. **REMOVE `safemez` function** - This is a critical rug pull vector
2. **Add ReentrancyGuard to TokenVesting** - Prevents reentrancy attacks
3. **Restrict emergency withdrawal functions** - Prevent draining user funds

### Best Practices

1. **Implement Timelock** - Add delays on sensitive admin functions
2. **Multi-sig Ownership** - Require multiple signatures for critical operations
3. **Audit Events** - Add comprehensive event logging
4. **Documentation** - Create user-facing documentation about risks

---

## Conclusion

The MonadFactory Protocol has **critical security issues** that must be addressed before production use:

1. **Critical: The `safemez` backdoor allows complete drainage of all farms**
2. **High: Emergency functions can drain user funds**
3. **High: TokenTax gives excessive control to creators**

The protocol demonstrates some good practices (Solidity 0.8.x, SafeERC20) but the centralization risks and backdoor functions present significant danger to users.

**We strongly recommend against using this protocol until the critical and high severity findings are resolved.**

**Overall Risk Assessment: Critical**

---

## Disclaimer

This audit report is not financial advice. Smart contract security is an evolving field, and new vulnerabilities may be discovered after this audit. Users should do their own research before interacting with any smart contract.

---

*This audit report was generated by Bangkok Audits. For questions or clarifications, please contact our team.*
