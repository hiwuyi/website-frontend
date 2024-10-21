import { mainnet, arbitrum } from 'viem/chains'
import { defaultWagmiConfig } from '@web3modal/wagmi/vue'

const SWAN_MAINNET = {
  id: Number(254),
  name: 'Swan Mainnet',
  network: 'SWAN',
  iconUrl: 'https://i.imgur.com/Q3oIdip.png',
  iconBackground: '#000000',
  nativeCurrency: {
    decimals: 18,
    name: 'Swan ETH',
    symbol: 'sETH',
  },
  rpcUrls: {
    default: {
      http: [String('https://mainnet-internal.swanchain.io')],
    },
  },
  blockExplorers: {
    default: {
      name: 'Swan Mainnet Explorer',
      url: 'https://mainnet-explorer.swanchain.io/' || '', // process.env.NEXT_PUBLIC_L2_PROXIMA_EXPLORER_URL || '',
    },
  },
  testnet: true,
}

// 1. Define constants
const projectId = '96edc188f4c9ba78898f2145f6210614'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chains = [SWAN_MAINNET] //mainnet, arbitrum
const config = defaultWagmiConfig({
  chains, // required
  projectId, // required
  metadata, // required
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
})

export default {
  projectId,
  config
}