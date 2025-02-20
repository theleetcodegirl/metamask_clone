import { ethers } from 'ethers';

export const formatEthValue = (weiValue: string) => {
    try {
        const ethValue = ethers.formatEther(weiValue);
        // Format to maximum 6 decimal places
        return (+ethValue).toFixed(6);
    } catch (error) {
        return '0';
    }
};
