import { pancakeSwapContract, approveContract } from "./utils/index";
import { config } from "./config/config";
import { overLoads } from "./types/index";

export async function swapExactETHForTokensSupportingFeeOnTransferTokens(_params: { amountOutMin: number, bnbAmount: number, path: Array<string>, overLoads: overLoads }): Promise<any> {

    const { amountOutMin, bnbAmount, path, overLoads } = _params;

    try {

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        const contract = pancakeSwapContract();

        const tx = await contract.callStatic.swapExactETHForTokensSupportingFeeOnTransferTokens(amountOutMin, path, config.PUBLIC_KEY, deadline, overLoads);

        console.log("**".repeat(20));
        console.log("******BUY TRANSACTION**********", tx.hash)
        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log(`Error swapExactETHForTokensSupportingFeeOnTransferTokens`, error);
    }

}

export async function approve(_params: { tokenAddress: string, overLoads: overLoads }): Promise<any> {

    const { tokenAddress, overLoads } = _params;

    try {

        const MAX_INT = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

        const contract = await approveContract(tokenAddress);



        const tx = await contract.callStatic.approve(config.PANCAKESWAP_ROUTER, MAX_INT, overLoads);

        console.log("**".repeat(20));
        console.log("******APPROVE TRANSACTION********", tx.hash)
        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log(`Error approve`, error);
    }
}

export async function swapExactTokensForETHSupportingFeeOnTransferTokens(_params: { amountIn: number, amountOutMin: number, path: Array<string>, overLoads: overLoads }): Promise<any> {

    const { amountIn, amountOutMin, path, overLoads } = _params;

    try {

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        const contract = await pancakeSwapContract();

        const tx = await contract.callStatic.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, config.PUBLIC_KEY, deadline, overLoads);

        console.log("**".repeat(20));
        console.log("******SELL TRANSACTION********", tx.hash)
        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log(`Error swapExactTokensForETHSupportingFeeOnTransferTokens`, error);
    }
}
