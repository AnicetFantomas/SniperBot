import {
    constants,
    Contract,
    ethers,
    providers,
    utils,
    Wallet,
} from 'ethers';
import { config } from '../config/config';
import { PANCAKESWAP_ABI } from '../constants';
import { SwapsWrapper } from '../swaps/swaps';
import { sendNotification } from '../telegram';
import { HelpersWrapper } from '../utils/helpers';

class Mempool {
    
    private _wsprovider: providers.WebSocketProvider;
    private _provider: providers.JsonRpcProvider;
    private _pancakeSwap: ethers.utils.Interface;
    private contract: Contract;

}