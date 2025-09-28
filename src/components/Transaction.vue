<template>
  <el-card class="Transaction-card">
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="type" label="Type" width="180"/>
      <el-table-column prop="object" label="Object" width="180"/>
      <el-table-column prop="amount" label="Amount" width="180"/>
      <el-table-column prop="time" label="Time" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import {onMounted, computed} from 'vue';
import { useWallet } from '../composable/useWallet'

const {setAddress, transactions} = useWallet()

onMounted(() => {
  setAddress('0x22b4EA83EA2B4E63EA42165e1f3b25b4FCd2Eb6a')
})

const tableData = computed(() => transactions.value)
</script>


<style scoped>

</style>
