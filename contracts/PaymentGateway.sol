// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./PaymentReceipt.sol";

contract PaymentGateway is ReentrancyGuard {
    IERC20 public paymentToken;
    PaymentReceipt public paymentReceipt;
    IUniswapV2Router02 public uniswapRouter;
    address public feeAddress;
    uint256 public feeBasisPoints;
    uint256 public constant TOKEN_PRICE_IN_USD = 15 * 10**16; // 0.15 USD per token

    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        bool isCompleted;
    }

    mapping(bytes32 => Payment) public payments;

    event PaymentCreated(bytes32 indexed paymentId, address payer, address payee, uint256 amount);
    event PaymentCompleted(bytes32 indexed paymentId, uint256 fee, uint256 cashback, string metadataURI);

    constructor(
        address _paymentToken,
        address _paymentReceipt,
        address _uniswapRouter,
        address _feeAddress,
        uint256 _feeBasisPoints
    ) {
        paymentToken = IERC20(_paymentToken);
        paymentReceipt = PaymentReceipt(_paymentReceipt);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        feeAddress = _feeAddress;
        feeBasisPoints = _feeBasisPoints;
    }

    function getLatestPrice(address priceFeed) public view returns (uint256) {
        AggregatorV3Interface aggregator = AggregatorV3Interface(priceFeed);
        (, int256 price, , , ) = aggregator.latestRoundData();
        require(price > 0, "Invalid price data");
        return uint256(price);
    }

    function calculateCashback(uint256 amount) public pure returns (uint256) {
        if (amount < 100 * 10**18) {
            return (amount * 1) / 100;
        } else if (amount < 1000 * 10**18) {
            return (amount * 2) / 100;
        } else {
            return (amount * 3) / 100;
        }
    }

    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * feeBasisPoints) / 10000;
    }

    function updateFeeBasisPoints(uint256 newFeeBasisPoints) external {
        require(msg.sender == feeAddress, "Only feeAddress can update the fee");
        require(newFeeBasisPoints <= 100, "Fee too high");
        feeBasisPoints = newFeeBasisPoints;
    }

    function createPayment(address payee, uint256 amount, string memory ipfsURI) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        require(paymentToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, payee, block.timestamp, ipfsURI));
        payments[paymentId] = Payment(msg.sender, payee, amount, false);

        paymentReceipt.safeMint(msg.sender, ipfsURI);

        emit PaymentCreated(paymentId, msg.sender, payee, amount);
    }

    function confirmPayment(bytes32 paymentId, string memory metadataURI) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(msg.sender == payment.payee, "Not authorized");
        require(!payment.isCompleted, "Payment already completed");

        uint256 fee = calculateFee(payment.amount);
        uint256 cashback = calculateCashback(payment.amount);
        uint256 netAmount = payment.amount - fee;

        require(paymentToken.transfer(payment.payee, netAmount), "Payment transfer failed");
        require(paymentToken.transfer(feeAddress, fee), "Fee transfer failed");
        require(paymentToken.transfer(payment.payer, cashback), "Cashback transfer failed");

        payment.isCompleted = true;
        emit PaymentCompleted(paymentId, fee, cashback, metadataURI);
    }

    function convertTokenAmount(
        uint256 amountIn, 
        address token1Feed, 
        address token2Feed
    ) public view returns (uint256) {
        uint256 price1 = getLatestPrice(token1Feed);
        uint256 price2 = getLatestPrice(token2Feed);
        return (amountIn * price1) / price2;
    }

    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        address priceFeedIn,
        address priceFeedOut,
        address to
    ) external {
        uint256 amountOutMin = convertTokenAmount(amountIn, priceFeedIn, priceFeedOut);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(uniswapRouter), amountIn);

        uniswapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            block.timestamp + 300
        );
    }

    function buyPAYWithUSD(address usdToken, uint256 usdAmount) external nonReentrant {
        require(usdAmount > 0, "Amount must be > 0");
        require(IERC20(usdToken).transferFrom(msg.sender, address(this), usdAmount), "USD transfer failed");

        uint256 payAmount = (usdAmount * 10**18) / TOKEN_PRICE_IN_USD;
        require(paymentToken.transfer(msg.sender, payAmount), "PAY transfer failed");
    }
} 
