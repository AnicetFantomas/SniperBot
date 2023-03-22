import { ethers } from "ethers";

const signer = new ethers.Wallet(process.env.PRIVATE_KEY!)
const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC, 56);
const account = signer.connect(provider);

function toHex(currencyAmount: any) {
    if (currencyAmount.toString().includes("e")) {
        let hexedAmount = (currencyAmount).toString(16)

        return `0x${hexedAmount}`
    } else {
        let parsedAmount = parseInt(currencyAmount)
        let hexedAmount = (parsedAmount).toString(16)
        return `0x${hexedAmount}`
    }
}

const pancakeSwap = new ethers.Contract(
    "0x10ed43c718714eb63d5aa57b78b54704e256024e",
    [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
    ],
    account
);

const WALLLET_ADDRESS = process.env.WALLET_ADDRESS!;
const walletAddress = ethers.utils.getAddress(WALLLET_ADDRESS)


 export const swapExactETHForTokens = async (amountOutMin: number, bnbAmount: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {
    try {

        console.log("\n\n==================== swapExactETHForTokens =====================");

        // Convert amount to toHex
        let value = toHex(bnbAmount)

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n\n amountOutMin: ${amountOutMin}, \n\nValue : ${value} \nto: ${WALLLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline},`);

        const tx = await pancakeSwap.swapExactETHForTokens(
            toHex(amountOutMin),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                value,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** BUY ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("*****************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapExactETHForTokens:  ====> ", error);

        return { success: false, data: `${error}` };
    }
}