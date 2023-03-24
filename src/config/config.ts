
import 'dotenv/config';

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        'PRIVATE_KEY is not defined and must be set in the .env file'
    );
}


export const config = {

    //conatains a list of tokens to monitor for addLiquidity
    TOKENS_TO_MONITOR: [
        "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"
    ],

    /**
     * @description List og th users to send notifications to
     */
    TG_USERS_ID: [],

    /**
     * @description PRIVATE_KEY is the private key of the account that will be used to sign transactions
     */
    PRIVATE_KEY: process.env.PRIVATE_KEY!,
    /**
     * @description JSON RPC endpoint
     * @type {string}
     */
    JSON_RPC: process.env.JSON_RPC!,

    /**
     * @description WSS_URL is the websocket endpoint of the WSS  endpoint
     */

    WSS_URL: process.env.WSS_URL!,

    /**
     * @description BSC_SCAN_API_KEY provided by bscscan
     */
    BSCSCAN_API_KEY: process.env.BSCSCAN_API_KEY!,

    /**
     * @description WBNB contract address
     * @type {string}
     */
    WBNB_ADDRESS: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',

    /**
     * @description account address i.e WALLET_ADDRESS
     * @type {string}
     */

    PUBLIC_KEY: process.env.PUBLIC_KEY!,

    /**
     * @description List of supported routers on BSC
     * @type {string[]}
     */
    SUPPORTED_ROUTERS: ['0x10ED43C718714eb63d5aA57B78B54704E256024E'],


    /**
     * @description PANCAKESWAP_ROUTER is the address of the PancakeSwap router
     * @type {string}
     */

    PANCAKESWAP_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',

    /**
     * @description RUGCHECKER_CONTRACT is the address of the RugChecker contract
     * @type {string}
     */
    RUGCHECKER_CONTRACT: '0xbBCB85f038Dc8C8ac0123611C4E0f1CcD748ba6e',


    /**
     * @description AMOUNT OF BNB the bot uses to buy tokens
     * @type {number}
     */
    BNB_BUY_AMOUNT: 0.00001 * 1e18,

    /**
     * @description the amount of buy tax to check for in the token contract 
     */

    MINIMUM_BUY_TAX: 0,


    /**
     * @description the amount of sell tax to check for in the token contract
     */
    MINIMUM_SELL_TAX: 0



}