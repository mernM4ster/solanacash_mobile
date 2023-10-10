import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { AppContext } from "../AppContext";
import supportedChains from "../../constants/chains";
import { ETH_CRYPTO_VALUES } from "../../constants/eth/offers";
import { CONTRACT_ADDRESS } from "../../constants/env";
import ABI from "../../constants/abi.json";
import TOKEN_ABI from "../../constants/token_abi.json";

const useWallet = () => {
	const { chainID, evmConnector, walletAddress } = useContext(AppContext);
	const [isEthLoading, setIsEthLoading] = useState(false);
	const [allEthTokens, setAllEthTokens] = useState([]);

	const getTokens = async () => {
		let orders = [];
		let filterOrders = [];
		const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
		const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
		const orderIndexes = await contract.methods.getOrderIndexesOfUser(walletAddress).call();

		for (const orderIndex of orderIndexes) {
			let decimal = 18;
			const order = await contract.methods.getOrderByIndex(orderIndex).call();
			console.log(order)
			if (order.status > 0) continue;
			const offer = await contract.methods.getOfferByIndex(order.offer_index).call();
			if (!offer.eth) {
				const contract = new web3.eth.Contract(TOKEN_ABI, offer.token_address);
				decimal = await contract.methods.decimals().call();
			}

			const tokenName = ETH_CRYPTO_VALUES[chainID].filter(item => item.value === offer.token_address.toString());
			const cryptoAmount = order.sell_amount / (10 ** decimal);
			orders.push({
				balance: cryptoAmount,
				tokenName: offer.eth ? ETH_CRYPTO_VALUES[chainID][0].title : tokenName[0].title,
			});
		}

		orders.forEach(item => {
			const data = filterOrders.filter(subItem => item.tokenName === subItem.tokenName);
			if (data.length > 0) {
					filterOrders = filterOrders.map(subItem => item.tokenName === subItem.tokenName && {...item, balance: item.balance + subItem.balance});
			} else {
					filterOrders.push(item);
			}
		});

		return filterOrders;
	}

	useEffect(() => {
		if (!chainID || !evmConnector.connected) {
			return;
		}
		(
			async () => {
				setIsEthLoading(true);
				const newEthTokens = await getTokens();
				setAllEthTokens(newEthTokens);
				setIsEthLoading(false);
			}
		)();
	}, [chainID]);

	return { isEthLoading, allEthTokens}
}

export default useWallet;