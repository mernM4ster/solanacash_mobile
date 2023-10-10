import { ETHEREUM_API } from "../../constants/env"
import axios from "axios";

export const getTxOfAddress = async (address, chainId) => {
  const url = `${ETHEREUM_API[chainId]}${address}&page=1&offset=1&sort=desc`;
  const res = await axios.get(url);
  return res.data.result;
}

export const getAllTxOfAddress = async (address, chainId) => {
  const url = `${ETHEREUM_API[chainId]}${address}&startblock=0&endblock=99999999&sort=desc`;
  const res = await axios.get(url);
  return res.data.result;
}