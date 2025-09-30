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
import {computed} from 'vue';
import { useWallet } from '../composable/useWallet'

const {transactions} = useWallet()

const tableData = computed(() => transactions.value)
</script>


<style scoped>

</style>
