import axios from "axios";
import { Contract, providers, Wallet } from 'ethers';
import { config } from "../config/config";
import { PANCAKESWAP_ABI, RUG_CHECKER_ABI } from "../constants/index";


const provider =  new providers.JsonRpcProvider(config.JSON_RPC);
const signer = new Wallet(config.PRIVATE_KEY, provider)

export const pancakeSwapContract = () => {
    return new Contract(config.PANCAKESWAP_ROUTER, PANCAKESWAP_ABI, signer);
}

export const approveContract = async (tokenAddress: string) => {
    return new Contract(tokenAddress,
        ["function approve(address _spender, uint256 _value) public returns (bool success)"], signer);
}

const parseError = (error: any) => {
    let msg = '';
    try {
        error = JSON.parse(JSON.stringify(error));
        msg =
            error?.error?.reason ||
            error?.reason ||
            JSON.parse(error)?.error?.error?.response?.error?.message ||
            error?.response ||
            error?.message ||
            error;
    } catch (_error: any) {
        msg = error;
    }

    return msg;
};

const simulationContract = () => {
    return new Contract(
        config.RUGCHECKER_CONTRACT,
        RUG_CHECKER_ABI,
        signer);
}

export const calculateTax = async (_params: { swapRouter: string, swapPath: Array<string>, SwapAmountIn: any }):
        Promise<{ buyTax: any | undefined, sellTax: any | undefined }> => {

        const { swapRouter, swapPath, SwapAmountIn } = _params;

        try {

            const simulate = simulationContract();

            const response = await simulate.callStatic.screen(swapRouter, swapPath, SwapAmountIn, {
                gasLimit: 1000000,
            });

            // const { estimatedBuy, actualBuy, estimatedSell, actualSell, buyGas, sellGas, token } = response;

            const estimatedBuy = parseInt(response.estimatedBuy);
            const actualBuy = parseInt(response.actualBuy);
            const estimatedSell = parseInt(response.estimatedSell);
            const actualSell = parseInt(response.actualSell);
            const buyGas = parseInt(response.buyGas);
            const sellGas = parseInt(response.sellGas);

            const token = response.token;

            let buyTax, sellTax;

            console.log({ estimatedBuy, actualBuy, estimatedSell, actualSell, sellGas, buyGas, token });

            if (estimatedBuy > actualBuy) {

                buyTax = ((estimatedBuy - actualBuy) / ((estimatedBuy + actualBuy) / 2)) * 100;
            }

            if (estimatedSell > actualSell) {

                sellTax = ((estimatedSell - actualSell) / ((estimatedSell + actualSell) / 2)) * 100;

            }

            return { buyTax, sellTax };

        } catch (error) {

            error = parseError(error);
            console.log('Error calculating tax', error);
            return { buyTax: 0, sellTax: 0 };

        }
    }

   export const isVerified = async (contractAddress: string) => {
        try {
            const data = await axios.get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${config.BSCSCAN_API_KEY}`);

            const { status, message } = data.data;

            if (status === '1') {

                console.log('Messafe for contract  verification: ', message);
                return true;
            } else {
                console.log('Token  contract  verification Failed: ', message);
            }


        } catch (error) {
            error = parseError(error);
            console.log('Error checking if token is verified', error);
        }

    }

   export const getNonce = async () => {
        try {
            return await provider.getTransactionCount(config.PUBLIC_KEY);

        } catch (error) {
            console.log('Could not fetch wallet Nonce', error);
        }
    }

