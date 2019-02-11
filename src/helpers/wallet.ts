import EthCrypto from "eth-crypto";
import * as ethers from "ethers";
import { keychainSave, keychainLoad } from "./keychain";
import { IEncryptedData } from "./types";

const standardPath = "m/44'/60'/0'/0";

let activeIndex: number = 0;
let activeAccount: ethers.Wallet | null = null;
let addresses: string[] = [];

function generatePath() {
  const path = `${standardPath}/${activeIndex}`;
  return path;
}

function generateMnemonic() {
  const entropy = ethers.utils.randomBytes(16);
  const mnemonic = ethers.utils.HDNode.entropyToMnemonic(entropy);
  return mnemonic;
}

function generateAddresses(n: number = 10) {
  if (activeAccount) {
    const mnemonic = activeAccount.mnemonic;
    const array: string[] = [];
    const masterNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    for (let i = 0; i < n; i++) {
      const path = `${standardPath}/${i}`;
      const account = masterNode.derivePath(path);
      const address = account.address;
      array.push(address);
    }

    return array;
  } else {
    console.error("No Active Account");
  }
  return [];
}

export async function createWallet() {
  const mnemonic = generateMnemonic();
  const path = generatePath();
  const account = ethers.Wallet.fromMnemonic(mnemonic, path);
  await saveMnemonic(mnemonic);

  return account;
}

export async function loadWallet() {
  const mnemonic = await loadMnemonic();
  if (mnemonic) {
    const path = generatePath();
    const account = ethers.Wallet.fromMnemonic(mnemonic, path);
    console.log("loadWallet account", account);
    return account;
  }
  return null;
}

export function getAllAddresses(n?: number) {
  addresses = generateAddresses(n);
  return addresses;
}

export function switchActiveAccount(index: number) {
  if (activeAccount) {
    activeIndex = index;
    const path = generatePath();
    activeAccount = ethers.Wallet.fromMnemonic(activeAccount.mnemonic, path);
    return activeAccount.address;
  } else {
    console.error("No Active Account");
  }
  return null;
}

export async function sendTransaction(transaction: any) {
  if (activeAccount) {
    const { hash } = await activeAccount.sendTransaction(transaction);
    return hash;
  } else {
    console.error("No Active Account");
  }
  return null;
}

export async function signMessage(message: any) {
  if (activeAccount) {
    const result = await activeAccount.signMessage(message);
    return result;
  } else {
    console.error("No Active Account");
  }
  return null;
}

export async function encrypt(message: string): Promise<IEncryptedData | null> {
  if (activeAccount) {
    const { privateKey } = activeAccount;
    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const result = await EthCrypto.encryptWithPublicKey(publicKey, message);
    return result;
  } else {
    console.error("No Active Account");
  }
  return null;
}

export async function decrypt(
  encryptedData: IEncryptedData
): Promise<string | null> {
  if (activeAccount) {
    const { privateKey } = activeAccount;
    const result = await EthCrypto.decryptWithPrivateKey(
      privateKey,
      encryptedData
    );
    return result;
  } else {
    console.error("No Active Account");
  }
  return null;
}

// -- Keychain -------------------------------------------------------------- //

const mnemonicKey = "BEAM_ACCOUNT_MNEMONIC";

export async function saveMnemonic(mnemonic: string) {
  await keychainSave(mnemonicKey, mnemonic);
}

export async function loadMnemonic() {
  const mnemonic = await keychainLoad(mnemonicKey);
  return mnemonic;
}
