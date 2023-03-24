import { constants, Contract, ethers, providers, utils, Wallet } from "ethers";
import { config } from "./config/config";
import { PANCAKESWAP_ABI } from "./constants/pancakeswap";
import { calculateTax, isVerified, getNonce } from "./utils/index";
import {
  swapExactETHForTokensSupportingFeeOnTransferTokens,
  approve,
} from "./buy";

const wsprovider = new providers.WebSocketProvider(config.WSS_URL);
const pancakeSwap = new ethers.utils.Interface(PANCAKESWAP_ABI);
const provider = new providers.JsonRpcProvider(config.JSON_RPC);

const contract = new Contract(
  config.PANCAKESWAP_ROUTER,
  PANCAKESWAP_ABI,
  new Wallet(config.PRIVATE_KEY, provider)
);

export const monitorMempool = async () => {
    // mempool monitoring
    wsprovider.on('pending', async (txHash: string) => {
        try {
            let receipt = await wsprovider.getTransaction(txHash);

            receipt?.hash && process(receipt);
        } catch (error) {
            console.error(`Error`, error);
        }
    });
};

const process = async (receipt: providers.TransactionResponse) => {
  let {
    to: router,
    gasPrice: targetGasPriceInWei,
    gasLimit: targetGasLimit,
    hash: targetHash,
    from: targetFrom,
  } = receipt;

  //check for supported routers

  if (
    router &&
    config.SUPPORTED_ROUTERS.some(
      (router) => router?.toLowerCase() === receipt.to?.toLowerCase()
    )
  ) {
    let tokensToMonitor = config.TOKENS_TO_MONITOR.map((token: string) =>
      token.toLowerCase()
    );

    try {
      // decode transaction data
      const txData = pancakeSwap.parseTransaction({
        data: receipt.data,
      });

      //desctructure transaction  data to get methodeName
      let { name: targetMethodName, args: targetArgs } = txData;

      let { path } = targetArgs;

      let targetToToken = path[path.length - 1];
      let gasPrice = utils.formatUnits(targetGasPriceInWei!.toString());

      //if the path is undefined stop execution and return
      if (!path) return;

      console.info({
        targetMethodName,
        path,
        gasPrice,
        targetHash,
        targetFrom,
      });

      //preprare simulation data

      let SwapAmountIn = utils.parseEther("0.0001");
      let swapRouter = config.PANCAKESWAP_ROUTER;
      let swapPath = [config.WBNB_ADDRESS, targetToToken];

      //check if the token is a scam token or not [BuyTax, sellTax]
      let { buyTax, sellTax } = await calculateTax({
        swapRouter,
        swapPath,
        SwapAmountIn,
      });

      console.log("BUY TAX", buyTax, "SELL TAX", sellTax);

      if (targetMethodName.startsWith("addLiquidity")) {
        let tokenToBuy;
        let tokenA = targetArgs.tokenA;
        let tokenB = targetArgs.tokenB;

        if (tokensToMonitor.includes(tokenA.toLowerCase())) {
          tokenToBuy = tokenA;
        } else if (tokensToMonitor.includes(tokenB.toLowerCase())) {
          tokenToBuy = tokenB;
        }
        if (tokenToBuy) {
          const verifyToken = await isVerified(tokenToBuy);

          //check if the token is a scam token or not [BuyTax, sellTax]
          let { buyTax, sellTax } = await calculateTax({
            swapRouter,
            swapPath,
            SwapAmountIn,
          });
          console.log("BUY TAX", buyTax, "SELL TAX", sellTax);

          if (verifyToken) {
            if (parseInt(buyTax) <= config.MINIMUM_BUY_TAX) {
              //TODO execute a buy order for the token

              const path = [config.WBNB_ADDRESS, tokenToBuy];

              const nonce = await getNonce();

              let overLoads: any = {
                gasLimit: targetGasLimit,
                gasPrice: gasPrice,
                nonce: nonce!,
              };

              let buyTx =
                await swapExactETHForTokensSupportingFeeOnTransferTokens({
                  amountOutMin: 0,
                  bnbAmount: config.BNB_BUY_AMOUNT,
                  path: path,
                  overLoads: overLoads,
                });

              if (buyTx.sucess == true) {
                //get confrimation receipt before approving
                const receipt = await provider.getTransactionReceipt(
                  buyTx.data
                );

                if (receipt && receipt.status == 1) {
                  overLoads["nonce"] += 1;
                  //approving the tokens
                  await approve({
                    tokenAddress: tokenToBuy,
                    overLoads: overLoads,
                  });

                  console.log("WAITING FOR SELLING");
                }
              }
            }
          }
        }
      } else if (targetMethodName.startsWith("addLiquidityETH")) {
        let tokenToBuy = targetArgs.token;

        if (tokenToBuy) {
          //check if token is verified
          const verifyToken = await isVerified(tokenToBuy);

          //check if the token is a scam token or not [BuyTax, sellTax]
          let { buyTax, sellTax } = await calculateTax({
            swapRouter,
            swapPath,
            SwapAmountIn,
          });

          if (verifyToken) {
            if (
              parseInt(buyTax) <= config.MINIMUM_BUY_TAX &&
              parseInt(sellTax) <= config.MINIMUM_SELL_TAX
            ) {
              // execute a buy order for the token

              const path = [config.WBNB_ADDRESS, tokenToBuy];
              const nonce = await getNonce();

              let overLoads: any = {
                gasLimit: targetGasLimit,
                gasPrice: gasPrice,
                nonce: nonce!,
              };

              let buyTx =
                await swapExactETHForTokensSupportingFeeOnTransferTokens({
                  amountOutMin: 0,
                  bnbAmount: config.BNB_BUY_AMOUNT,
                  path: path,
                  overLoads: overLoads,
                });

              if (buyTx.sucess == true) {
                //get confrimation receipt before approving
                const receipt = await provider.getTransactionReceipt(
                  buyTx.data
                );

                if (receipt && receipt.status == 1) {
                  overLoads["nonce"] += 1;

                  //approving the tokens
                  await approve({
                    tokenAddress: tokenToBuy,
                    overLoads: overLoads,
                  });

                  console.log("WAITING FOR SELLING");
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`Error, ${error}`);
    }
  }
};
