import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { AppContext } from "../AppContext";
import { CONTRACT_ADDRESS } from "../../constants/env";
import ABI from "../../constants/abi.json";
import supportedChains from "../../constants/chains";

const useAccount = () => {
	const { chainID, walletAddress, evmConnector } = useContext(AppContext);
	const [isEthLoading, setIsEthLoading] = useState(false);
    const [ethUserData, setEthUserData] = useState({});

    const getEthUser = async () => {
		const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
		const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
        const userData = await contract.methods.getUser(walletAddress.toString()).call();
        console.log("userData", userData)

        return {...userData, 
			account: userData.user_address !== "0x0000000000000000000000000000000000000000" ? userData.user_address : null,
			region: userData.region * 1};
    }

    const createEthUser = async () => {
        if (!chainID || !evmConnector.connected) {
			return;
		}
		const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
		const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
        const txData = contract.methods.createUser().encodeABI();
		const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
        const userInfo = await contract.methods.getUser(walletAddress).call();

        return userInfo.user_address;
    }
    
    const updateEthProfile = async ({region}) => {
        if (!chainID || !evmConnector.connected) {
			return;
		}
		const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
		const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
        const txData = contract.methods.updateUser(region).encodeABI();
		const txHash = await evmConnector.sendTransaction({from: walletAddress, data: txData, to: CONTRACT_ADDRESS[chainID], gasLimit: 3141592});
    }

	useEffect(() => {
		if (!chainID || !evmConnector.connected) {
			return;
		}
		(
			async () => {
				setIsEthLoading(true);
				const newUserData = await getEthUser();
				setEthUserData(newUserData);
				setIsEthLoading(false);
			}
		)();
	}, [chainID, evmConnector]);

	return { isEthLoading, ethUserData, updateEthProfile, createEthUser, getEthUser };
}

export default useAccount;