import { ref, watch } from 'vue'
import axios from 'axios'
import { N } from 'ethers'
import { Contract } from 'ethers'

const address = ref<string>('') // ETH地址 字符串形式 初始空
const ethBalance = ref<string>('0') // ETH余额 字符串形式 初始0
const transactions = ref<any[]>([]) // 交易列表 数组形式 初始空
const loading = ref(false) // 加载状态 布尔值 初始false
const error = ref<string | null>(null) // 错误信息 字符串或null 初始null
const tokens = ref<any[]>([]) // 

// 从环境变量读取 Etherscan API Key
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_KEY || ''
const COVALENT_KEY = import.meta.env.VITE_COVALENT_KEY || ''


/**
 * 把 wei（链上最小单位，字符串形式）转换为 ETH 的字符串表示
 * 说明：
 *  - 使用 BigInt 以避免超过 Number 精度的问题（wei 是 10^18 的整数）
 *  - decimals 参数控制展示的小数位数（默认 6）
 *  - 返回格式例子： "1.23456" 或 "0" 或 "123"
 */
function weiToEthString(wei: string, decimals = 6): string {
    try {
        // 将字符串 wei 转成大整数
        const n = BigInt(wei) 

        // 以 10^18 为基数；整数部分 = floor(n / base)
        const base = 10n ** 18n
        const intPart = (n / base).toString() 

        // 小数部分用余数计算，并保证至少 18 位，通过 slice 截取需要的 decimals
        let frac = (n % base).toString().padStart(18, '0').slice(0, decimals)

        // 去掉小数末尾多余的 0（例如 1.230000 -> 1.23）
        frac = frac.replace(/0+$/, '') // 去掉末尾的0

        // 如果没有小数部分就只返回整数部分
        return frac ? `${intPart}.${frac}` : intPart
    } catch {
        // 若传入非数字字符串或环境不支持 BigInt，返回 "0" 作为兜底
        return '0'
    }
}

// 把 Etherscan 的 txlist 映射为表格行：{ type, object, amount, time, hash, raw }
function mapEtherscanTxsToTable(txlist: any[]) {
    return txlist.map(tx => {
        const from = (tx.from || '').toLowerCase()
        const to = (tx.to || '').toLowerCase()
        const current = (address.value || '').toLowerCase()

        const isOutgoing = from === current && from !== ''
        const type = isOutgoing ? 'Outgoing' : 'Incoming'
        const object = isOutgoing ? tx.to : tx.from
        const amount = `${weiToEthString(tx.value || '0', 6)} ETH`
        const time = tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toLocaleString() : (tx.blockNumber ? `block ${tx.blockNumber}` : '')

        return {
            type,
            object,
            amount,
            time,
            hash:tx.hash,
            raw:tx
        }
    })
}

// 把整数单位 balance (string) 按 decimals 转成可阅读字符串（precision 可调）
function tokenBalanceToString(balance: string, decimals = 18, precision = 6) {
  try {
    const n = BigInt(balance || '0')
    const base = 10n ** BigInt(decimals)
    const intPart = (n / base).toString()
    let frac = (n % base).toString().padStart(decimals, '0').slice(0, precision)
    frac = frac.replace(/0+$/, '')
    return frac ? `${intPart}.${frac}` : intPart
  } catch {
    return '0'
  }
}

async function fetchTokens(addr: string, chainId = 1) {
    if (!addr) { tokens.value = []; return}
    loading.value = true
    try {
        const url = `https://api.covalenthq.com/v1/${chainId}/address/${addr}/balances_v2/`
        const res = await axios.get(url, {
            params: {key:COVALENT_KEY}
        })
        const items = res.data?.data?.items ?? []
        tokens.value = items.map((it: any) => {
            const balance = it.balance ?? '0'
            const decimals = Number(it.contract_decimals ?? it.contract_decimals === 0 ?it.contract_decimals:18)
            return {
                contract_address:it.contract_address,
                name: it.contract_name,
                symbol: it.contract_ticker_symbol,
                balance,
                decimals,
                formatted: tokenBalanceToString(String(balance) ,decimals, 6),
            }
        })
    } catch(e: any) {
        console.error('fetchTokens error:', e)
        tokens.value = []
    } finally {
        loading.value = false
    }
}

/**
 * 向 Etherscan 请求指定地址的 ETH 余额
 * - 参数 addr：要查询的地址字符串
 * - 行为：更新 ethBalance、loading、error 三个 ref
 * - 注意：Etherscan 返回的是 wei（字符串）；这里把它转换为可读的 ETH 字符串
 */
async function fetchBalance(addr: string) {
    // 若地址为空则快速返回并把余额设为 "0"
    if (!addr) { ethBalance.value = '0'; return }

    // 开始请求：设置 loading 并清空上次错误信息
    loading.value = true; error.value = null
    try {
        // 发起 GET 请求到 Etherscan API（module=account & action=balance）
        const res = await axios.get('https://api.etherscan.io/api', {
            params: {
                module: 'account',
                action: 'balance',
                address: addr,
                tag: 'latest',
                apikey: ETHERSCAN_API_KEY
            }
        })
        // 如果返回里有 result（wei 字符串），用 weiToEthString 转换后赋值
        ethBalance.value = res.data?.result ? weiToEthString(res.data.result) : '0'
    } catch (e: any) {
        // 请求出错：把错误信息记录到 error，同时把余额设为 "0"
        error.value = e.message || String(e)
        ethBalance.value = '0'
    } finally {
        // 无论成功或失败，清除 loading 标志
        loading.value = false
    }
}
/**
 * 向 Etherscan 请求指定地址的交易列表（txlist）
 * - 更新 transactions、loading
 * - 若接口返回不是数组，则把 transactions 设为空数组
 */
async function fetchTxs(addr: string) {
    if (!addr) { transactions.value = []; return }
    loading.value = true
    try {
        const res = await axios.get('https://api.etherscan.io/api', {
            params: {
                module: 'account',
                action: 'txlist',
                address: addr,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc',
                apikey: ETHERSCAN_API_KEY
            }
        })
        const raw = Array.isArray(res.data?.result) ? res.data.result : []
        transactions.value = mapEtherscanTxsToTable(raw)
        console.log(res.data)
    } catch(e: any) {
        console.error('fetchTxs error:', e)
        transactions.value = []
    } finally {
        loading.value = false
    }
}

/**
 * 同时并行请求余额与交易（提高效率）
 * - 使用 Promise.all 并行发起 fetchBalance 和 fetchTxs
 */
async function fetchAll(addr: string) {
    await Promise.all([fetchBalance(addr),fetchTxs(addr)])
}

/**
 * 监听 address 的变化：
 * - 当外部通过 setAddress 改变 address.value 时会触发 watch 回调
 * - 回调里调用 fetchAll 自动刷新当前地址的所有相关数据
 * - 若想避免频繁请求（例如用户在输入框连输），可以在外层对 setAddress 做防抖处理
 */
watch(address,(v) => {if (v) fetchAll(v) })
/**
 * 导出 composable 接口：
 * - address（ref）可以在组件中直接读取或传入 setAddress 修改
 * - setAddress 会触发上面的 watch 进而自动请求数据
 * - 还暴露了 fetchBalance/fetchTxs/fetchAll 以便组件按需手动刷新
 */
export function useWallet() {
    return {
        address,
        setAddress:(a : string) => (address.value = a),
        ethBalance,
        transactions,
        loading,
        error,
        fetchAll,
        fetchBalance,
        fetchTxs,
        tokens,
        fetchTokens
    }
}
