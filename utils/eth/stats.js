import { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { AppContext } from "../AppContext";
import supportedChains from "../../constants/chains";
import { CONTRACT_ADDRESS } from "../../constants/env";
import { FIAT_VALUES } from "../../constants/offers";
import ABI from "../../constants/abi.json";

const useStats = () => {
    const { chainID } = useContext(AppContext);
    const [isEthLoading, setIsEthLoading] = useState(false);
    const [ethStatsData, setEthStatsData] = useState([]);
    const [ethRefresh, setEthRefresh] = useState(false);

    const getStatsData = async () => {
        let orders = [];
		const url = supportedChains.filter((item) => item.chain_id === chainID)[0].rpc_url;
		const web3 = new Web3(new Web3.providers.HttpProvider(url));
		const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS[chainID]);
		const ordersData = await contract.methods.getOrders().call();

        for (const order of ordersData) {
			const offer = await contract.methods.getOfferByIndex(order.offer_index).call();
			const priceInfo = FIAT_VALUES.filter(item => item.value === offer.fiat.toString());

            orders.push({
                buyer: offer.owner,
                seller: order.seller,
                fiatAmount: order.receive_amount * 1,
                createdAt: order.created_at,
                status: order.status,
                fiat: offer.fiat.toString(),
                price: priceInfo[0].price,
            });
		}

        return orders;
    }

    useEffect(() => {
        if (!chainID) {
			return;
		}
        (
			async () => {
				setIsEthLoading(true);
				const newStatsData = await getStatsData();
				setEthStatsData(newStatsData);
				setIsEthLoading(false);
			}
		)();
    }, [chainID, ethRefresh]);

    return { isEthLoading, ethStatsData, ethRefresh, setEthRefresh}
}

export default useStats;