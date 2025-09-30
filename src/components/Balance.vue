<template>
  <el-card class="Balance-card">
    <el-statistic
      title="Total Balance"
      :value="displayValue"
      prefix="ETH"
      :precision="2"
      value-style="color: #67C23A; font-size: 24px;"
    >
    
    </el-statistic>
  </el-card>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import { useWallet } from '../composable/useWallet'

const {ethBalance} = useWallet()

// 将 composable 返回的字符串余额转换为 number，供 el-statistic 使用
const displayValue = computed(() => {
  const n = parseFloat(ethBalance.value || '0')
  return Number.isFinite(n) ? n : 0
})
</script>

<style scoped>

</style>
