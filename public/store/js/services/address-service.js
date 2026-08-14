import { getState, setState } from "../core/store.js";
import { sleep, uid } from "../core/utils.js";

export const listAddresses = () => getState().addresses;

export async function saveAddress(address) {
  await sleep(200);
  const list = getState().addresses;
  if (address.id) {
    setState({ addresses: list.map((a) => (a.id === address.id ? { ...a, ...address } : a)) });
    return address;
  }
  const created = { ...address, id: uid("addr"), isDefault: list.length === 0 };
  setState({ addresses: [...list, created] });
  return created;
}

export async function deleteAddress(id) {
  await sleep(150);
  setState({ addresses: getState().addresses.filter((a) => a.id !== id) });
}

export function setDefaultAddress(id) {
  setState({ addresses: getState().addresses.map((a) => ({ ...a, isDefault: a.id === id })) });
}

export const defaultAddress = () => getState().addresses.find((a) => a.isDefault) ?? getState().addresses[0] ?? null;
